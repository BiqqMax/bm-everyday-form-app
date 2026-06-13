"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import OwnerHeader from "../../../components/form-public/OwnerHeader";
import FormFields, { type FormFieldDef } from "../../../components/form-public/FormFields";
import SubmitButton from "../../../components/form-public/SubmitButton";

type PublicFormField = FormFieldDef & {
  id: string;
  label: string;
  type: "text" | "email" | "textarea" | "number";
  required: boolean;
  options: string[];
  position: number;
};

export type PublicFormView = {
  id: string;
  title: string;
  description: string | null;
  displayName: string;
  avatarUrl: string | null;
  qrShareToken: string;
  fields: PublicFormField[];
  isPublished: boolean;
  expiresAt: string | null;
  responseLimit: number | null;
  responseCount: number | null;
};

type SubmissionState =
  | { status: "idle"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

function getDeviceId() {
  let id = localStorage.getItem("device_id");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }

  return id;
}

function SubmissionStatus({ state }: { state: SubmissionState }) {
  if (state.status === "idle") {
    return null;
  }

  const tone =
    state.status === "error"
      ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200"
      : state.status === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
        : "border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400";

  return (
    <div className={`rounded-md border px-4 py-3 text-sm font-medium mt-4 ${tone}`}>
      {state.message}
    </div>
  );
}

function validateRequiredFields(
  fields: PublicFormField[],
  values: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    if (field.required && !(values[field.id] ?? "").trim()) {
      errors[field.id] = "This field is required";
    }
  }

  return errors;
}

export function PublicFormClient({ form }: { form: PublicFormView }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<SubmissionState>({ status: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionGate, setSubmissionGate] = useState<"loading" | "submitted" | "clean">("loading");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`submitted_form_${form.qrShareToken}`);
      setSubmissionGate(stored !== null ? "submitted" : "clean");
    } catch {
      setSubmissionGate("clean");
    }
  }, [form.qrShareToken]);

  const submitDisabled = useMemo(
    () => isSubmitting || state.status === "success",
    [isSubmitting, state.status],
  );

  const sortedFields = useMemo(
    () =>
      form.fields
        .slice()
        .sort((left, right) => left.position - right.position),
    [form.fields],
  );

  const simpleFields: FormFieldDef[] = useMemo(
    () =>
      sortedFields.map((field) => ({
        id: field.id,
        label: field.label,
        type: field.type as FormFieldDef["type"],
        required: field.required,
      })),
    [sortedFields],
  );

  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      if (prev[fieldId]) {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      }
      return prev;
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitDisabled) {
      return;
    }

    const fieldErrors = validateRequiredFields(sortedFields, values);

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    const responses = Object.entries(values)
      .filter(([, value]) => value.trim().length > 0)
      .map(([fieldId, value]) => ({
        fieldId,
        value: value.trim(),
      }));

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicToken: form.qrShareToken,
          deviceId: getDeviceId(),
          answers: responses,
        }),
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

      setValues({});
      setErrors({});
      setState({
        status: "success",
        message:
          typeof payload.message === "string" && payload.message.trim()
            ? payload.message
            : "Thank you! Your response has been submitted.",
      });
      try {
        localStorage.setItem(`submitted_form_${form.qrShareToken}`, "true");
      } catch {
        // localStorage unavailable — non-critical, backend still enforces dedup
      }
      setSubmissionGate("submitted");
    } catch {
      setState({
        status: "error",
        message:
          "We couldn't reach the server. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submissionGate === "loading") {
    return (
      <div>
        <OwnerHeader
          ownerName={form.displayName || "Anonymous"}
          ownerAvatarUrl={form.avatarUrl ?? null}
          formTitle={form.title}
          formDescription={form.description}
          expiresAt={form.expiresAt}
          responseLimit={form.responseLimit}
        />
        <div className="rounded-xl border border-neutral-200 dark:border-[#123B2B] bg-white dark:bg-[#0A1F16] p-5">
          <div className="space-y-4 animate-pulse">
            <div className="h-10 rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-10 rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-10 w-32 rounded bg-neutral-100 dark:bg-neutral-800" />
          </div>
        </div>
      </div>
    );
  }

  if (submissionGate === "submitted") {
    return (
      <div>
        <OwnerHeader
          ownerName={form.displayName || "Anonymous"}
          ownerAvatarUrl={form.avatarUrl ?? null}
          formTitle={form.title}
          formDescription={form.description}
          expiresAt={form.expiresAt}
          responseLimit={form.responseLimit}
        />

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 p-6 text-center">
          <svg
            className="mx-auto h-10 w-10 text-emerald-500 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-emerald-800 dark:text-emerald-200 font-medium text-lg">
            Thank you! Your response has been submitted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <OwnerHeader
        ownerName={form.displayName || "Anonymous"}
        ownerAvatarUrl={form.avatarUrl ?? null}
        formTitle={form.title}
        formDescription={form.description}
        expiresAt={form.expiresAt}
        responseLimit={form.responseLimit}
      />

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-neutral-200 dark:border-[#123B2B] bg-white dark:bg-[#0A1F16] p-5 space-y-4">
          <FormFields
            fields={simpleFields}
            values={values}
            errors={errors}
            onChange={handleFieldChange}
          />

          <SubmitButton isSubmitting={isSubmitting} isDisabled={state.status === "success"} />
        </div>

        <SubmissionStatus state={state} />
      </form>
    </div>
  );
}

export default PublicFormClient;
