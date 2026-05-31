"use client";

import { useActionState, useMemo, useState } from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import type { DashboardActionState } from "../../lib/dashboard/actions";
import { createFormAction, deleteFormAction, updateFormAction } from "../../lib/dashboard/actions";
import { buildPublicFormUrl, getShareStatus, getShareStatusLabel } from "../../lib/forms/public";
import type { DashboardData, DashboardForm, DashboardSubmission } from "../../lib/dashboard/dashboard";
import type { SettingsData } from "../../lib/settings/data";
import ShareModal from "./ShareModal";
import { useDesktopTab } from "./DesktopTabContext";
import { MobileSettingsPanel, WorkspaceSettings } from "./SettingsPanels";

type DashboardSource = DashboardData & Record<string, unknown>;
type MobileTab = "home" | "forms" | "responses" | "settings";
type FormVisibilityFilter = "all" | "public" | "private";
type ShareTarget = {
  form: DashboardForm;
  shareUrl: string;
};

const initialActionState: DashboardActionState = {
  status: "idle",
  message: "",
};

const MOBILE_TABS: Array<{ id: MobileTab; label: string }> = [
  { id: "home", label: "Home" },
  { id: "forms", label: "Forms" },
  { id: "responses", label: "Responses" },
  { id: "settings", label: "Settings" },
];

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function formatDateLong(value: string | null) {
  if (!value) return "No submissions yet";

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function averagePerForm(totalSubmissions: number, totalForms: number) {
  if (!totalForms) return 0;
  return totalSubmissions / totalForms;
}

function ActionMessage({ state }: { state: DashboardActionState }) {
  if (state.status === "idle" || !state.message) return null;

  const tone =
    state.status === "error"
      ? "border-[var(--border)] bg-[var(--surface-subtle)] text-[#7f1d1d]"
      : "border-[rgba(15,93,70,0.18)] bg-[rgba(15,93,70,0.08)] text-[var(--accent)]";

  return <p className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${tone}`}>{state.message}</p>;
}

function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] p-6 shadow-none">
      <div className="space-y-4">
        <div className="inline-flex rounded-full border border-[rgba(15,93,70,0.16)] bg-[rgba(15,93,70,0.06)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
          Empty state
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{title}</h3>
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
        </div>
        {actionHref && actionLabel ? (
          <Button href={actionHref} variant="secondary" size="sm" className="w-fit">
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  meta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">{eyebrow}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
      </div>
      {meta ? <p className="text-sm text-[var(--muted-foreground)] sm:text-right">{meta}</p> : null}
    </div>
  );
}




function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{label}</p>
        <p className="text-[1.65rem] font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">{hint}</p>
      </div>
    </Card>
  );
}

function CompactStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] p-3 shadow-none">
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{label}</p>
        <p className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
        <p className="text-xs leading-5 text-[var(--muted-foreground)]">{hint}</p>
      </div>
    </Card>
  );
}

function VisibilityBadge({ isPublic }: { isPublic: boolean }) {
  return (
    <span
      className={joinClasses(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        isPublic
          ? "border-[rgba(15,93,70,0.16)] bg-[rgba(15,93,70,0.06)] text-[var(--accent)]"
          : "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--muted-foreground)]"
      )}
    >
      {isPublic ? "Public" : "Private"}
    </span>
  );
}

function SubmissionPreviewCard({ submission }: { submission: DashboardSubmission }) {
  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] p-5 shadow-none">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-base font-semibold tracking-tight text-[var(--foreground)]">{submission.formTitle}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{formatDateLong(submission.createdAt)}</p>
          </div>
          <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
            {submission.answers.length} answers
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {submission.answers.length ? (
            submission.answers.map((answer) => (
              <div key={`${submission.id}-${answer.fieldId}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{answer.fieldLabel}</p>
                <p className="mt-2 break-words text-sm leading-6 text-[var(--foreground)]">{answer.value || "—"}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-sm text-[var(--muted-foreground)]">
              This submission did not include captured answers.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function SubmissionsList({ submissions }: { submissions: DashboardSubmission[] }) {
  if (!submissions.length) {
    return (
      <EmptyState
        title="No recent submissions"
        description="Responses will appear here as learners submit your published forms."
      />
    );
  }

  return <div className="space-y-4">{submissions.map((submission) => <SubmissionPreviewCard key={submission.id} submission={submission} />)}</div>;
}

function RecentFormsList({ forms }: { forms: DashboardForm[] }) {
  if (!forms.length) {
    return (
      <EmptyState
        title="No forms yet"
        description="Create your first form to start collecting responses."
      />
    );
  }

  return (
    <div className="space-y-3">
      {forms.map((form) => (
        <Card key={form.id} className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold tracking-tight text-[var(--foreground)]">{form.title}</p>
                <VisibilityBadge isPublic={form.isPublic} />
              </div>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                {form.description || "A focused form ready for your next workflow."}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Fields</p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{form.fieldCount}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Responses</p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{form.submissionCount}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Updated</p>
              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{formatDateLong(form.updatedAt)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Last</p>
              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{form.lastSubmissionAt ? formatDateLong(form.lastSubmissionAt) : "None"}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function FormsSearchBar({
  query,
  onQueryChange,
  visibilityFilter,
  onVisibilityFilterChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  visibilityFilter: FormVisibilityFilter;
  onVisibilityFilterChange: (value: FormVisibilityFilter) => void;
}) {
  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-none">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <Input label="Search forms" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search title or description" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "All", value: "all" as const },
            { label: "Public", value: "public" as const },
            { label: "Private", value: "private" as const },
          ].map((item) => {
            const isActive = visibilityFilter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onVisibilityFilterChange(item.value)}
                className={joinClasses(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.08em] transition",
                  isActive
                    ? "border-[rgba(15,93,70,0.24)] bg-[rgba(15,93,70,0.08)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--foreground)] hover:border-[rgba(15,93,70,0.2)] hover:bg-[rgba(15,93,70,0.06)]"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function FormsMobileList({ forms, onOpen, onEdit, onShare, onDelete }: { forms: DashboardForm[]; onOpen: (form: DashboardForm) => void; onEdit: (form: DashboardForm) => void; onShare: (form: DashboardForm) => void; onDelete: (form: DashboardForm) => void; }) {
  return (
    <div className="grid gap-3 md:hidden">
      {forms.map((form) => (
        <Card key={form.id} className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-none">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-[var(--foreground)]">{form.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <VisibilityBadge isPublic={form.isPublic} />
                  <span>{form.submissionCount} responses</span>
                  <span>{formatDateLong(form.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2 text-xs text-[var(--muted-foreground)] sm:grid-cols-2">
              <p className="truncate">{form.description || "No description provided."}</p>
              <p className="sm:text-right">{form.lastSubmissionAt ? `Last response ${formatDateLong(form.lastSubmissionAt)}` : "No responses yet"}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => onOpen(form)}>Open</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(form)}>Edit</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => onShare(form)}>Share</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => onDelete(form)}>Delete</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function FormsTable({ forms, onOpen, onEdit, onShare, onDelete }: { forms: DashboardForm[]; onOpen: (form: DashboardForm) => void; onEdit: (form: DashboardForm) => void; onShare: (form: DashboardForm) => void; onDelete: (form: DashboardForm) => void; }) {
  if (!forms.length) {
    return (
      <Card className="border-[var(--border)] bg-[var(--surface)] p-6 shadow-none">
        <p className="text-lg font-semibold tracking-tight text-[var(--foreground)]">No forms yet</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">Your forms will appear here once you create your first form.</p>
      </Card>
    );
  }

  return (
    <>
      <div className="md:hidden">
        <FormsMobileList forms={forms} onOpen={onOpen} onEdit={onEdit} onShare={onShare} onDelete={onDelete} />
      </div>
      <Card className="hidden overflow-hidden border-[var(--border)] bg-[var(--surface)] shadow-none md:block">
        <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Forms</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-[var(--border)] text-left">
            <thead className="bg-[var(--surface-subtle)]">
              <tr className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                <th className="w-[34%] px-5 py-3 sm:px-6">Form</th>
                <th className="w-[12%] px-5 py-3">Visibility</th>
                <th className="w-[12%] px-5 py-3">Responses</th>
                <th className="w-[22%] px-5 py-3">Updated</th>
                <th className="w-[20%] px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {forms.map((form) => (
                <tr key={form.id} className="align-top">
                  <td className="px-5 py-4 sm:px-6">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate font-medium text-[var(--foreground)]">{form.title}</p>
                      <p className="truncate text-sm leading-6 text-[var(--muted-foreground)]">
                        {form.description || "No description provided."}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">{form.lastSubmissionAt ? `Last response ${formatDateLong(form.lastSubmissionAt)}` : "No responses yet"}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <VisibilityBadge isPublic={form.isPublic} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-[var(--foreground)]">{form.submissionCount}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">responses</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--muted-foreground)]">{formatDateLong(form.updatedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => onOpen(form)}>Open</Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(form)}>Edit</Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => onShare(form)}>Share</Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => onDelete(form)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function CreateFormCard() {
  const [state, formAction, isPending] = useActionState(createFormAction, initialActionState);

  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-none">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Create form</p>
          <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">New form</h3>
          <p className="text-sm leading-5 text-[var(--muted-foreground)]">Fast setup for a new form.</p>
        </div>

        <form action={formAction} className="space-y-3.5">
          <Input name="title" label="Title" placeholder="Field trip permission slip" required />
          <label className="block text-sm">
            <span className="mb-1.5 block text-sm font-medium text-[var(--muted-foreground)]">Description</span>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
              placeholder="Add a short note about what this form is for."
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              name="isPublic"
              className="h-4 w-4 rounded border-[var(--border)] bg-transparent text-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
            />
            Make this form publicly accessible
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button type="submit" disabled={isPending} className="sm:min-w-44">
              {isPending ? "Creating..." : "Create form"}
            </Button>
            <ActionMessage state={state} />
          </div>
        </form>
      </div>
    </Card>
  );
}

function EditFormCard({
  form,
  onShare,
  onOpen,
}: {
  form: DashboardForm;
  onShare: (form: DashboardForm) => void;
  onOpen: (form: DashboardForm) => void;
}) {
  const [state, formAction, isPending] = useActionState(updateFormAction, initialActionState);
  const [deleteState, deleteAction, isDeletePending] = useActionState(deleteFormAction, initialActionState);

  return (
    <Card id={`form-${form.id}`} className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-none">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="truncate text-sm font-semibold tracking-tight text-[var(--foreground)]">{form.title}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <VisibilityBadge isPublic={form.isPublic} />
              <span>{form.submissionCount} responses</span>
              <span>{formatDateLong(form.updatedAt)}</span>
            </div>
            <p className="truncate text-sm leading-6 text-[var(--muted-foreground)]">
              {form.description || "No description provided."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => onOpen(form)}>Open</Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => onShare(form)}>Share</Button>
          </div>
        </div>

        <details className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)]">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-[var(--foreground)]">Edit</summary>
          <div className="border-t border-[var(--border)] p-4">
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="formId" value={form.id} />
              <Input name="title" label="Title" defaultValue={form.title} required />
              <label className="block text-sm">
                <span className="mb-2 block text-sm font-medium text-[var(--muted-foreground)]">Description</span>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={form.description ?? ""}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
                />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--foreground)]">
                <input
                  type="checkbox"
                  name="isPublic"
                  defaultChecked={form.isPublic}
                  className="h-4 w-4 rounded border-[var(--border)] bg-transparent text-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
                />
                Public form
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" disabled={isPending} className="sm:min-w-44">
                  {isPending ? "Saving..." : "Save changes"}
                </Button>
                <ActionMessage state={state} />
              </div>
            </form>

            <form
              action={deleteAction}
              onSubmit={(event) => {
                if (!window.confirm(`Delete "${form.title}"? This cannot be undone.`)) {
                  event.preventDefault();
                }
              }}
              className="mt-4 space-y-3 border-t border-[var(--border)] pt-4"
            >
              <input type="hidden" name="formId" value={form.id} />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" variant="secondary" disabled={isDeletePending}>
                  {isDeletePending ? "Deleting..." : "Delete form"}
                </Button>
                <ActionMessage state={deleteState} />
              </div>
            </form>
          </div>
        </details>
      </div>
    </Card>
  );
}

function WorkspaceOverview({
  data,
  userEmail,
}: {
  data: DashboardData;
  userEmail?: string | null;
}) {
  const { setDesktopTab } = useDesktopTab();
  const source = data as DashboardSource;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const displayName = firstText(source.name, source.fullName, userEmail ? userEmail.split("@")[0] : "", "User");
  const activeForms = data.forms.filter((form) => form.isPublic).length;
  const recentResponses = data.recentSubmissions.slice(0, 2);

  return (
    <div className="space-y-4">
      <Card className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-none">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--muted-foreground)]">Overview</p>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            {greeting}, {displayName}
          </h2>
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">
            {data.forms.length === 0 ? "Create your first form to get started." : "You have active forms in your workspace."}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: "Forms",
            value: String(data.summary.totalForms),
            hint: "Workspace total",
          },
          {
            label: "Responses",
            value: String(data.summary.totalSubmissions),
            hint: "Collected so far",
          },
          {
            label: "Active",
            value: String(activeForms),
            hint: "Ready to share",
          },
          {
            label: "Rate",
            value: data.summary.totalForms ? `${averagePerForm(data.summary.totalSubmissions, data.summary.totalForms).toFixed(1)}x` : "0x",
            hint: "Per form",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-[var(--border)] bg-[var(--surface)] px-3 py-3 shadow-none">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{stat.label}</p>
              <p className="text-[1.05rem] font-semibold tracking-tight text-[var(--foreground)]">{stat.value}</p>
              <p className="text-[11px] leading-4 text-[var(--muted-foreground)]">{stat.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-[var(--border)] bg-[var(--surface)] p-3 shadow-none">
        <div className="inline-flex flex-wrap items-center gap-2">
          <Button onClick={() => setDesktopTab("forms")} className="w-fit px-4">
            Create Form
          </Button>
          <Button variant="secondary" size="sm" className="w-fit px-4" onClick={() => setDesktopTab("forms")}>
            View Forms
          </Button>
        </div>
      </Card>

      <Card className="border-[var(--border)] bg-[var(--surface)] p-3 shadow-none">
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Recent responses</p>

          <div className="space-y-2">
            {recentResponses.length ? (
              recentResponses.map((submission) => (
                <Card key={submission.id} className="border-[var(--border)] bg-[var(--surface-subtle)] p-3 shadow-none">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-semibold tracking-tight text-[var(--foreground)]">{submission.formTitle}</p>
                        <p className="text-[11px] leading-4 text-[var(--muted-foreground)]">{formatDateLong(submission.createdAt)}</p>
                      </div>
                      <p className="shrink-0 text-[11px] font-medium text-[var(--muted-foreground)]">
                        {submission.answers.length} answer{submission.answers.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {submission.answers.slice(0, 2).map((answer) => (
                        <div key={`${submission.id}-${answer.fieldId}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{answer.fieldLabel}</p>
                          <p className="mt-1 break-words text-[11px] leading-4 text-[var(--foreground)]">{answer.value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-5 text-center">
                <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">No recent responses</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">Responses will appear as a quick activity snapshot.</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}


function WorkspaceForms({
  data,
  onShareForm,
}: {
  data: DashboardData;
  onShareForm: (form: DashboardForm) => void;
}) {
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<FormVisibilityFilter>("all");

  const filteredForms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return data.forms.filter((form) => {
      const matchesQuery =
        !normalizedQuery ||
        form.title.toLowerCase().includes(normalizedQuery) ||
        (form.description ?? "").toLowerCase().includes(normalizedQuery);

      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "public" && form.isPublic) ||
        (visibilityFilter === "private" && !form.isPublic);

      return matchesQuery && matchesVisibility;
    });
  }, [data.forms, query, visibilityFilter]);

  const visibleCount = filteredForms.length;
  const totalCount = data.forms.length;

  const handleOpenForm = (form: DashboardForm) => {
    window.location.hash = `form-${form.id}`;
  };

  const handleEditForm = (form: DashboardForm) => {
    window.location.hash = `form-${form.id}`;
  };

  const handleDeleteForm = (form: DashboardForm) => {
    const confirmDelete = window.confirm(`Delete "${form.title}"? This cannot be undone.`);
    if (!confirmDelete) return;
    window.location.hash = `form-${form.id}`;
  };

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Forms</p>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Forms</h2>
        </div>
        <Button size="sm" type="button" onClick={() => { }}>
          Create Form
        </Button>
      </section>

      <FormsSearchBar
        query={query}
        onQueryChange={setQuery}
        visibilityFilter={visibilityFilter}
        onVisibilityFilterChange={setVisibilityFilter}
      />

      <Card className="border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-none">
        <div className="flex items-center justify-between gap-3 text-sm text-[var(--muted-foreground)]">
          <p>
            Showing {visibleCount} of {totalCount} form{totalCount === 1 ? "" : "s"}
          </p>
          <p>Compact management view</p>
        </div>
      </Card>

      <FormsTable
        forms={filteredForms}
        onOpen={handleOpenForm}
        onEdit={handleEditForm}
        onShare={onShareForm}
        onDelete={handleDeleteForm}
      />

      {filteredForms.length ? (
        <div className="grid gap-4">
          {filteredForms.map((form) => (
            <EditFormCard key={form.id} form={form} onShare={onShareForm} onOpen={handleOpenForm} />
          ))}
        </div>
      ) : (
        <EmptyState title="No matching forms" description="Try another search term or clear the visibility filter." />
      )}
    </div>
  );
}

function WorkspaceResponses({ data }: { data: DashboardData }) {
  const metrics = [
    { label: "Total Responses", value: String(data.summary.totalSubmissions), hint: "All collected submissions" },
    { label: "Recent Responses", value: String(data.summary.recentSubmissions), hint: "Latest response window" },
    { label: "Average per Form", value: data.summary.totalForms ? averagePerForm(data.summary.totalSubmissions, data.summary.totalForms).toFixed(1) : "0", hint: "Responses divided by forms" },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Responses"
        title="Recent activity"
        description="A focused response feed surfaces the latest submissions and keeps the review flow calm."
        meta={data.recentSubmissions.length ? `${data.recentSubmissions.length} latest submission${data.recentSubmissions.length === 1 ? "" : "s"}` : "No activity yet"}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
        <Card className="border-[var(--border)] bg-[var(--surface)] p-5 shadow-none">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Activity feed</p>
          <div className="mt-4">
            <SubmissionsList submissions={data.recentSubmissions} />
          </div>
        </Card>

        <div className="space-y-4">
          <SectionHeader eyebrow="Preview" title="Response preview" description="A compact glance at the latest submission." />
          {data.recentSubmissions[0] ? (
            <SubmissionPreviewCard submission={data.recentSubmissions[0]} />
          ) : (
            <EmptyState
              title="Nothing to preview yet"
              description="When a new response comes in, it will show up here with answer values grouped for quick scanning."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({
  data,
  userEmail,
  settings,
}: {
  data: DashboardData;
  userEmail?: string | null;
  settings: SettingsData;
}) {
  const { desktopTab } = useDesktopTab();
  const [mobileTab, setMobileTab] = useState<MobileTab>("home");
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);
  const source = data as DashboardSource;

  const displayName = firstText(
    source.displayName,
    source.name,
    source.fullName,
    userEmail ? userEmail.split("@")[0] : "",
    "Dashboard"
  );
  const handleShareForm = (form: DashboardForm) => {
    const origin = window.location.origin;
    setShareTarget({
      form,
      shareUrl: buildPublicFormUrl(origin, displayName, form.publicToken),
    });
  };

  const activeShareStatus = shareTarget ? getShareStatus(shareTarget.form) : null;

  const handleMobileTabChange = (tab: MobileTab) => {
    setMobileTab(tab);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="space-y-3.5 px-4 py-4 pb-18 sm:px-6 sm:py-6 lg:px-8 lg:py-7">

        {desktopTab === "overview" ? (
          <div id="overview" className="hidden md:block">
            <WorkspaceOverview data={data} userEmail={userEmail} />
          </div>
        ) : (
          <div id="workspace" className="hidden md:block space-y-3.5">
            {desktopTab === "forms" ? (
              <WorkspaceForms data={data} onShareForm={handleShareForm} />
            ) : desktopTab === "responses" ? (
              <WorkspaceResponses data={data} />
            ) : (
              <WorkspaceSettings settings={settings} />
            )}
          </div>
        )}

        <div className="space-y-4 md:hidden">
          {mobileTab === "home" ? (
            <MobileHomePanel data={data} displayName={displayName} onTabChange={handleMobileTabChange} />
          ) : mobileTab === "forms" ? (
            <MobileFormsPanel data={data} onShareForm={handleShareForm} onTabChange={handleMobileTabChange} />
          ) : mobileTab === "responses" ? (
            <MobileResponsesPanel data={data} />
          ) : (
            <MobileSettingsPanel settings={settings} />
          )}
        </div>
      </div>

      <MobileTabBar activeTab={mobileTab} onTabChange={handleMobileTabChange} />

      <ShareModal
        open={Boolean(shareTarget)}
        onClose={() => setShareTarget(null)}
        formTitle={shareTarget?.form.title ?? ""}
        shareUrl={shareTarget?.shareUrl ?? ""}
        statusLabel={activeShareStatus ? getShareStatusLabel(activeShareStatus) : undefined}
        published={shareTarget?.form.isPublic ?? true}
      />
    </div>
  );
}


function MobileTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}) {
  return (
    <nav
      aria-label="Mobile dashboard navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/96 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.08)] backdrop-blur md:hidden"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-4 gap-2">
        {MOBILE_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            aria-current={activeTab === item.id ? "page" : undefined}
            className={joinClasses(
              "inline-flex items-center justify-center rounded-3xl border px-3 py-3 text-sm font-medium transition",
              activeTab === item.id
                ? "border-[rgba(15,93,70,0.22)] bg-[rgba(15,93,70,0.08)] text-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[rgba(15,93,70,0.18)] hover:bg-[var(--surface-subtle)]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function MobileHomePanel({
  data,
  displayName,
  onTabChange,
}: {
  data: DashboardData;
  displayName: string;
  onTabChange: (tab: MobileTab) => void;
}) {
  const source = data as DashboardSource;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const userName = displayName !== "Dashboard" ? displayName : firstText(source.name, source.fullName, "User");
  const activeForms = data.forms.filter((form) => form.isPublic).length;
  const recentResponses = data.recentSubmissions.slice(0, 2);

  return (
    <div className="space-y-4">
      <Card className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-none">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--muted-foreground)]">Overview</p>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            {greeting}, {userName}
          </h2>
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">
            {data.forms.length === 0 ? "Create your first form to get started." : "You have active forms in your workspace."}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: "Forms",
            value: String(data.summary.totalForms),
            hint: "Workspace total",
          },
          {
            label: "Responses",
            value: String(data.summary.totalSubmissions),
            hint: "Collected so far",
          },
          {
            label: "Active",
            value: String(data.forms.filter((form) => form.isPublic).length),
            hint: "Ready to share",
          },
          {
            label: "Rate",
            value: data.summary.totalForms ? `${averagePerForm(data.summary.totalSubmissions, data.summary.totalForms).toFixed(1)}x` : "0x",
            hint: "Per form",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-[var(--border)] bg-[var(--surface)] px-3 py-3 shadow-none">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{stat.label}</p>
              <p className="text-[1.05rem] font-semibold tracking-tight text-[var(--foreground)]">{stat.value}</p>
              <p className="text-[11px] leading-4 text-[var(--muted-foreground)]">{stat.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-[var(--border)] bg-[var(--surface)] p-3 shadow-none">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => onTabChange("forms")} className="w-full justify-center">
            Create Form
          </Button>
          <Button variant="secondary" size="sm" className="w-full justify-center" onClick={() => onTabChange("forms")}>
            View Forms
          </Button>
        </div>
      </Card>

      <Card className="border-[var(--border)] bg-[var(--surface)] p-3 shadow-none">
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Recent responses</p>

          <div className="space-y-2">
            {recentResponses.length ? (
              recentResponses.map((submission) => (
                <Card key={submission.id} className="border-[var(--border)] bg-[var(--surface-subtle)] p-3 shadow-none">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-semibold tracking-tight text-[var(--foreground)]">{submission.formTitle}</p>
                        <p className="text-[11px] leading-4 text-[var(--muted-foreground)]">{formatDateLong(submission.createdAt)}</p>
                      </div>
                      <p className="shrink-0 text-[11px] font-medium text-[var(--muted-foreground)]">
                        {submission.answers.length} answer{submission.answers.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {submission.answers.slice(0, 2).map((answer) => (
                        <div key={`${submission.id}-${answer.fieldId}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{answer.fieldLabel}</p>
                          <p className="mt-1 break-words text-[11px] leading-4 text-[var(--foreground)]">{answer.value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-5 text-center">
                <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">No recent responses</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">Responses will appear here as a quick activity snapshot.</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function MobileFormsPanel({
  data,
  onShareForm,
  onTabChange,
}: {
  data: DashboardData;
  onShareForm: (form: DashboardForm) => void;
  onTabChange: (tab: MobileTab) => void;
}) {
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<FormVisibilityFilter>("all");

  const filteredForms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return data.forms.filter((form) => {
      const matchesQuery =
        !normalizedQuery ||
        form.title.toLowerCase().includes(normalizedQuery) ||
        (form.description ?? "").toLowerCase().includes(normalizedQuery);

      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "public" && form.isPublic) ||
        (visibilityFilter === "private" && !form.isPublic);

      return matchesQuery && matchesVisibility;
    });
  }, [data.forms, query, visibilityFilter]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Forms"
        title="Manage forms"
        description="Search, filter, and edit forms from a mobile-first list."
        meta={data.forms.length ? `${filteredForms.length} visible of ${data.forms.length} total` : "No forms yet"}
      />

      <FormsSearchBar
        query={query}
        onQueryChange={setQuery}
        visibilityFilter={visibilityFilter}
        onVisibilityFilterChange={setVisibilityFilter}
      />

      <CreateFormCard />

      <FormsTable forms={filteredForms} />

      {filteredForms.length ? (
        <section className="space-y-4">
          <SectionHeader eyebrow="Editor" title="Edit forms" description="Expand cards to update form details or share links." />
          <div className="grid gap-4">
            {filteredForms.map((form) => (
              <EditFormCard key={form.id} form={form} onShare={onShareForm} />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState title="No matching forms" description="Try another search term or clear the visibility filter." />
      )}
    </div>
  );
}

function MobileResponsesPanel({ data }: { data: DashboardData }) {
  const average = averagePerForm(data.summary.totalSubmissions, data.summary.totalForms);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Responses"
        title="Latest responses"
        description="Recent submissions are summarized in a focused response feed that keeps the review flow calm."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <CompactStat label="Total Responses" value={String(data.summary.totalSubmissions)} hint="All collected submissions" />
        <CompactStat label="Recent Responses" value={String(data.summary.recentSubmissions)} hint="Latest response window" />
        <CompactStat
          label="Average per Form"
          value={data.summary.totalForms ? average.toFixed(1) : "0"}
          hint="Responses divided by forms"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
        <Card className="border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Activity feed</p>
          <div className="mt-4">
            <SubmissionsList submissions={data.recentSubmissions} />
          </div>
        </Card>

        <div className="space-y-4">
          <SectionHeader eyebrow="Preview" title="Response preview" description="A compact glance at the latest submission." />
          {data.recentSubmissions[0] ? (
            <SubmissionPreviewCard submission={data.recentSubmissions[0]} />
          ) : (
            <EmptyState
              title="Nothing to preview yet"
              description="When a new response comes in, it will show up here with answer values grouped for quick scanning."
            />
          )}
        </div>
      </div>
    </div>
  );
}
