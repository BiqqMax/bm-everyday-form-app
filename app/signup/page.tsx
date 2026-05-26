"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AuthShell } from "../../components/auth/AuthShell";
import { GoogleOAuthButton } from "../../components/auth/GoogleOAuthButton";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  ONBOARDING_ROUTE,
  getAuthTransitionUrl,
  getAuthVerifyUrl,
} from "../../lib/auth/flow";
import { createClient } from "../../lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasEmailAtSymbol = email.includes("@");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const emailValue = email.trim();
    const supabase = createClient();
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(ONBOARDING_ROUTE)}`
        : undefined;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: emailValue,
      password,
      options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    if (data.session) {
      router.replace(getAuthTransitionUrl(ONBOARDING_ROUTE));
      router.refresh();
      return;
    }

    router.replace(getAuthVerifyUrl("signup", emailValue, ONBOARDING_ROUTE));
    router.refresh();
  }

  return (
    <AuthShell
      title="Create your account"
      description="Join the easiest way to build, manage, and share forms."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        <GoogleOAuthButton label="Continue with Google" flow="signup" nextPath={ONBOARDING_ROUTE} />
        <div className="relative flex items-center">
          <div className="h-px flex-1 bg-border" />
          <span className="px-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="name@example.com"
            required
          />

          {hasEmailAtSymbol ? (
            <>
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Create a password"
                required
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                required
              />

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

              <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account…" : "Create account"}
              </Button>
            </>
          ) : (
            <div className="h-6" aria-hidden="true" />
          )}
        </form>
      </div>
    </AuthShell>
  );
}
