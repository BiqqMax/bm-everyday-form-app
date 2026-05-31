"use client";

import type { ReactNode } from "react";

type AuthEntryGuardProps = {
  children: ReactNode;
};

type ProtectedRouteGuardProps = {
  children: ReactNode;
  expectedPath: "/dashboard" | "/onboarding" | "/settings";
};

export function AuthEntryGuard({ children }: AuthEntryGuardProps) {
  return <>{children}</>;
}

export function ProtectedRouteGuard({ children }: ProtectedRouteGuardProps) {
  return <>{children}</>;
}
