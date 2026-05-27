"use client";

import { useState } from "react";

import { getAuthCallbackUrl, getAuthNextRoute, type AuthFlow } from "../../lib/auth/flow";
import { createClient } from "../../lib/supabase/client";
import Button from "../ui/Button";

type GoogleOAuthButtonProps = {
  label?: string;
  className?: string;
  flow?: AuthFlow;
  nextPath?: string;
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none">
      <path
        d="M21.35 12.27c0-.79-.07-1.54-.2-2.27H12v4.29h5.44c-.24 1.28-.97 2.36-2.05 3.09v2.57h3.32c1.94-1.78 3.06-4.4 3.06-7.68Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.96-.9 6.62-2.45l-3.32-2.57c-.92.62-2.1.99-3.3.99-2.53 0-4.68-1.71-5.45-4.02H2.42v2.66A9.99 9.99 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.55 13.95A5.98 5.98 0 0 1 6.25 12c0-.68.12-1.34.3-1.95V7.39H2.42A9.99 9.99 0 0 0 2 12c0 1.61.39 3.13 1.06 4.47l3.49-2.52Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.47 0 2.79.51 3.84 1.5l2.88-2.88C16.95 2.34 14.69 1.4 12 1.4A9.99 9.99 0 0 0 3.48 7.39l3.07 2.66C7.32 7.09 9.47 5.38 12 5.38Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleOAuthButton({
  label = "Continue with Google",
  className = "",
  flow = "login",
  nextPath,
}: GoogleOAuthButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const targetPath = nextPath ?? getAuthNextRoute(flow);

  async function handleGoogleSignIn() {
    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const redirectTo = getAuthCallbackUrl(targetPath);
    const { data, error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (signInError || !data.url) {
      setError("Unable to start Google sign-in.");
      setIsSubmitting(false);
      return;
    }

    window.location.assign(data.url);
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        className={`w-full justify-center ${className}`.trim()}
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        <GoogleIcon />
        <span>{label}</span>
      </Button>
      {error ? (
        <p className="text-sm leading-6 text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
