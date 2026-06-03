import type { Metadata } from "next";

import { createClient } from "../../../lib/supabase/server";
import { getFormByPublicToken } from "../../../lib/forms/public-resolver";
import { PublicFormClient, type PublicFormView } from "./public-form-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageParams = {
  token: string;
};

type PublicFormRow = NonNullable<Awaited<ReturnType<typeof getFormByPublicToken>>>;
type PublicFormField = PublicFormView["fields"][number];
type ProfileRow = {
  display_name: string | null;
};

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toPublicFormView(
  form: PublicFormRow,
  ownerDisplayName: string | null,
  fields: PublicFormField[],
): PublicFormView {
  return {
    id: form.id,
    title: form.title,
    description: form.description,
    displayName: ownerDisplayName ?? "",
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

    const [profileResult, fieldsResult] = await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", form.owner_id).maybeSingle(),
      supabase
        .from("form_fields")
        .select("id,label,field_type,is_required,options,position")
        .eq("form_id", form.id)
        .order("position", { ascending: true }),
    ]);

    if (profileResult.error) {
      throw profileResult.error;
    }

    if (fieldsResult.error) {
      throw fieldsResult.error;
    }

    const profile = profileResult.data as ProfileRow | null;
    const fields = (fieldsResult.data ?? []).map((field) => ({
      id: field.id,
      label: field.label,
      type: field.field_type,
      required: field.is_required,
      options: Array.isArray(field.options) ? field.options.filter((option): option is string => typeof option === "string") : [],
      position: field.position,
    }));

    return toPublicFormView(form, profile?.display_name ?? null, fields);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { token } = await params;
  const form = await loadPublicForm(safeDecode(token));

  return {
    title: form?.title ? `${form.title}` : "Public form",
    description: form?.description || "Submit a public form response.",
  };
}

export default async function PublicFormPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params;
  const token = safeDecode(resolvedParams.token);
  const form = await loadPublicForm(token);
  const status = statusMessage(form);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-8 text-white sm:px-10">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-300">Public response</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{form?.title ?? "Public form"}</h1>
            {form?.description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">{form.description}</p> : null}
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {status ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="text-lg font-semibold text-amber-950">{status.title}</h2>
                <p className="mt-2 text-sm leading-6 text-amber-900">{status.description}</p>
                <p className="mt-4 text-sm text-amber-800">Please check the link with the form owner or try again later.</p>
              </div>
            ) : form ? (
              <PublicFormClient form={form} />
            ) : (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
                <h2 className="text-lg font-semibold text-rose-950">We couldn't load this form</h2>
                <p className="mt-2 text-sm leading-6 text-rose-900">The link may be incorrect, expired, or no longer available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
