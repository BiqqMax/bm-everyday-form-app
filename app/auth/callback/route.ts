import { NextRequest, NextResponse } from "next/server";

import { getAuthTransitionUrl, getRecoveryRoute } from "../../../lib/auth/flow";
import { getPostAuthDestination } from "../../../lib/auth/post-auth";
import { createClient } from "../../../lib/supabase/server";
import { isSafeRedirectPath, sanitizeAuthInput } from "../../../lib/utils/validators";

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

function authErrorRedirect(request: NextRequest, path: string, message: string) {
  return redirectTo(request, `${path}?error=${encodeURIComponent(sanitizeAuthInput(message))}`);
}


export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const nextPath = isSafeRedirectPath(requestUrl.searchParams.get("next"), "/dashboard");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return authErrorRedirect(request, "/login", "Unable to complete authentication.");
    }

    const destination = await getPostAuthDestination(supabase, nextPath);
    return redirectTo(request, getAuthTransitionUrl(destination));
  }

  if (tokenHash && type) {
    const typed = type as Parameters<typeof supabase.auth.verifyOtp>[0]["type"];
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: typed,
    });

    if (error) {
      if (typed === "recovery") {
        return authErrorRedirect(request, "/forgot-password", "Recovery link could not be verified.");
      }

      return authErrorRedirect(request, "/login", "Email verification could not be completed.");
    }

    if (typed === "recovery") {
      return redirectTo(request, getRecoveryRoute());
    }

    const destination = await getPostAuthDestination(supabase, nextPath);
    return redirectTo(request, getAuthTransitionUrl(destination));
  }

  return redirectTo(request, "/login");
}
