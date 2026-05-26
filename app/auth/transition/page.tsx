"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import BrandMark from "../../../components/layout/BrandMark";
import { TRANSITION_DURATION_MS } from "../../../lib/auth/flow";

export default function AuthTransitionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLeaving, setIsLeaving] = useState(false);

  const nextPath = searchParams.get("next") ?? "/dashboard";

  useEffect(() => {
    const fadeOutDelay = Math.max(0, TRANSITION_DURATION_MS - 450);

    const fadeTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, fadeOutDelay);

    const redirectTimer = window.setTimeout(() => {
      router.replace(nextPath);
      router.refresh();
    }, TRANSITION_DURATION_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [nextPath, router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLeaving(true);
        router.replace(nextPath);
        router.refresh();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nextPath, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div
        className={`flex w-full max-w-sm flex-col items-center gap-6 transition-all duration-500 ease-in-out ${
          isLeaving ? "translate-y-1 opacity-0 scale-[0.99]" : "translate-y-0 opacity-100 scale-100"
        }`}
      >
        <div className="animate-[auth-fade_2200ms_ease-in-out_infinite]">
          <BrandMark className="justify-center" />
        </div>

        <div className="w-full max-w-xs">
          <div className="h-2 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-subtle)]" aria-hidden="true">
            <div
              className={`h-full w-full origin-left rounded-full bg-[var(--accent)] transition-all duration-500 ease-in-out ${
                isLeaving ? "opacity-70" : ""
              } animate-[auth-progress_1800ms_ease-in-out_infinite]`}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes auth-progress {
          0% {
            transform: scaleX(0.12);
            opacity: 0.45;
          }
          50% {
            transform: scaleX(0.72);
            opacity: 0.85;
          }
          100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        @keyframes auth-fade {
          0% {
            opacity: 0.55;
            transform: translateY(4px);
          }
          50% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0.55;
            transform: translateY(4px);
          }
        }
      `}</style>
    </main>
  );
}
