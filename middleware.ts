import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

/**
 * Middleware for session refresh.
 *
 * Supabase Auth uses refresh tokens (single-use) to obtain new access tokens
 * when the current access token expires. The middleware pattern ensures that:
 *
 * 1. Session refresh happens before any page renders
 * 2. Refreshed tokens are sent back in Set-Cookie headers
 * 3. Browser and server stay in sync with regards to the user session
 *
 * Reference: @supabase/ssr design.md
 * > "Using the middleware pattern is mandatory. Session refresh happens in
 * > the middleware. Not using a middleware function means that the session
 * > will likely not be properly refreshed, given that server pages and
 * > components don't always get to set cookies."
 */
export async function middleware(request: NextRequest) {
  const { response } = await updateSession(request);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
