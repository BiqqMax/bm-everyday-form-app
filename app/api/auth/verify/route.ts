import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "../../../../lib/supabase/server";
import { isSafeRedirectPath } from "../../../../lib/utils/validators";
import { getAuthNextRoute, type AuthFlow } from "../../../../lib/auth/flow";

function getVerifyType(flow: AuthFlow) {
  if (flow === "reset") {
    return "recovery" as const;
  }

  if (flow === "login") {
    return "magiclink" as const;
  }

  return "signup" as const;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const flow = typeof body.flow === "string" ? (body.flow as AuthFlow) : "signup";
  const nextPath = typeof body.nextPath === "string" ? body.nextPath : getAuthNextRoute(flow);

  if (!email || !token) {
    return NextResponse.json({ error: "Please provide your email and verification code." }, { status: 400 });
  }

  const safeRedirect = isSafeRedirectPath(nextPath, getAuthNextRoute(flow));
  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: getVerifyType(flow),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ redirect: safeRedirect });
}
