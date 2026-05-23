"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

export default function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const el = ref.current;
    const prevActive = document.activeElement as HTMLElement | null;

    const focusable = () => (el ? Array.from(el.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")) : []);

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const items = focusable();
        if (items.length === 0) {
          e.preventDefault();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", keyHandler);
    // set initial focus
    setTimeout(() => {
      const items = focusable();
      if (items.length) items[0].focus();
      else el?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", keyHandler);
      prevActive?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div ref={ref} className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6" role="document">
        {title ? <h2 className="text-lg font-medium" style={{ color: "var(--text)" }}>{title}</h2> : null}
        <div className="mt-4">{children}</div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[var(--border)]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
};

export default function Modal({ open, onClose, children, title }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const prev = document.activeElement as HTMLElement | null;
      ref.current?.focus();
      return () => prev?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Dialog"}
        ref={ref}
        tabIndex={-1}
        className="relative w-full max-w-lg rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4"
      >
        <div className="flex items-center justify-between">
          {title ? <h3 className="text-lg font-semibold">{title}</h3> : null}
          <button onClick={onClose} className="text-sm text-[var(--muted)]">
            Close
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
