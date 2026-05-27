import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

const PROTECTED_PATHS = ["/dashboard", "/onboarding"];
const AUTH_PATHS = ["/login", "/signup"];
const CALLBACK_PATH = "/auth/callback";

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value, cookie);
  });
}

function markNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isAuthPath = AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isCallbackPath = pathname === CALLBACK_PATH;

  if (isProtectedPath && !user) {
    const redirect = markNoStore(NextResponse.redirect(new URL("/login", request.url)));
    copyCookies(response, redirect);
    return redirect;
  }

  if (isCallbackPath) {
    return markNoStore(response);
  }

  if (isAuthPath && user) {
    const redirect = markNoStore(NextResponse.redirect(new URL("/dashboard", request.url)));
    copyCookies(response, redirect);
    return redirect;
  }

  if (isProtectedPath || isAuthPath) {
    return markNoStore(response);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
