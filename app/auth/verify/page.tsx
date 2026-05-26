"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { AuthShell } from "../../../components/auth/AuthShell";
import Button from "../../../components/ui/Button";
import { OtpCodeInput } from "../../../components/auth/OtpCodeInput";
import { createClient } from "../../../lib/supabase/client";
import {
  getAuthNextRoute,
  getAuthTransitionUrl,
  OTP_RESEND_COOLDOWN_SECONDS,
  type AuthFlow,
} from "../../../lib/auth/flow";
import { normalizeEmail, sanitizeAuthInput } from "../../../lib/utils/validators";

function getFlowLabel(flow: AuthFlow) {
  if (flow === "signup") {
    return "Verify your email";
  }

  if (flow === "reset") {
    return "Confirm recovery code";
  }

  return "Verify your sign-in";
}

function getFlowDescription(flow: AuthFlow) {
  if (flow === "signup") {
    return undefined;
  }

  if (flow === "reset") {
    return "Enter your recovery code.";
  }

  return "Enter the code to continue.";
}

export default function AuthVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const flow = (searchParams.get("flow") as AuthFlow | null) ?? "signup";
  const email = normalizeEmail(searchParams.get("email") ?? "");
  const nextPath = searchParams.get("next") ?? getAuthNextRoute(flow);
  const errorParam = searchParams.get("error");

  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(errorParam);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const canResend = cooldownRemaining === 0 && !isSubmitting;
  const isReady = useMemo(() => code.length === 6, [code]);

  useEffect(() => {
    if (!cooldownRemaining) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldownRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownRemaining]);

  useEffect(() => {
    if (!email) {
      router.replace("/login");
    }
  }, [email, router]);

  async function verifyOtp() {
    const supabase = createClient();

    if (flow === "reset") {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "recovery",
      });

      if (verifyError) {
        return verifyError.message;
      }

      return null;
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: flow === "login" ? "magiclink" : "signup",
    });

    if (verifyError) {
      return verifyError.message;
    }

    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const verificationError = await verifyOtp();

    if (verificationError) {
      setError(verificationError);
      setIsSubmitting(false);
      return;
    }

    const transitionUrl = getAuthTransitionUrl(nextPath);
    router.replace(transitionUrl);
    router.refresh();
  }

  async function handleResend() {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}` : undefined;

    let resendErrorMessage: string | null = null;

    if (flow === "reset") {
      const { error: resendError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      resendErrorMessage = resendError?.message ?? null;
    } else if (flow === "login") {
      const { error: resendError } = await supabase.auth.signInWithOtp({
        email,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
      });
      resendErrorMessage = resendError?.message ?? null;
    } else {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
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
      description={getFlowDescription(flow)}
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
        <div className="space-y-1 text-sm leading-6 text-muted-foreground">
          <p>
            We sent the code to <span className="font-medium text-foreground">{sanitizeAuthInput(email)}</span>.
          </p>
          <p>If you do not see it, check your spam or junk folder.</p>
        </div>

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
          <Button type="submit" className="w-full sm:flex-1" disabled={!isReady || isSubmitting}>
            {isSubmitting ? "Verifying…" : "Verify code"}
          </Button>
          <Button type="button" variant="secondary" className="w-full sm:w-auto" disabled={!canResend} onClick={handleResend}>
            {cooldownRemaining ? `Resend in ${cooldownRemaining}s` : "Resend code"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
