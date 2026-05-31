"use client";

import { useActionState, type ReactNode } from "react";

import { updateSettingsAction, type SettingsActionState } from "../../lib/settings/actions";
import type { SettingsData } from "../../lib/settings/data";
import Button from "../ui/Button";
import Card from "../ui/Card";

type SettingsPanelProps = {
  settings: SettingsData;
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

function SettingsMessage({ state }: { state: SettingsActionState }) {
  if (state.status === "idle" || !state.message) return null;

  const tone =
    state.status === "error"
      ? "border-[var(--border)] bg-[var(--surface-subtle)] text-[#7f1d1d]"
      : "border-[rgba(15,93,70,0.18)] bg-[rgba(15,93,70,0.08)] text-[var(--accent)]";

  return <p className={joinClasses("inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium", tone)}>{state.message}</p>;
}

function SettingsForm({ settings }: SettingsPanelProps) {
  const [state, formAction, isPending] = useActionState(
    (_state: SettingsActionState, formData: FormData) => updateSettingsAction(formData),
    {
      status: "idle",
      message: "",
    } satisfies SettingsActionState
  );

  return (
    <form action={formAction} className="grid gap-4 lg:grid-cols-2">
      <SectionCard
        eyebrow="Account"
        title="Account details"
        description="Identity and session information used across the dashboard."
      >
        <div className="grid gap-3">
          <RowItem label="Display name" value={settings.account.displayName || "Not set"} />
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" disabled={isPending} className="w-fit">
            {isPending ? "Saving..." : "Save settings"}
          </Button>
          <SettingsMessage state={state} />
        </div>
      </div>

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
    </form>
  );
}

export function WorkspaceSettings({ settings }: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      <SettingsForm settings={settings} />
    </div>
  );
}

export function MobileSettingsPanel({ settings }: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Settings</p>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Workspace settings</h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
          Workspace configuration lives here inside the mobile dashboard flow without leaving the page.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
