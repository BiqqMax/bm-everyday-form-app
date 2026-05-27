import { getSiteUrl } from "../supabase/env";

export type AuthFlow = "signup" | "login" | "reset" | "google";

export const OTP_LENGTH = 6;
export const OTP_RESEND_COOLDOWN_SECONDS = 30;
export const DASHBOARD_ROUTE = "/dashboard";
export const ONBOARDING_ROUTE = "/onboarding";
export const LOGIN_ROUTE = "/login";
export const SIGNUP_ROUTE = "/signup";
export const RESET_PASSWORD_ROUTE = "/reset-password";
export const AUTH_CALLBACK_ROUTE = "/auth/callback";
export const VERIFY_ROUTE = "/auth/verify";

export function getAuthNextRoute(flow: AuthFlow) {
  return flow === "signup" || flow === "google" ? ONBOARDING_ROUTE : DASHBOARD_ROUTE;
}

export function getAuthCallbackUrl(nextPath: string) {
  const url = new URL(AUTH_CALLBACK_ROUTE, getSiteUrl());
  url.searchParams.set("next", nextPath);
  return url.toString();
}

export function getAuthVerifyUrl(flow: AuthFlow, email: string, nextPath: string) {
  const url = new URL(VERIFY_ROUTE, getSiteUrl());
  url.searchParams.set("flow", flow);
  url.searchParams.set("email", email);
  url.searchParams.set("next", nextPath);
  return url.toString();
}

export function getRecoveryRoute() {
  return `${RESET_PASSWORD_ROUTE}?recovery=success`;
}
