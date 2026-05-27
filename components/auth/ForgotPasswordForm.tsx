"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { AuthShell } from "./AuthShell";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { forgotPasswordAction } from "../../lib/auth/actions";
import { AUTH_ACTION_INITIAL_STATE } from "../../lib/auth/action-state";

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, AUTH_ACTION_INITIAL_STATE);
  const [email, setEmail] = useState("");

  return (
    <AuthShell
      title="Reset your password"
      description="Enter the email tied to your account and we’ll send a recovery link."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Return to sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" action={formAction}>
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

        {state.status === "error" ? (
          <p className="text-sm leading-6 text-destructive" role="alert">
            {state.message}
          </p>
        ) : null}

        {state.status === "success" ? (
          <p className="text-sm leading-6 text-foreground" role="status">
            {state.message}
          </p>
        ) : null}

        <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Sending link...
            </span>
          ) : (
            "Send recovery link"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
