"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

import { AuthShell } from "../../components/auth/AuthShell";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { getPasswordResetCompleteTransitionUrl } from "../../lib/auth/flow";
import { getBrowserSupabaseClient } from "../../lib/supabase/client";
import { isStrongEnoughPassword, normalizePassword, sanitizeAuthInput } from "../../lib/utils/validators";

type BannerTone = "error" | "success";

function Banner({ tone, children }: { tone: BannerTone; children: string }) {
  const classes = {
    error: "border-[rgba(180,35,24,0.18)] bg-[rgba(180,35,24,0.08)] text-[#7f1d1d]",
    success: "border-[rgba(15,93,70,0.18)] bg-[rgba(15,93,70,0.08)] text-[var(--accent)]",
  }[tone];

  return <p className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${classes}`}>{children}</p>;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getBrowserSupabaseClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const helperText = useMemo(() => {
    if (searchParams.get("recovery") === "success") {
      return "Your recovery code is verified. Choose a new password to finish securing the account.";
    }

    return "Choose a strong password you can use to sign in again. After saving, we will end the recovery session and return you to sign in.";
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const normalizedPassword = normalizePassword(password);
    const normalizedConfirmation = normalizePassword(confirmPassword);

    if (!isStrongEnoughPassword(normalizedPassword)) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (normalizedPassword !== normalizedConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: normalizedPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    await supabase.auth.signOut();
    setMessage("Password updated successfully. Please sign in again with your new password.");
    router.replace(getPasswordResetCompleteTransitionUrl());
    router.refresh();
  }

  return (
    <AuthShell
      title="Set a new password"
      description={helperText}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/login" className="font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Back to sign in
          </Link>
          <Link href="/forgot-password" className="font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Request a new code
          </Link>
        </div>
      }
    >
      <div className="space-y-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            id="reset-password"
            type="password"
            label="New password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
          />

          <Input
            id="reset-confirm-password"
            type="password"
            label="Confirm new password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat the password"
          />

          {error ? <Banner tone="error">{sanitizeAuthInput(error)}</Banner> : null}
          {message ? <Banner tone="success">{sanitizeAuthInput(message)}</Banner> : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Updating password…" : "Update password"}
          </Button>
        </form>

        <p className="text-sm leading-6 text-muted-foreground">
          Once saved, your recovery session will be closed and you will sign in again with your new password.
        </p>
      </div>
    </AuthShell>
  );
}
