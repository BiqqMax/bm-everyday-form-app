import { NextResponse, type NextRequest } from "next/server";

import { DASHBOARD_ROUTE, getRecoveryRoute } from "../../../lib/auth/flow";
import { getPostAuthDestination } from "../../../lib/auth/post-auth";
import { createClient } from "../../../lib/supabase/server";
import { isSafeRedirectPath, sanitizeAuthInput } from "../../../lib/utils/validators";

const INTERNAL_PARAMS = new Set(["code", "token_hash", "type", "next"]);

function getFirstValue(value: string | string[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getPreservedSearchParams(searchParams: URLSearchParams) {
  const preserved = new URLSearchParams();
  const nextPath = searchParams.get("next");

  if (nextPath) {
    preserved.set("next", nextPath);
  }

  return preserved;
}

function appendSearchParams(path: string, searchParams: URLSearchParams) {
  if (!searchParams.size) {
    return path;
  }

  const url = new URL(path, "http://localhost");
  searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Handle OAuth and OTP authentication callbacks.
 *
 * Route Handlers can mutate cookies via next/headers cookies() API.
 * This is the required context for calling supabase.auth methods that
 * persist session tokens (exchangeCodeForSession, verifyOtp).
 *
 * Server Components cannot reliably set cookies; they are read-only.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = getFirstValue(searchParams.get("code"));
  const tokenHash = getFirstValue(searchParams.get("token_hash"));
  const type = getFirstValue(searchParams.get("type"));
  const nextPath = isSafeRedirectPath(getFirstValue(searchParams.get("next")), DASHBOARD_ROUTE);
  const preservedSearchParams = getPreservedSearchParams(searchParams);

  const supabase = await createClient();

  // OAuth callback: exchange authorization code for session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const errorUrl = new URL("/login", request.url);
      errorUrl.searchParams.set("error", "Unable to complete authentication.");
      return NextResponse.redirect(errorUrl);
    }

    const destination = await getPostAuthDestination(supabase, nextPath);
    const redirectUrl = new URL(appendSearchParams(destination, preservedSearchParams), request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // OTP callback: verify email link or recovery code
  if (tokenHash && type) {
    const typed = type as Parameters<typeof supabase.auth.verifyOtp>[0]["type"];
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: typed,
    });

    if (error) {
      const errorPath = typed === "recovery" ? "/forgot-password" : "/login";
      const errorMessage = typed === "recovery" ? "Recovery link could not be verified." : "Email verification could not be completed.";
      const errorUrl = new URL(errorPath, request.url);
      errorUrl.searchParams.set("error", errorMessage);
      return NextResponse.redirect(errorUrl);
    }

    let destination: string;

    if (typed === "recovery") {
      destination = getRecoveryRoute();
    } else {
      destination = await getPostAuthDestination(supabase, nextPath);
    }

    const redirectUrl = new URL(appendSearchParams(destination, preservedSearchParams), request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // No auth parameters provided; redirect to login
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}
