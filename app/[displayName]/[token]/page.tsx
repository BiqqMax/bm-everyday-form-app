import type { Metadata } from "next";

import { PublicFormClient, type PublicFormView } from "../../f/[token]/public-form-client";
import { createPageMetadata } from "../../../lib/seo";
import { createClient } from "../../../lib/supabase/server";
import { getFormByPublicToken } from "../../../lib/forms/public-resolver";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageParams = {
  displayName: string;
  token: string;
};

type PublicFormRow = NonNullable<Awaited<ReturnType<typeof getFormByPublicToken>>>;
type PublicFormField = PublicFormView["fields"][number];
type UserRow = {
  display_name: string | null;
  avatar_url?: string | null;
};

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toPublicFormView(form: PublicFormRow, owner: UserRow | null, fields: PublicFormField[]): PublicFormView {
  return {
    id: form.id,
    title: form.title,
    description: form.description,
    displayName: owner?.display_name ?? "",
    avatarUrl: owner?.avatar_url ?? null,
    qrShareToken: form.qr_share_token,
    fields,
    isPublished: form.is_public,
    expiresAt: form.expires_at,
    responseLimit: form.response_limit,
    responseCount: form.response_count,
  };
}

function statusMessage(form: PublicFormView | null) {
  if (!form) {
    return {
      title: "Form not found",
      description: "This form link is invalid or no longer available.",
    };
  }

  if (!form.isPublished) {
    return {
      title: "This form is not published yet",
      description: "The owner has not made this form public.",
    };
  }

  if (form.expiresAt && new Date(form.expiresAt).getTime() < Date.now()) {
    return {
      title: "This form has closed",
      description: "The response window for this form has expired.",
    };
  }

  if (
    typeof form.responseLimit === "number" &&
    typeof form.responseCount === "number" &&
    form.responseCount >= form.responseLimit
  ) {
    return {
      title: "This form is full",
      description: "The response limit for this form has already been reached.",
    };
  }

  return null;
}

async function loadPublicForm(token: string): Promise<PublicFormView | null> {
  const supabase = await createClient();

  try {
    const form = await getFormByPublicToken(supabase, token);

    if (!form) {
      return null;
    }

    const [ownerResult, fieldsResult] = await Promise.all([
      supabase.from("profiles").select("display_name,avatar_url").eq("id", form.owner_id).maybeSingle(),
      supabase
        .from("form_fields")
        .select("id,label,field_type,is_required,options,position")
        .eq("form_id", form.id)
        .order("position", { ascending: true }),
    ]);

    if (ownerResult.error) {
      throw ownerResult.error;
    }

    if (fieldsResult.error) {
      throw fieldsResult.error;
    }

    const owner = ownerResult.data as UserRow | null;
    const fields = (fieldsResult.data ?? []).map((field) => ({
      id: field.id,
      label: field.label,
      type: field.field_type,
      required: field.is_required,
      options: Array.isArray(field.options) ? field.options.filter((option): option is string => typeof option === "string") : [],
      position: field.position,
    }));

    return toPublicFormView(form, owner, fields);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { token } = await params;
  const resolvedToken = safeDecode(token);
  const form = await loadPublicForm(resolvedToken);

  return createPageMetadata({
    title: form?.title ? form.title : "Public form",
    description: form?.description || "Submit a public form response.",
    path: `/f/${resolvedToken}`,
    noindex: true,
  });
}

function StatusBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <h2 className="text-lg font-semibold text-amber-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-amber-900">{description}</p>
      <p className="mt-4 text-sm text-amber-800">
        Please check the link with the form owner or try again later.
      </p>
    </div>
  );
}

export default async function VanityPublicFormPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params;
  const token = safeDecode(resolvedParams.token);
  const displayName = safeDecode(resolvedParams.displayName);
  const form = await loadPublicForm(token);
  const status = statusMessage(form);

  return (
    <main className="min-h-screen bg-white dark:bg-[#06140F] text-neutral-900 dark:text-neutral-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[600px] flex-col px-4 py-8 sm:py-10">
        {status ? (
          <StatusBlock title={status.title} description={status.description} />
        ) : form ? (
          <PublicFormClient
            form={{
              ...form,
              displayName: displayName || form.displayName,
            }}
          />
        ) : (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
            <h2 className="text-lg font-semibold text-rose-950">We couldn't load this form</h2>
            <p className="mt-2 text-sm leading-6 text-rose-900">
              The link may be incorrect, expired, or no longer available.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
