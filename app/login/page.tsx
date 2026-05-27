"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AuthShell } from "../../components/auth/AuthShell";
import { GoogleOAuthButton } from "../../components/auth/GoogleOAuthButton";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { loginAction } from "../../lib/auth/actions";
import { AUTH_ACTION_INITIAL_STATE } from "../../lib/auth/action-state";
import { DASHBOARD_ROUTE } from "../../lib/auth/flow";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState(loginAction, AUTH_ACTION_INITIAL_STATE);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const resetSuccess = searchParams.get("reset") === "success";
  const hasEmailAtSymbol = email.includes("@");

  const helperText = useMemo(() => {
    if (resetSuccess) {
      return "Your password has been updated. Sign in again with your new password.";
    }

    return "Good to see you again. Sign in to keep going with your forms.";
  }, [resetSuccess]);

  return (
    <AuthShell
      title="Welcome back"
      description={helperText}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        <GoogleOAuthButton flow="login" nextPath={DASHBOARD_ROUTE} />
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
                autoComplete="current-password"
                placeholder="Enter your password"
                required
              />

              {state.status === "error" ? (
                <p className="text-sm leading-6 text-destructive" role="alert">
                  {state.message}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-4 text-sm">
                <Link href="/forgot-password" className="font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Sign in
              </Button>
            </>
          ) : null}
        </form>
      </div>
    </AuthShell>
  );
}
