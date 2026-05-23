"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Container from "../../components/layout/Container";
import Input from "../../components/ui/Input";
import { getBrowserSupabaseClient } from "../../lib/supabase/browser";

function getRedirectTarget(value: string | null) {
  if (!value) {
    return "/dashboard";
  }

  if (!value.startsWith("/")) {
    return "/dashboard";
  }

  return value;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);
  const redirectTo = getRedirectTarget(searchParams.get("redirectTo"));
  const initialMessage = searchParams.get("message");
  const initialError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(initialMessage);
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleEmailPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setError(null);
    setMessage(null);
    setIsGoogleLoading(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    setIsGoogleLoading(false);

    if (oauthError) {
      setError(oauthError.message);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Container className="py-8 sm:py-12">
        <div className="mx-auto w-full max-w-md">
          <Card className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--muted)]">Teacher access</p>
              <h1 className="text-2xl font-semibold">Sign in to Everyday Forms</h1>
              <p className="text-sm text-[var(--muted)]">
                Use your teacher account to manage forms, submissions, and QR sharing.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              aria-busy={isGoogleLoading}
            >
              {isGoogleLoading ? "Redirecting to Google..." : "Continue with Google"}
            </Button>

            <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
              <span className="h-px flex-1 bg-[var(--border)]" />
              <span>or sign in with email</span>
              <span className="h-px flex-1 bg-[var(--border)]" />
            </div>

            <form className="space-y-4" onSubmit={handleEmailPasswordSubmit}>
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teacher@school.edu"
              />
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />

              <div className="flex items-center justify-between gap-3">
                <a className="text-sm font-medium text-[var(--primary)]" href="/forgot-password">
                  Forgot password?
                </a>
              </div>

              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}
              {message ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {message}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading} aria-busy={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="text-sm text-[var(--muted)]">
              Protected route example: <a className="font-medium text-[var(--primary)]" href="/dashboard">Dashboard</a>
            </p>
          </Card>
        </div>
      </Container>
    </main>
  );
}
