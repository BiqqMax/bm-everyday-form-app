"use client";

import { useEffect, useMemo, useRef } from "react";

import { OTP_LENGTH } from "../../lib/auth/flow";

type OtpCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
  description?: string;
};

function normalizeCode(value: string) {
  return value.replace(/\D/g, "").slice(0, OTP_LENGTH);
}

function splitCode(value: string) {
  return Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? "");
}

export function OtpCodeInput({
  value,
  onChange,
  disabled = false,
  autoFocus = true,
  label = "Enter the code to continue.",
  description,
}: OtpCodeInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = useMemo(() => splitCode(normalizeCode(value)), [value]);

  useEffect(() => {
    if (!autoFocus || disabled) {
      return;
    }

    const firstEmptyIndex = digits.findIndex((digit) => !digit);
    const nextIndex = firstEmptyIndex === -1 ? OTP_LENGTH - 1 : firstEmptyIndex;
    inputRefs.current[nextIndex]?.focus();
  }, [autoFocus, digits, disabled]);

  function updateCode(nextDigits: string[]) {
    onChange(nextDigits.join("").slice(0, OTP_LENGTH));
  }

  function focusIndex(index: number) {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  }

  function handleChange(index: number, nextValue: string) {
    const normalized = normalizeCode(nextValue);
    if (!normalized) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      updateCode(nextDigits);
      return;
    }

    const nextDigits = [...digits];
    let cursor = index;

    for (const digit of normalized) {
      if (cursor >= OTP_LENGTH) {
        break;
      }

      nextDigits[cursor] = digit;
      cursor += 1;
    }

    updateCode(nextDigits);

    const nextFocus = Math.min(cursor, OTP_LENGTH - 1);
    focusIndex(nextFocus);
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      if (digits[index]) {
        event.preventDefault();
        const nextDigits = [...digits];
        nextDigits[index] = "";
        updateCode(nextDigits);
        focusIndex(index);
        return;
      }

      if (index > 0) {
        event.preventDefault();
        focusIndex(index - 1);
        const nextDigits = [...digits];
        nextDigits[index - 1] = "";
        updateCode(nextDigits);
      }
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusIndex(index + 1);
    }
  }

  function handlePaste(index: number, event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = normalizeCode(event.clipboardData.getData("text"));
    if (!pasted) {
      return;
    }

    const nextDigits = [...digits];
    let cursor = index;

    for (const digit of pasted) {
      if (cursor >= OTP_LENGTH) {
        break;
      }

      nextDigits[cursor] = digit;
      cursor += 1;
    }

    updateCode(nextDigits);
    focusIndex(Math.min(cursor, OTP_LENGTH - 1));
  }

  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="block text-sm font-medium text-foreground">{label}</legend>
      {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}

      <div className="flex flex-nowrap justify-center gap-1.5 overflow-x-auto pb-1 sm:gap-3" aria-label={label}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(node) => {
              inputRefs.current[index] = node;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={OTP_LENGTH}
            aria-label={`Digit ${index + 1}`}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            className="h-14 w-11 shrink-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-center text-lg font-semibold tracking-[0.18em] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-75 sm:h-16 sm:w-14"
          />
        ))}
      </div>
    </fieldset>
  );
}
