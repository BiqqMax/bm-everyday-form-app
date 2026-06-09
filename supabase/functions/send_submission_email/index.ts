import { Resend } from "npm:resend@4.1.2";

interface SubmissionAnswer {
  fieldId: string;
  label: string;
  value: string;
}

interface EmailRequestBody {
  formTitle: string;
  answers: SubmissionAnswer[];
  ownerEmail: string;
  /** Optional dashboard URL — if provided, a "View in Dashboard" button is shown. */
  dashboardUrl?: string;
}

function buildEmailHtml(
  formTitle: string,
  answers: SubmissionAnswer[],
  dashboardUrl?: string,
): string {
  const answerRows = answers
    .filter((a) => a.label.trim() !== "")
    .map((a) => {
      return `<tr>
        <td style="padding:10px 14px;border-bottom:1px solid #eaeaea;font-weight:600;color:#1a1a2e;vertical-align:top;width:35%">${a.label}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #eaeaea;color:#444;vertical-align:top;white-space:pre-wrap">${a.value}</td>
      </tr>`;
    })
    .join("");

  const dashboardButton = dashboardUrl
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px">
        <tr>
          <td align="center">
            <a href="${dashboardUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1a1a2e;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none">View in Dashboard</a>
          </td>
        </tr>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,sans-serif;background:#f4f4f7">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:28px 32px;text-align:center">
              <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px">Everyday Forms</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px">
              <p style="margin:0 0 8px;font-size:16px;color:#1a1a2e;font-weight:600">${formTitle}</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.5">You have received a new response for this form.</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
                ${answerRows}
              </table>

              ${dashboardButton}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#fafafa;text-align:center">
              <p style="margin:0;font-size:12px;color:#999">Sent by Everyday Forms</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function isValidEmailRequestBody(body: unknown): body is EmailRequestBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (typeof b.formTitle !== "string") return false;
  if (typeof b.ownerEmail !== "string") return false;
  if (!Array.isArray(b.answers)) return false;
  for (const answer of b.answers) {
    if (!answer || typeof answer !== "object") return false;
    const a = answer as Record<string, unknown>;
    if (
      typeof a.fieldId !== "string" ||
      typeof a.label !== "string" ||
      typeof a.value !== "string"
    ) {
      return false;
    }
  }
  return true;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!isValidEmailRequestBody(body)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing or invalid fields: formTitle, answers, ownerEmail",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { formTitle, answers, ownerEmail, dashboardUrl } = body;

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("[send_submission_email] RESEND_API_KEY is not set.");
    return new Response(
      JSON.stringify({ success: false, error: "Server configuration error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const resend = new Resend(apiKey);

    const html = buildEmailHtml(formTitle, answers, dashboardUrl);

    const { error } = await resend.emails.send({
      from: "Everyday Forms <noreply@everydayforms.com>",
      to: [ownerEmail],
      subject: "New response received",
      html,
    });

    if (error) {
      console.error("[send_submission_email] Resend returned an error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[send_submission_email] Unexpected error:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
