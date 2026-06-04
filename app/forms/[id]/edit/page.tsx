import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ProtectedRouteGuard } from "../../../../components/auth/AuthRouteGuard";
import EditFormEditor from "../../../../components/dashboard/EditFormEditor";
import type { CreateFormWizardField } from "../../../../components/dashboard/CreateFormModalSteps";
import { getPostAuthDestination } from "../../../../lib/auth/post-auth";
import { DASHBOARD_ROUTE } from "../../../../lib/auth/flow";
import { getDashboardData, type DashboardForm } from "../../../../lib/dashboard/dashboard";
import { createPageMetadata } from "../../../../lib/seo";
import { getServerSupabaseClient } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

type PageParams = {
  id: string;
};

type EditFormFieldRow = {
  id: string;
  label: string;
  field_type: "text" | "textarea" | "email" | "number" | "checkbox" | "select";
  is_required: boolean;
  options: unknown;
  position: number;
};

type EditableForm = DashboardForm & {
  fields: CreateFormWizardField[];
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
}

async function loadForm(id: string): Promise<EditableForm | null> {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [data, destination] = await Promise.all([
    getDashboardData(supabase, user.id),
    getPostAuthDestination(supabase, DASHBOARD_ROUTE),
  ]);

  if (destination !== DASHBOARD_ROUTE) {
    redirect(destination);
  }

  const form = data.forms.find((item) => item.id === id);

  if (!form) {
    return null;
  }

  const fieldsResult = await supabase
    .from("form_fields")
    .select("id,label,field_type,is_required,options,position")
    .eq("form_id", form.id)
    .order("position", { ascending: true });

  if (fieldsResult.error) {
    throw fieldsResult.error;
  }

  const fields = (fieldsResult.data ?? []) as EditFormFieldRow[];

  return {
    ...form,
    fields: fields.map((field) => ({
      id: field.id,
      label: field.label,
      type: field.field_type,
      required: field.is_required,
      options: asStringArray(field.options),
    })),
  };
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { id } = await params;
  const form = await loadForm(id);

  return createPageMetadata({
    title: form ? `${form.title} | Edit form` : "Edit form",
    description: form ? `Edit ${form.title}` : "Edit an existing form.",
    path: `/forms/${id}/edit`,
    noindex: true,
  });
}

export default async function EditFormPage({ params }: { params: Promise<PageParams> }) {
  const { id } = await params;
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [data, destination] = await Promise.all([
    getDashboardData(supabase, user.id),
    getPostAuthDestination(supabase, DASHBOARD_ROUTE),
  ]);

  if (destination !== DASHBOARD_ROUTE) {
    redirect(destination);
  }

  const form = data.forms.find((item) => item.id === id);

  if (!form) {
    notFound();
  }

  const fieldsResult = await supabase
    .from("form_fields")
    .select("id,label,field_type,is_required,options,position")
    .eq("form_id", form.id)
    .order("position", { ascending: true });

  if (fieldsResult.error) {
    throw fieldsResult.error;
  }

  const fields = (fieldsResult.data ?? []) as EditFormFieldRow[];

  return (
    <ProtectedRouteGuard>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Edit form</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">{form.title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
              Update the form details, then return to the dashboard when you're done.
            </p>
          </div>

          <EditFormEditor
            form={{
              ...form,
              fields: fields.map((field) => ({
                id: field.id,
                label: field.label,
                type: field.field_type,
                required: field.is_required,
                options: asStringArray(field.options),
              })),
            }}
          />
        </div>
      </main>
    </ProtectedRouteGuard>
  );
}
