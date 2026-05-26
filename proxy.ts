import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

const PROTECTED_PATHS = ["/dashboard", "/onboarding"];
const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/auth/verify"];
const RECOVERY_PATH = "/reset-password";

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value, cookie);
  });
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname, searchParams } = request.nextUrl;

  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isAuthPath = AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isRecoveryPath = pathname === RECOVERY_PATH;

  if (isProtectedPath && !user) {
    const redirect = NextResponse.redirect(new URL("/login", request.url));
    copyCookies(response, redirect);
    return redirect;
  }

  if (isRecoveryPath) {
    if (!user) {
      const redirect = NextResponse.redirect(new URL("/forgot-password", request.url));
      copyCookies(response, redirect);
      return redirect;
    }

    if (searchParams.get("recovery") !== "success") {
      const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
      copyCookies(response, redirect);
      return redirect;
    }
  }

  if (isAuthPath && user) {
    const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
    copyCookies(response, redirect);
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
