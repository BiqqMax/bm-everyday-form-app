"use client";

import { useMemo, useState, type FormEvent } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Container from "../../components/layout/Container";
import Input from "../../components/ui/Input";
import { getBrowserSupabaseClient } from "../../lib/supabase/browser";

function getLoginHref(message: string | null) {
  if (!message) {
    return "/login";
  }

  return `/login?message=${encodeURIComponent(message)}`;
}

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setIsSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Password reset email sent. Check your inbox and follow the link to continue.");
    setEmail("");
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Container className="py-8 sm:py-12">
        <div className="mx-auto w-full max-w-md">
          <Card className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--muted)]">Account recovery</p>
              <h1 className="text-2xl font-semibold">Reset your password</h1>
              <p className="text-sm text-[var(--muted)]">
                We will send a secure recovery link to your email address.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teacher@school.edu"
              />

              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}
              {message ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {message}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? "Sending link..." : "Send recovery link"}
              </Button>
            </form>

            <p className="text-sm text-[var(--muted)]">
              Remembered your password?{" "}
              <a className="font-medium text-[var(--primary)]" href={getLoginHref(message)}>
                Back to sign in
              </a>
            </p>
          </Card>
        </div>
      </Container>
    </main>
  );
}
