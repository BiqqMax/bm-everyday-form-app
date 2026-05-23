import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

const PROTECTED_PATHS = ["/dashboard"];
const AUTH_PATHS = ["/login", "/forgot-password", "/reset-password"];

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value, cookie);
  });
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isAuthPath = AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (isProtectedPath && !user) {
    const redirect = NextResponse.redirect(new URL("/login", request.url));
    copyCookies(response, redirect);
    return redirect;
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
