import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { ProtectedRouteGuard } from "../../components/auth/AuthRouteGuard";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { DASHBOARD_ROUTE } from "../../lib/auth/flow";
import { getPostAuthDestination } from "../../lib/auth/post-auth";
import { getServerSupabaseClient } from "../../lib/supabase/server";
import { getSettingsData } from "../../lib/settings/data";
import { updateSettingsAction } from "../../lib/settings/actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Settings | Everyday Forms",
  description: "Manage account, sharing, security, and default workspace controls.",
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] p-5 shadow-none">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">{eyebrow}</p>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
        </div>
        {children}
      </div>
    </Card>
  );
}

function RowItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3">
      <span className="text-sm font-medium text-[var(--muted-foreground)]">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-semibold text-[var(--foreground)]">{value}</span>
    </div>
  );
}

function EditableNumberRow({
  label,
  hint,
  name,
  value,
  placeholder,
}: {
  label: string;
  hint: string;
  name: string;
  value: number | null;
  placeholder: string;
}) {
  return (
    <label className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3">
      <div className="space-y-1">
        <span className="block text-sm font-medium text-[var(--foreground)]">{label}</span>
        <span className="block text-sm text-[var(--muted-foreground)]">{hint}</span>
      </div>
      <input
        type="number"
        name={name}
        min={0}
        inputMode="numeric"
        placeholder={placeholder}
        defaultValue={value ?? ""}
        className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
      />
    </label>
  );
}

function EditableToggleRow({
  label,
  hint,
  name,
  enabled,
}: {
  label: string;
  hint: string;
  name: string;
  enabled: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3">
      <div className="min-w-0">
        <span className="block text-sm font-medium text-[var(--foreground)]">{label}</span>
        <span className="block text-sm text-[var(--muted-foreground)]">{hint}</span>
      </div>
      <input
        type="checkbox"
        name={name}
        defaultChecked={enabled}
        className="h-5 w-5 shrink-0 rounded border-[var(--border)] text-[var(--accent)] accent-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      />
    </label>
  );
}

async function submitSettingsAction(formData: FormData) {
  "use server";

  await updateSettingsAction(formData);
}

