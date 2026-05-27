import { NextRequest, NextResponse } from "next/server";

import { AUTH_CALLBACK_ROUTE, LOGIN_ROUTE } from "../../lib/auth/flow";
import { signOutServerSide } from "../../lib/auth/logout";

function redirectTo(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export async function GET(request: NextRequest) {
  await signOutServerSide();
  return redirectTo(request, `${AUTH_CALLBACK_ROUTE}?next=${encodeURIComponent(LOGIN_ROUTE)}`);
}
