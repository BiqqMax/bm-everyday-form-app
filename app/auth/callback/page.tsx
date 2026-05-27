import { redirect } from "next/navigation";

import { DASHBOARD_ROUTE, getRecoveryRoute } from "../../../lib/auth/flow";
import { getPostAuthDestination } from "../../../lib/auth/post-auth";
import { createClient } from "../../../lib/supabase/server";
import { isSafeRedirectPath, sanitizeAuthInput } from "../../../lib/utils/validators";

const INTERNAL_PARAMS = new Set(["code", "token_hash", "type", "next"]);

type SearchParams = Record<string, string | string[] | undefined>;

function redirectTo(path: string): never {
  redirect(path);
}

function authErrorRedirect(path: string, message: string): never {
  redirectTo(`${path}?error=${encodeURIComponent(sanitizeAuthInput(message))}`);
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getPreservedSearchParams(searchParams: SearchParams) {
  const preserved = new URLSearchParams();
  const nextPath = getFirstValue(searchParams.next);

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

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const code = getFirstValue(resolvedSearchParams.code);
  const tokenHash = getFirstValue(resolvedSearchParams.token_hash);
  const type = getFirstValue(resolvedSearchParams.type);
  const nextPath = isSafeRedirectPath(getFirstValue(resolvedSearchParams.next), DASHBOARD_ROUTE);
  const preservedSearchParams = getPreservedSearchParams(resolvedSearchParams);

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      authErrorRedirect("/login", "Unable to complete authentication.");
    }

    const destination = await getPostAuthDestination(supabase, nextPath);
    redirectTo(appendSearchParams(destination, preservedSearchParams));
  }

  if (tokenHash && type) {
    const typed = type as Parameters<typeof supabase.auth.verifyOtp>[0]["type"];
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: typed,
    });

    if (error) {
      if (typed === "recovery") {
        authErrorRedirect("/forgot-password", "Recovery link could not be verified.");
      }

      authErrorRedirect("/login", "Email verification could not be completed.");
    }

    if (typed === "recovery") {
      redirectTo(appendSearchParams(getRecoveryRoute(), preservedSearchParams));
    }

    const destination = await getPostAuthDestination(supabase, nextPath);
    redirectTo(appendSearchParams(destination, preservedSearchParams));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirectTo("/login");
  }

  const destination = await getPostAuthDestination(supabase, nextPath);
  redirectTo(appendSearchParams(destination, preservedSearchParams));
}

export function generateMetadata(): { title: string; description: string } {
  return {
    title: "Authenticating | Everyday Forms",
    description: "Completing sign in and account recovery.",
  };
}
