"use client";

import { useEffect } from "react";

const AUTH_HISTORY_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth/verify",
  "/auth/callback",
];

function isAuthReferrer(referrer: string) {
  if (!referrer) {
    return false;
  }

  try {
    const url = new URL(referrer);

    if (url.origin !== window.location.origin) {
      return false;
    }

    return AUTH_HISTORY_PATHS.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`));
  } catch {
    return false;
  }
}

export default function HistoryStabilizer() {
  useEffect(() => {
    if (!isAuthReferrer(document.referrer)) {
      return;
    }

    window.history.pushState(null, "", window.location.href);
  }, []);

  return null;
}