export default async function SettingsPage() {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const destination = await getPostAuthDestination(supabase, DASHBOARD_ROUTE);
  if (destination !== DASHBOARD_ROUTE) {
    redirect(destination);
  }

  const [settings, profileResult] = await Promise.all([
    getSettingsData(supabase, user.id),
    supabase.from("profiles").select("email,display_name,account_type").eq("id", user.id).maybeSingle(),
  ]);

  const profile = profileResult.data;

  return (
    <ProtectedRouteGuard expectedPath="/settings">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-none sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">Settings</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">Control center</h1>
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
              Keep account, defaults, sharing, notification, and security preferences organized in one calm control panel.
            </p>
          </div>
          <Button href="/dashboard" variant="secondary" size="sm" className="w-fit">
            Back to dashboard
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            eyebrow="Account"
            title="Account details"
            description="Identity and session information used across the dashboard."
          >
            <div className="grid gap-3">
              <RowItem label="Display name" value={profile?.display_name || settings.account.displayName || "Not set"} />
              <RowItem label="Email" value={settings.account.email} />
              <RowItem label="Account type" value={settings.account.accountType} />
              <RowItem label="Session" value="Managed by Supabase" />
              <Button href="/logout" variant="secondary" size="sm" className="w-fit">
                Logout
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Form defaults"
            title="Default publishing behavior"
            description="These preferences inform how new forms are configured."
          >
            <div className="grid gap-3">
              <RowItem
                label="Default expiry time"
                value={settings.defaults.defaultExpiryMinutes ? `${settings.defaults.defaultExpiryMinutes} minutes` : "Never"}
              />
              <RowItem
                label="Default response limit"
                value={settings.defaults.defaultResponseLimit ? String(settings.defaults.defaultResponseLimit) : "Unlimited"}
              />
              <RowItem label="Default publish state" value={settings.defaults.defaultPublishState ? "Published" : "Draft"} />
            </div>
          </SectionCard>

          <form action={submitSettingsAction} className="grid gap-4 lg:col-span-2 lg:grid-cols-2">
            <SectionCard
              eyebrow="Form defaults"
              title="Default values"
              description="These are saved to your workspace profile and reused when forms are created."
            >
              <div className="grid gap-3">
                <EditableNumberRow
                  label="Default expiry time"
                  hint="Leave empty to keep new forms open-ended."
                  name="defaultExpiryMinutes"
                  value={settings.defaults.defaultExpiryMinutes}
                  placeholder="Never"
                />
                <EditableNumberRow
                  label="Default response limit"
                  hint="Leave empty to allow unlimited responses."
                  name="defaultResponseLimit"
                  value={settings.defaults.defaultResponseLimit}
                  placeholder="Unlimited"
                />
                <EditableToggleRow
                  label="Default publish state"
                  hint="Start newly created forms as published."
                  name="defaultPublishState"
                  enabled={settings.defaults.defaultPublishState}
                />
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Sharing settings"
              title="Link and QR behavior"
              description="Sharing controls keep public form distribution fast and predictable."
            >
              <div className="grid gap-3">
                <EditableToggleRow
                  label="Enable QR generation"
                  hint="Allow QR previews and downloads in the share modal."
                  name="enableQrGeneration"
                  enabled={settings.sharing.enableQrGeneration}
                />
                <EditableToggleRow
                  label="Auto-generate share links"
                  hint="Create a public link automatically when a form is published."
                  name="autoGenerateShareLinks"
                  enabled={settings.sharing.autoGenerateShareLinks}
                />
                <RowItem label="Preview format" value="/{name}/{token}" />
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Notifications"
              title="Email alerts"
              description="Workspace email alerts are backed by your profile preference and can feed Resend later."
            >
              <div className="grid gap-3">
                <EditableToggleRow
                  label="Enable email alerts"
                  hint="Allow future submission notifications to be sent by email."
                  name="enableEmailAlerts"
                  enabled={settings.notifications.enableEmailAlerts}
                />
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Security settings"
              title="Submission safeguards"
              description="These toggles prepare the system for stricter intake rules."
            >
              <div className="grid gap-3">
                <EditableToggleRow
                  label="Allow anonymous submissions"
                  hint="Keep the form open to users without an account."
                  name="allowAnonymousSubmissions"
                  enabled={settings.security.allowAnonymousSubmissions}
                />
                <EditableToggleRow
                  label="Restrict multiple submissions"
                  hint="Future-ready duplicate submission control."
                  name="restrictMultipleSubmissions"
                  enabled={settings.security.restrictMultipleSubmissions}
                />
                <EditableToggleRow
                  label="Require email validation"
                  hint="Future-ready email confirmation guard."
                  name="requireEmailValidation"
                  enabled={settings.security.requireEmailValidation}
                />
              </div>
            </SectionCard>

            <div className="lg:col-span-2 flex flex-col gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">Save changes</p>
                <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                  Changes are stored on your profile and reflected across the dashboard after save.
                </p>
              </div>
              <Button type="submit" className="w-fit">
                Save settings
              </Button>
            </div>
          </form>

          <SectionCard
            eyebrow="Danger zone"
            title="Destructive actions"
            description={`You currently own ${settings.danger.ownedFormsCount} form${settings.danger.ownedFormsCount === 1 ? "" : "s"} and ${settings.danger.publishedFormsCount} published form${settings.danger.publishedFormsCount === 1 ? "" : "s"}.`}
          >
            <div className="grid gap-3">
              <Button variant="secondary" size="sm" className="justify-start">
                Delete account
              </Button>
              <Button variant="secondary" size="sm" className="justify-start">
                Delete all forms
              </Button>
              <Button variant="secondary" size="sm" className="justify-start">
                Revoke all share links
              </Button>
            </div>
          </SectionCard>
        </div>
      </main>
    </ProtectedRouteGuard>
  );
}
