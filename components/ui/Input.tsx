'use client';

import { type InputHTMLAttributes, useState } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function Input({ label, error, className = '', id, type, ...rest }: Props) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputId = id ?? (label ? String(label).toLowerCase().replace(/\s+/g, '-') : undefined);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && isPasswordVisible ? 'text' : type;
  const describedBy = error ? `${inputId ?? 'input'}-error` : rest['aria-describedby'];

  return (
    <div className="block text-sm">
      {label ? (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}

      <div className="relative">
        <input
          id={inputId}
          type={inputType}
          aria-invalid={Boolean(error) || rest['aria-invalid']}
          aria-describedby={describedBy}
          className={joinClasses(
            'w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-75',
            isPasswordField && 'pr-16',
            error &&
              'border-[rgba(180,35,24,0.35)] focus-visible:border-[rgba(180,35,24,0.55)] focus-visible:ring-[rgba(180,35,24,0.18)]',
            className,
          )}
          {...rest}
        />

        {isPasswordField ? (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((current) => !current)}
            className="absolute inset-y-0 right-3 my-auto inline-flex items-center text-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isPasswordVisible}
          >
            {isPasswordVisible ? 'hide' : 'show'}
          </button>
        ) : null}
      </div>

      {error ? (
        <div id={`${inputId ?? 'input'}-error`} className="mt-1 text-xs text-[#b42318]">
          {error}
        </div>
      ) : null}
    </div>
  );
}
