"use client";

import type { ReactNode } from "react";

export type FormFieldDef = {
  id: string;
  label: string;
  type: "text" | "email" | "textarea" | "number";
  required: boolean;
};

type FormFieldsProps = {
  fields: FormFieldDef[];
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
};

function fieldInputName(fieldId: string) {
  return `field_${fieldId}`;
}

const baseInputClass =
  "w-full px-3 py-2 border border-neutral-300 dark:border-[#123B2B] rounded-md bg-white dark:bg-[#06140F] text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#19C37D]";

function FieldShell({
  field,
  error,
  children,
}: {
  field: FormFieldDef;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={fieldInputName(field.id)}
        className="text-sm font-medium text-black dark:text-white"
      >
        {field.label}
        {field.required ? <span className="ml-1 text-rose-600 dark:text-rose-400">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      ) : null}
    </div>
  );
}

function renderFieldInput(
  field: FormFieldDef,
  value: string,
  onChange: (fieldId: string, value: string) => void
) {
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          id={fieldInputName(field.id)}
          name={fieldInputName(field.id)}
          rows={4}
          className={baseInputClass}
          required={field.required}
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      );
    case "email":
      return (
        <input
          id={fieldInputName(field.id)}
          name={fieldInputName(field.id)}
          type="email"
          className={baseInputClass}
          required={field.required}
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      );
    case "number":
      return (
        <input
          id={fieldInputName(field.id)}
          name={fieldInputName(field.id)}
          type="number"
          className={baseInputClass}
          required={field.required}
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      );
    case "text":
    default:
      return (
        <input
          id={fieldInputName(field.id)}
          name={fieldInputName(field.id)}
          type="text"
          className={baseInputClass}
          required={field.required}
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      );
  }
}

export default function FormFields({
  fields,
  values,
  errors,
  onChange,
}: FormFieldsProps) {
  if (fields.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">
        This form has no fields yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {fields.map((field) => (
        <FieldShell key={field.id} field={field} error={errors[field.id]}>
          {renderFieldInput(field, values[field.id] ?? "", onChange)}
        </FieldShell>
      ))}
    </div>
  );
}
