import { NextResponse } from "next/server";

const SUPABASE_EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send_submission_email`;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { formTitle, answers, ownerEmail, dashboardUrl } = body;

    if (!formTitle || !answers || !ownerEmail) {
      return NextResponse.json(
        { error: "Missing required fields: formTitle, answers, ownerEmail" },
        { status: 400 },
      );
    }

    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseAnonKey) {
      return NextResponse.json(
        { error: "Server configuration error: missing anon key" },
        { status: 500 },
      );
    }

    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ formTitle, answers, ownerEmail, dashboardUrl }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[send-submission-email] Edge Function returned an error:",
        response.status,
        errorText,
      );
      return NextResponse.json(
        { error: `Edge Function error: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[send-submission-email] Proxy error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
