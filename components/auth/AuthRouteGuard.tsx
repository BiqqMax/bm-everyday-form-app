"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UnifiedLoading from "../ui/UnifiedLoading";
import { DASHBOARD_ROUTE, LOGIN_ROUTE, ONBOARDING_ROUTE } from "../../lib/auth/flow";
import { useAuthBoot } from "./AuthBootProvider";

type AuthEntryGuardProps = {
  children: ReactNode;
};

type ProtectedRouteGuardProps = {
  children: ReactNode;
  expectedPath: "/dashboard" | "/onboarding";
};


export function AuthEntryGuard({ children }: AuthEntryGuardProps) {
  const router = useRouter();
  const { isBooted, user, onboardingCompleted } = useAuthBoot();
  const destination = onboardingCompleted ? DASHBOARD_ROUTE : ONBOARDING_ROUTE;

  useEffect(() => {
    if (!isBooted || !user) {
      return;
    }

    router.replace(destination);
  }, [destination, isBooted, router, user]);

  if (!isBooted) {
    return <UnifiedLoading title="Loading..." />;
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}

export function ProtectedRouteGuard({ children, expectedPath }: ProtectedRouteGuardProps) {
  const router = useRouter();
  const { isBooted, user, onboardingCompleted } = useAuthBoot();

  useEffect(() => {
    if (!isBooted) {
      return;
    }

    if (!user) {
      router.replace(LOGIN_ROUTE);
      return;
    }

    if (expectedPath === "/dashboard" && !onboardingCompleted) {
      router.replace(ONBOARDING_ROUTE);
      return;
    }

    if (expectedPath === "/onboarding" && onboardingCompleted) {
      router.replace(DASHBOARD_ROUTE);
      return;
    }
  }, [expectedPath, isBooted, onboardingCompleted, router, user]);
  // While auth is not booted, do not render protected children.
  if (!isBooted) {
    return <UnifiedLoading title="Loading..." />;
  }

  // After boot, enforce client-side redirects when the session doesn't match
  // the expected route. If we reach this point and the user is authorized,
  // render the children.
  if (!user || (expectedPath === "/dashboard" && !onboardingCompleted) || (expectedPath === "/onboarding" && onboardingCompleted)) {
    return null;
  }

  return <>{children}</>;
}
