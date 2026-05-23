"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Container from "../../components/layout/Container";
import Input from "../../components/ui/Input";
import { getBrowserSupabaseClient } from "../../lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    setMessage("Password updated successfully. Please sign in again with your new password.");
    router.replace("/login?message=Password%20updated%20successfully");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Container className="py-8 sm:py-12">
        <div className="mx-auto w-full max-w-md">
          <Card className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--muted)]">Password reset</p>
              <h1 className="text-2xl font-semibold">Set a new password</h1>
              <p className="text-sm text-[var(--muted)]">
                Choose a strong password you can use to sign in again.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
              />
              <Input
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat the password"
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
                {isSubmitting ? "Updating password..." : "Update password"}
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </main>
  );
}
