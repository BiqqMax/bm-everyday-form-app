'use client';

import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function Input({ label, error, className = '', id, ...rest }: Props) {
  const inputId = id ?? (label ? String(label).toLowerCase().replace(/\s+/g, '-') : undefined);
  const describedBy = error ? `${inputId ?? 'input'}-error` : rest['aria-describedby'];

  return (
    <label className="block text-sm">
      {label ? <span className="mb-2 block text-sm font-medium text-foreground">{label}</span> : null}
      <input
        id={inputId}
        aria-invalid={Boolean(error) || rest['aria-invalid']}
        aria-describedby={describedBy}
        className={joinClasses(
          'w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-75',
          error &&
            'border-[rgba(180,35,24,0.35)] focus-visible:border-[rgba(180,35,24,0.55)] focus-visible:ring-[rgba(180,35,24,0.18)]',
          className,
        )}
        {...rest}
      />
      {error ? (
        <div id={`${inputId ?? 'input'}-error`} className="mt-1 text-xs text-[#b42318]">
          {error}
        </div>
      ) : null}
    </label>
  );
}
