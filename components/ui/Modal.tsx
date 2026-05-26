'use client';

import type { ReactNode } from 'react';
import { useEffect, useId, useRef } from 'react';

import Button from './Button';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const dialog = ref.current;
    const previousActive = document.activeElement as HTMLElement | null;

    const focusableSelector =
      "a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])";

    const getFocusableElements = () => (dialog ? Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)) : []);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements();

      if (focusable.length === 0) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    window.setTimeout(() => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        dialog?.focus();
      }
    }, 0);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousActive?.focus();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={joinClasses(
          'relative z-10 w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-foreground shadow-[var(--shadow)]',
        )}
      >
        {title ? <h2 id={titleId} className="text-lg font-semibold tracking-tight text-foreground">{title}</h2> : null}
        <div className={title ? 'mt-4' : ''}>{children}</div>
        <div className="mt-6 flex justify-end">
          <Button type="button" variant="secondary" size="md" onClick={onClose} className="w-20">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
