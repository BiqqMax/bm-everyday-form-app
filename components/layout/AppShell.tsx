"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import SiteFooter from "./SiteFooter";
import HydrationGuard from "./HydrationGuard";

const HIDDEN_FOOTER_PATHS = [
  "/dashboard",
  "/onboarding",
  "/auth",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

function shouldHideFooter(pathname: string) {
  return HIDDEN_FOOTER_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const hideFooter = shouldHideFooter(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      <HydrationGuard />
      <div className="flex-1">{children}</div>

      {/* Always render footer element to reserve layout space; visually hide when appropriate */}
      {!hideFooter ? <SiteFooter /> : null}
    </div>
  );
}
