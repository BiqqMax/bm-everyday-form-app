"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";

type PublicFormField = {
  id: string;
  label: string;
  type: "text" | "textarea" | "email" | "select" | "checkbox" | "radio" | "date";
  required: boolean;
  options: string[];
  position: number;
};

export type PublicFormView = {
  id: string;
  title: string;
  description: string | null;
  displayName: string;
  qrShareToken: string;
  fields: PublicFormField[];
  isPublished: boolean;
  expiresAt: string | null;
  responseLimit: number | null;
  responseCount: number | null;
};

type SubmissionState =
  | { status: "idle"; message: string }
  | { status: "submitting"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatOptionalCount(value: number | null) {
  if (typeof value !== "number") {
    return "Unlimited";
  }

  return String(value);
}

function formatOptionalDate(value: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function fieldName(fieldId: string) {
  return `field_${fieldId}`;
}

function checkboxGroupName(fieldId: string) {
  return `field_${fieldId}[]`;
}

function SubmissionStatus({ state }: { state: SubmissionState }) {
  if (state.status === "idle") {
    return null;
  }

  const tone =
    state.status === "error"
      ? "border-[rgba(180,35,24,0.2)] bg-[rgba(180,35,24,0.06)] text-[#7f1d1d]"
      : state.status === "success"
        ? "border-[rgba(15,93,70,0.18)] bg-[rgba(15,93,70,0.08)] text-[var(--accent)]"
        : "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--muted-foreground)]";

  return <div className={joinClasses("rounded-2xl border px-4 py-3 text-sm font-medium", tone)}>{state.message}</div>;
}

function FieldShell({
  field,
  children,
}: {
  field: PublicFormField;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <label htmlFor={fieldName(field.id)} className="block text-sm font-semibold text-[var(--foreground)]">
          {field.label}
          {field.required ? <span className="ml-1 text-[#b42318]">*</span> : null}
        </label>
        <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
          {field.type}
        </span>
      </div>
      {children}
    </div>
  );
}

function renderField(field: PublicFormField) {
  const baseClass =
    "w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0";

  switch (field.type) {
    case "textarea":
      return <textarea id={fieldName(field.id)} name={fieldName(field.id)} rows={4} className={baseClass} required={field.required} />;
    case "email":
      return <input id={fieldName(field.id)} name={fieldName(field.id)} type="email" className={baseClass} required={field.required} />;
    case "date":
      return <input id={fieldName(field.id)} name={fieldName(field.id)} type="date" className={baseClass} required={field.required} />;
    case "select":
      return (
        <select id={fieldName(field.id)} name={fieldName(field.id)} className={baseClass} required={field.required} defaultValue="">
          <option value="" disabled>
            Select an option
          </option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    case "radio":
      return (
        <div className="grid gap-2">
          {field.options.map((option) => (
            <label key={option} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]">
              <input
                type="radio"
                name={fieldName(field.id)}
                value={option}
                required={field.required}
                className="h-4 w-4 text-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <div className="grid gap-2">
          {field.options.map((option) => (
            <label key={option} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                name={checkboxGroupName(field.id)}
                value={option}
                className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              />
              <span>{option}</span>
            </label>
          ))}
          {field.required ? <p className="text-xs text-[var(--muted-foreground)]">Select at least one option.</p> : null}
        </div>
      );
    case "text":
    default:
      return <input id={fieldName(field.id)} name={fieldName(field.id)} type="text" className={baseClass} required={field.required} />;
  }
}

export function PublicFormClient({ form }: { form: PublicFormView }) {
  const [state, setState] = useState<SubmissionState>({ status: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitDisabled = useMemo(() => isSubmitting || state.status === "success", [isSubmitting, state.status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitDisabled) {
      return;
    }

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    setIsSubmitting(true);
    setState({ status: "submitting", message: "Submitting your response…" });

    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: unknown };

      if (!response.ok) {
        setState({
          status: "error",
          message:
            typeof payload.message === "string" && payload.message.trim()
              ? payload.message
              : "We couldn't submit this response. Please try again.",
        });
        return;
      }

      formElement.reset();
      setState({
        status: "success",
        message:
          typeof payload.message === "string" && payload.message.trim()
            ? payload.message
            : "Response submitted successfully.",
      });
    } catch {
      setState({
        status: "error",
        message: "We couldn't reach the server. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Public path</p>
          <p className="mt-2 break-words text-sm font-medium text-[var(--foreground)]">/f/{form.qrShareToken}</p>
          {form.displayName ? <p className="mt-2 break-words text-xs text-[var(--muted-foreground)]">Shared by {form.displayName}</p> : null}
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Expiry</p>
          <p className="mt-2 text-sm font-medium text-[var(--foreground)]">{formatOptionalDate(form.expiresAt)}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Responses</p>
          <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
            {typeof form.responseCount === "number" ? String(form.responseCount) : "0"} / {formatOptionalCount(form.responseLimit)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="publicToken" value={form.qrShareToken} />

        <div className="grid gap-4">
          {form.fields
            .slice()
            .sort((left, right) => left.position - right.position)
            .map((field) => (
              <FieldShell key={field.id} field={field}>
                {renderField(field)}
              </FieldShell>
            ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={submitDisabled}
            className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[var(--accent)] px-5 py-3 text-sm font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent-hover)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Submitting…" : "Submit response"}
          </button>
          <SubmissionStatus state={state} />
        </div>
      </form>
    </div>
  );
}

export default PublicFormClient;
