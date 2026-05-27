"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { AuthShell } from "../../components/auth/AuthShell";
import { GoogleOAuthButton } from "../../components/auth/GoogleOAuthButton";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { signupAction } from "../../lib/auth/actions";
import { AUTH_ACTION_INITIAL_STATE } from "../../lib/auth/action-state";
import { ONBOARDING_ROUTE } from "../../lib/auth/flow";

export default function SignupPage() {
  const [state, formAction] = useActionState(signupAction, AUTH_ACTION_INITIAL_STATE);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const hasEmailAtSymbol = email.includes("@");

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

              <Button type="submit" variant="primary" className="w-full">
                Create account
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
