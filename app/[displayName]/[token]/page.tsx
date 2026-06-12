import type { Metadata } from "next";

import { PublicFormClient } from "../../f/[token]/public-form-client";
import {
  loadPublicForm,
  statusMessage,
  type PublicFormView,
} from "../../../lib/forms/public-form-loader";
import { createPageMetadata } from "../../../lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageParams = {
  displayName: string;
  token: string;
};

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
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
