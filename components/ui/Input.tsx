"use client";

import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };

export default function Input({ label, error, className = "", ...rest }: Props) {
  return (
    <label className="block text-sm">
      {label ? <div className="mb-2 text-sm text-[var(--muted)]">{label}</div> : null}
      <input
        className={`w-full rounded-lg border p-2 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] ${className}`}
        {...rest}
      />
      {error ? <div className="mt-1 text-xs text-red-500">{error}</div> : null}
    </label>
  );
}
