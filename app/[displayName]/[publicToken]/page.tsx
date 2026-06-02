import type { Metadata } from "next";

import { createClient } from "../../../lib/supabase/server";
import { getPublicFormDetails } from "../../../lib/forms/public-form";
import { PublicFormClient, type PublicFormView } from "./public-form-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageParams = {
  displayName: string;
  publicToken: string;
};

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toPublicFormView(
  details: Awaited<ReturnType<typeof getPublicFormDetails>>,
  fallbackDisplayName: string
): PublicFormView | null {
  if (!details) {
    return null;
  }

  return {
    id: details.id,
    title: details.title,
    description: details.description ?? "",
    displayName: details.ownerDisplayName ?? fallbackDisplayName,
    publicToken: details.publicToken,
    fields: details.fields,
    isPublished: details.isPublic,
    expiresAt: details.expiresAt,
    responseLimit: details.responseLimit,
    responseCount: details.responseCount,
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

async function loadPublicForm(displayName: string, publicToken: string): Promise<PublicFormView | null> {
  const supabase = await createClient();

  try {
    const details = await getPublicFormDetails(supabase, publicToken);
    return toPublicFormView(details, displayName);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { displayName, publicToken } = await params;
  const form = await loadPublicForm(safeDecode(displayName), safeDecode(publicToken));

  return {
    title: form?.title ? `${form.title}` : "Public form",
    description: form?.description || "Submit a public form response.",
  };
}

export default async function PublicFormPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params;
  const displayName = safeDecode(resolvedParams.displayName);
  const publicToken = safeDecode(resolvedParams.publicToken);
  const form = await loadPublicForm(displayName, publicToken);
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
