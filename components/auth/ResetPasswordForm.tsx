"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AuthShell } from "./AuthShell";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { resetPasswordAction } from "../../lib/auth/actions";
import { AUTH_ACTION_INITIAL_STATE } from "../../lib/auth/action-state";
import { sanitizeAuthInput } from "../../lib/utils/validators";

type BannerTone = "error" | "success";

function Banner({ tone, children }: { tone: BannerTone; children: string }) {
  const classes = {
    error: "border-[rgba(180,35,24,0.18)] bg-[rgba(180,35,24,0.08)] text-[#7f1d1d]",
    success: "border-[rgba(15,93,70,0.18)] bg-[rgba(15,93,70,0.08)] text-[var(--accent)]",
  }[tone];

  return <p className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${classes}`}>{children}</p>;
}

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(resetPasswordAction, AUTH_ACTION_INITIAL_STATE);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const helperText = useMemo(() => {
    if (searchParams.get("recovery") === "success") {
      return "Your recovery code is verified. Choose a new password to finish securing the account.";
    }

    return "Choose a strong password you can use to sign in again. After saving, we will end the recovery session and return you to sign in.";
  }, [searchParams]);

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
        <form className="space-y-4" action={formAction}>
          <Input
            id="reset-password"
            name="password"
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
            name="confirmPassword"
            type="password"
            label="Confirm new password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat the password"
          />

          {state.status === "error" ? <Banner tone="error">{sanitizeAuthInput(state.message)}</Banner> : null}
          {state.status === "success" ? <Banner tone="success">{sanitizeAuthInput(state.message)}</Banner> : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            Update password
          </Button>
        </form>

        <p className="text-sm leading-6 text-muted-foreground">
          Once saved, your recovery session will be closed and you will sign in again with your new password.
        </p>
      </div>
    </AuthShell>
  );
}
