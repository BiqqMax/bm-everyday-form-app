"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthShell } from "./AuthShell";
import { OtpCodeInput } from "./OtpCodeInput";
import Button from "../ui/Button";
import { createClient } from "../../lib/supabase/browser";
import {
  OTP_LENGTH,
  OTP_RESEND_COOLDOWN_SECONDS,
  RESET_PASSWORD_ROUTE,
  getAuthCallbackUrl,
  getAuthNextRoute,
  type AuthFlow,
} from "../../lib/auth/flow";
import { isSafeRedirectPath, normalizeEmail, sanitizeAuthInput } from "../../lib/utils/validators";

type SearchParams = Record<string, string | string[] | undefined>;

type AuthVerifyClientProps = {
  searchParams: SearchParams;
};

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getFlowLabel(flow: AuthFlow) {
  if (flow === "signup") {
    return "Verify your email";
  }

  if (flow === "reset") {
    return "Confirm recovery code";
  }

  return "Verify your sign-in";
}

function getFlowDescription(flow: AuthFlow, email: string) {
  if (flow === "signup") {
    return `We sent the code to ${email}.\n\nIf you do not see it, check your spam or junk folder.`;
  }

  if (flow === "reset") {
    return "Enter the recovery code sent to your email.";
  }

  return "Enter the code to continue.";
}

function getDefaultNextPath(flow: AuthFlow) {
  if (flow === "reset") {
    return RESET_PASSWORD_ROUTE;
  }

  return getAuthNextRoute(flow);
}

export default function AuthVerifyClient({ searchParams }: AuthVerifyClientProps) {
  const router = useRouter();

  const flow = (getFirstValue(searchParams.flow) as AuthFlow | null) ?? "signup";
  const email = normalizeEmail(getFirstValue(searchParams.email));
  const nextPath = isSafeRedirectPath(getFirstValue(searchParams.next), getDefaultNextPath(flow));
  const errorParam = getFirstValue(searchParams.error);

  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(errorParam ? sanitizeAuthInput(errorParam) : null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const isReady = useMemo(() => code.length === OTP_LENGTH, [code]);
  const canResend = cooldownRemaining === 0 && !isSubmitting;

  useEffect(() => {
    if (!cooldownRemaining) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldownRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownRemaining]);

  useLayoutEffect(() => {
    if (!email) {
      router.replace("/login");
    }
  }, [email, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        token: code,
        flow,
        nextPath,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      setError(data.error ?? "Unable to verify code.");
      setIsSubmitting(false);
      return;
    }

    window.location.replace(data.redirect ?? nextPath);
  }

  async function handleResend() {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const redirectTo = getAuthCallbackUrl(nextPath);

    let resendErrorMessage: string | null = null;

    if (flow === "reset") {
      const { error: resendError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      resendErrorMessage = resendError?.message ?? null;
    } else if (flow === "login") {
      const { error: resendError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      resendErrorMessage = resendError?.message ?? null;
    } else {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      resendErrorMessage = resendError?.message ?? null;
    }

    if (resendErrorMessage) {
      setError(resendErrorMessage);
      setIsSubmitting(false);
      return;
    }

    setCooldownRemaining(OTP_RESEND_COOLDOWN_SECONDS);
    setMessage("A fresh code has been sent to your email.");
    setIsSubmitting(false);
  }

  return (
    <AuthShell
      title={getFlowLabel(flow)}
      description={getFlowDescription(flow, email)}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/login" className="font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Back to sign in
          </Link>
          <Link href="/signup" className="font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Use another account
          </Link>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <OtpCodeInput value={code} onChange={setCode} disabled={isSubmitting} />

        {error ? (
          <p className="text-sm leading-6 text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="text-sm leading-6 text-foreground" role="status">
            {message}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" className="w-full sm:flex-1" disabled={!isReady || isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Verifying...
              </span>
            ) : (
              "Verify code"
            )}
          </Button>
          <Button type="button" variant="secondary" className="w-full sm:w-auto" disabled={!canResend} onClick={handleResend}>
            {cooldownRemaining ? `Resend in ${cooldownRemaining}s` : "Resend code"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
