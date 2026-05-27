"use client";

import { useActionState, useEffect, useState } from "react";
import BrandMark from "../layout/BrandMark";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import LogoutButton from "../auth/LogoutButton";
import type { DashboardActionState } from "../../lib/dashboard/actions";
import { createFormAction, deleteFormAction, updateFormAction } from "../../lib/dashboard/actions";
import type { DashboardData, DashboardForm, DashboardSubmission } from "../../lib/dashboard/dashboard";
import AuthRouteLoading from "../auth/AuthRouteLoading";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type DashboardSource = DashboardData & Record<string, unknown>;

const initialActionState: DashboardActionState = {
  status: "idle",
  message: "",
};

function mergeClasses(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asCollection(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(asRecord);
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).filter(Boolean).map(asRecord);
  }

  return [];
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
}

function initials(name: string) {
  const words = name
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  if (!words.length) {
    return "EF";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDateLong(value: string | null) {
  if (!value) {
    return "No submissions yet";
  }

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
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
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">{eyebrow}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
      </div>
      {meta ? <p className="text-sm text-[var(--muted-foreground)]">{meta}</p> : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-none">
      <div className="inline-flex rounded-full border border-[rgba(15,93,70,0.16)] bg-[rgba(15,93,70,0.06)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        {label}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{hint}</p>
    </div>
  );
}

function VisibilityBadge({ isPublic }: { isPublic: boolean }) {
  return (
    <span
      className={mergeClasses(
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

function FormsMobileList({ forms }: { forms: DashboardForm[] }) {
  return (
    <div className="grid gap-3 md:hidden">
      {forms.map((form) => (
        <Card key={form.id} className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-none">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="font-semibold tracking-tight text-[var(--foreground)]">{form.title}</p>
                <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                  {form.description || "A focused form ready for your next workflow."}
                </p>
              </div>
              <VisibilityBadge isPublic={form.isPublic} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Fields</p>
                <p className="mt-1 font-semibold text-[var(--foreground)]">{form.fieldCount}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Submissions</p>
                <p className="mt-1 font-semibold text-[var(--foreground)]">{form.submissionCount}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Updated</p>
                <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{formatDateLong(form.updatedAt)}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Last</p>
                <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                  {form.lastSubmissionAt ? formatDateLong(form.lastSubmissionAt) : "None"}
                </p>
              </div>
            </div>

            <Button href={`#form-${form.id}`} variant="secondary" size="sm" className="w-full">
              Edit form
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function FormsTable({ forms }: { forms: DashboardForm[] }) {
  if (forms.length === 0) {
    return (
      <EmptyState
        title="No forms yet"
        description="Your forms will appear here once you create your first form. The overview keeps publish state, submission count, and update time in one calm view."
        actionHref="#create-form"
        actionLabel="Create a form"
      />
    );
  }

  return (
    <>
      <div className="md:hidden">
        <FormsMobileList forms={forms} />
      </div>

      <Card className="hidden overflow-hidden border-[var(--border)] bg-[var(--surface)] shadow-none md:block">
        <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Forms overview</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)] text-left">
            <thead className="bg-[var(--surface-subtle)]">
              <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                <th className="px-5 py-3 sm:px-6">Form</th>
                <th className="px-5 py-3">Visibility</th>
                <th className="px-5 py-3">Fields</th>
                <th className="px-5 py-3">Submissions</th>
                <th className="px-5 py-3">Updated</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {forms.map((form) => (
                <tr key={form.id} className="align-top">
                  <td className="px-5 py-4 sm:px-6">
                    <div className="space-y-1">
                      <p className="font-medium text-[var(--foreground)]">{form.title}</p>
                      <p className="max-w-[32rem] text-sm leading-6 text-[var(--muted-foreground)]">
                        {form.description || "A focused form ready for your next workflow."}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <VisibilityBadge isPublic={form.isPublic} />
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--foreground)]">{form.fieldCount}</td>
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-[var(--foreground)]">{form.submissionCount}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {form.lastSubmissionAt ? `Last ${formatDateLong(form.lastSubmissionAt)}` : "No responses yet"}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--muted-foreground)]">{formatDateLong(form.updatedAt)}</td>
                  <td className="px-5 py-4 text-right">
                    <a
                      href={`#form-${form.id}`}
                      className="inline-flex items-center rounded-full border border-[rgba(15,93,70,0.16)] bg-[rgba(15,93,70,0.06)] px-3 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[rgba(15,93,70,0.1)]"
                    >
                      Edit
                    </a>
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
    <Card className="border-[var(--border)] bg-[var(--surface)] p-6 shadow-none">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">Studio</p>
          <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">Create a new form</h3>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            Start with a title, add context, and decide whether this form should be published immediately.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <Input name="title" label="Title" placeholder="Field trip permission slip" required />
          <label className="block text-sm">
            <span className="mb-2 block text-sm font-medium text-[var(--muted-foreground)]">Description</span>
            <textarea
              name="description"
              rows={4}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-[var(--foreground)] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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

function EditFormCard({ form }: { form: DashboardForm }) {
  const [state, formAction, isPending] = useActionState(updateFormAction, initialActionState);
  const [deleteState, deleteAction, isDeletePending] = useActionState(deleteFormAction, initialActionState);

  return (
    <Card id={`form-${form.id}`} className="border-[var(--border)] bg-[var(--surface)] p-5 shadow-none">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{form.title}</p>
            <VisibilityBadge isPublic={form.isPublic} />
          </div>
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            {form.description || "No description provided. Add a short context note so the purpose is obvious at a glance."}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Fields</p>
            <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{form.fieldCount}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Created</p>
            <p className="mt-2 text-sm font-medium text-[var(--foreground)]">{formatDateLong(form.createdAt)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Last response</p>
            <p className="mt-2 text-sm font-medium text-[var(--foreground)]">{formatDateLong(form.lastSubmissionAt)}</p>
          </div>
        </div>
      </div>

      <details className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)]">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
          Edit form details
        </summary>
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
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-[var(--foreground)] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
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
    </Card>
  );
}

function SubmissionsList({ submissions }: { submissions: DashboardSubmission[] }) {
  if (submissions.length === 0) {
    return (
      <EmptyState
        title="No recent submissions"
        description="Responses will appear here as learners submit your published forms. The latest six are surfaced first to keep the review flow calm and current."
      />
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="border-[var(--border)] bg-[var(--surface)] p-5 shadow-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-base font-semibold tracking-tight text-[var(--foreground)]">{submission.formTitle}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{formatDateLong(submission.createdAt)}</p>
            </div>
            <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
              {submission.answers.length} answers
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
              {submission.answers.length ? (
              submission.answers.map((answer: DashboardSubmission["answers"][number]) => (
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
        </Card>
      ))}
    </div>
  );
}

function WorkspacePanel({ data, userEmail }: { data: DashboardSource; userEmail?: string | null }) {
  const summary = asRecord(data.summary);
  const focus = firstText(
    data.focus,
    data.todayFocus,
    summary.focus,
    "Review the forms, update one workflow, and check the latest responses before the next block."
  );
  const checkIn = firstText(
    data.nextCheckIn,
    data.checkIn,
    summary.checkIn,
    "Use the navigation to jump from forms to activity without losing context."
  );
  const status = firstText(
    data.status,
    data.workspaceStatus,
    summary.status,
    "Calm, secure, and ready for the day."
  );

  const schedule = asCollection(data.schedule ?? data.upcoming ?? data.calendar ?? data.agenda);

  return (
    <div id="workspace" className="space-y-6">
      <Card className="border-[var(--border)] bg-[var(--surface)] p-6 shadow-none">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">Workspace</p>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">A quiet place to manage today’s flow</h3>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              {userEmail ? `Signed in as ${userEmail}. ` : ""}
              The dashboard keeps the most important work close: forms, live responses, and a few focused actions.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              { title: "Today’s focus", body: focus },
              { title: "Next check-in", body: checkIn },
              { title: "Workspace status", body: status },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="border-[var(--border)] bg-[var(--surface)] p-6 shadow-none">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">Upcoming</p>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">Schedule</h3>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              A small snapshot of what’s next, kept intentionally lightweight.
            </p>
          </div>
          {schedule.length ? (
            <div className="space-y-3">
              {schedule.slice(0, 4).map((item, index) => {
                const title = firstText(item.title, item.name, item.label, `Item ${index + 1}`);
                const detail = firstText(item.time, item.date, item.startsAt, item.body, item.description, "Scheduled soon");
                return (
                  <div key={`${title}-${index}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                    <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">{detail}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Nothing scheduled"
              description="When a timetable or check-in list is available, it will show here. For now the workspace stays uncluttered."
            />
          )}
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ data }: { data: DashboardData }) {
  const metrics = [
    {
      label: "Forms",
      value: String(data.summary.totalForms),
      hint: data.summary.totalForms ? "Owned forms in your workspace" : "No forms created yet",
    },
    {
      label: "Published",
      value: String(data.summary.publishedForms),
      hint: data.summary.publishedForms ? "Forms currently public" : "Nothing published yet",
    },
    {
      label: "Submissions",
      value: String(data.summary.totalSubmissions),
      hint: data.summary.totalSubmissions ? "Responses collected so far" : "Waiting on first response",
    },
    {
      label: "Fields",
      value: String(data.summary.totalFields),
      hint: data.summary.totalFields ? "Questions across all forms" : "No form fields yet",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
      ))}
    </div>
  );
}

export default function Dashboard({
  data,
  userEmail,
}: {
  data: DashboardData;
  userEmail?: string | null;
}) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        if (!mounted) return;
        if (!user) {
          router.replace("/login");
          return;
        }
        setIsReady(true);
      })
      .catch((err) => {
        console.error("Dashboard client session check failed", err);
        if (mounted) router.replace("/login");
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  if (!isReady) {
    return <AuthRouteLoading title="Loading dashboard..." />;
  }
  const source = data as DashboardSource;
  const displayName = firstText(
    source.displayName,
    source.name,
    source.fullName,
    userEmail ? userEmail.split("@")[0] : "",
    "Dashboard"
  );
  const roleLabel = firstText(source.role, source.title, source.position, "Operations workspace");
  const contextLabel = firstText(source.school, source.schoolName, source.campus, source.institution, "Ready for today’s work");
  const emailLabel = firstText(userEmail, source.email);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1640px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 xl:px-8">
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:self-start">
          <Card className="flex h-full flex-col gap-6 border-[var(--border)] bg-[var(--surface)] p-5 shadow-none">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-subtle)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4">
                  <BrandMark href="/" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">Dashboard</p>
                    <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">{displayName}</h1>
                    <p className="text-sm text-[var(--muted-foreground)]">{roleLabel}</p>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold text-[var(--foreground)]">
                  {initials(displayName)}
                </div>
              </div>

              <div className="mt-4 space-y-1 text-sm text-[var(--muted-foreground)]">
                <p>{contextLabel}</p>
                {emailLabel ? <p>{emailLabel}</p> : null}
              </div>
            </div>

            <nav aria-label="Dashboard sections" className="grid gap-2">
              {[
                ["Overview", "#overview"],
                ["Forms", "#forms"],
                ["Create", "#create-form"],
                ["Studio", "#studio"],
                ["Activity", "#activity"],
                ["Workspace", "#workspace"],
              ].map(([label, href], index) => (
                <a
                  key={label}
                  href={href}
                  className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:border-[rgba(15,93,70,0.2)] hover:bg-[rgba(15,93,70,0.06)]"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[11px] font-semibold text-[var(--muted-foreground)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {label}
                  </span>
                  <span className="text-[var(--muted-foreground)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]">→</span>
                </a>
              ))}
            </nav>

            <div className="grid gap-4">
              <Card className="border-[var(--border)] bg-[var(--surface-subtle)] p-4 shadow-none">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">Summary</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Forms</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{data.summary.totalForms}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Submissions</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{data.summary.totalSubmissions}</p>
                  </div>
                </div>
              </Card>

              <Card className="border-[var(--border)] bg-[var(--surface-subtle)] p-4 shadow-none">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">Session</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">Secure Supabase session</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Synced through server cookies</p>
                  </div>
                  <LogoutButton />
                </div>
              </Card>
            </div>
          </Card>
        </aside>

        <main className="space-y-6 pb-6">
          <Card id="overview" className="border-[var(--border)] bg-[var(--surface)] p-6 shadow-none">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-[rgba(15,93,70,0.16)] bg-[rgba(15,93,70,0.06)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                    Workspace
                  </span>
                  {userEmail ? (
                    <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]">
                      {userEmail}
                    </span>
                  ) : null}
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
                  Calm, structured tools for a full workday.
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                  Review forms, track responses, and move between planning and follow-up without clutter. The layout is denser,
                  clearer, and tuned for desktop, tablet, and mobile.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button href="/" variant="secondary" size="sm">
                  Home
                </Button>
                <Button href="#create-form" size="sm">
                  Create form
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <SummaryCard data={data} />
            </div>
          </Card>

          <section id="forms" className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.9fr)]">
            <div className="space-y-4">
              <SectionHeader
                eyebrow="Forms"
                title="Roster and response overview"
                description="The table keeps key form metadata visible at a glance: publish state, field count, response count, and the latest update."
                meta={data.forms.length ? `${data.forms.length} form${data.forms.length === 1 ? "" : "s"} in view` : "No forms yet"}
              />
              <FormsTable forms={data.forms} />
            </div>

            <div className="space-y-6">
              <div id="create-form">
                <CreateFormCard />
              </div>
              <WorkspacePanel data={source} userEmail={userEmail} />
            </div>
          </section>

          <section id="studio" className="space-y-4">
            <SectionHeader
              eyebrow="Studio"
              title="Edit forms with less friction"
              description="Each form card is compact by default, then expands into a focused editing surface with safer delete affordances and clearer hierarchy."
              meta={data.forms.length ? "Expand a card to edit" : "Create one to unlock the studio"}
            />

            {data.forms.length ? (
              <div className="grid gap-4">
            {data.forms.map((form: DashboardForm) => (
              <EditFormCard key={form.id} form={form} />
            ))}
              </div>
            ) : (
              <EmptyState
                title="No forms to edit yet"
                description="Create your first form in the studio and this area becomes the editing workspace, with changes, visibility, and deletion controls neatly contained."
                actionHref="#create-form"
                actionLabel="Create a form"
              />
            )}
          </section>

          <section id="activity" className="space-y-4">
            <SectionHeader
              eyebrow="Activity"
              title="Latest responses"
              description="Recent submissions are presented as readable cards so you can scan answers quickly without opening another page."
              meta={data.recentSubmissions.length ? `${data.recentSubmissions.length} recent submission${data.recentSubmissions.length === 1 ? "" : "s"}` : "No activity yet"}
            />
            <SubmissionsList submissions={data.recentSubmissions} />
          </section>
        </main>
      </div>
    </div>
  );
}
