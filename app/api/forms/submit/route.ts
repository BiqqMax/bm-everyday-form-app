import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "../../../../lib/supabase/server";
import { getFriendlyActionMessage } from "../../../../lib/utils/friendly-error";
import { getShareStatus } from "../../../../lib/forms/public";
import { getFormByPublicToken } from "../../../../lib/forms/public-resolver";

type SubmissionFieldValue = string | string[];

type PublicFieldRow = {
  id: string;
  label: string;
  field_type: "text" | "textarea" | "email" | "select" | "checkbox" | "radio" | "date";
  is_required: boolean;
  options: unknown;
  position: number;
};

type SubmissionAnswerRow = {
  submission_id: string;
  form_field_id: string;
  answer_value: SubmissionFieldValue;
};

type SubmissionRequestBody = {
  publicToken?: string;
  deviceId?: string;
  answers?: Array<{
    fieldId?: string;
    value?: string | string[];
  }>;
};

type ShareValidationResult =
  | { ok: true }
  | { ok: false; code: string; message: string; status: number };

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRequestAnswerValue(value: string | string[]) {
  if (Array.isArray(value)) {
    return value.map((entry) => entry.trim()).filter(Boolean);
  }

  return value.trim();
}

function normalizeFieldValue(fieldType: PublicFieldRow["field_type"], values: string[]): string | string[] {
  if (fieldType === "checkbox") {
    return values;
  }

  return values[0] ?? "";
}

function isBlankValue(value: SubmissionFieldValue) {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return value.trim().length === 0;
}

function isValidAnswerValue(value: SubmissionFieldValue) {
  if (Array.isArray(value)) {
    return value.every((entry) => entry.trim().length > 0);
  }

  return value.trim().length > 0;
}

function getFriendlyMessage(error: unknown, fallback: string) {
  const message = getFriendlyActionMessage(error);
  return message && message !== "An unexpected error occurred." ? message : fallback;
}

function parseSubmissionBody(formData: FormData) {
  const body: Record<string, string | string[]> = {};

  for (const [key, value] of formData.entries()) {
    const normalizedValue = typeof value === "string" ? value.trim() : `[${value.name}:${value.type}:${value.size}]`;

    if (key in body) {
      const currentValue = body[key];
      body[key] = Array.isArray(currentValue) ? [...currentValue, normalizedValue] : [currentValue, normalizedValue];
      continue;
    }

    body[key] = normalizedValue;
  }

  return body;
}

function getBodyValues(body: Record<string, string | string[]>, key: string) {
  const value = body[key];

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.length > 0) {
    return [value];
  }

  return [];
}

async function loadPublicFormByToken(supabase: Awaited<ReturnType<typeof createClient>>, qrShareToken: string) {
  console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=loadPublicFormByToken query=form_lookup table=forms qrShareToken");
  const form = await getFormByPublicToken(supabase, qrShareToken);
  console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=loadPublicFormByToken query=form_lookup table=forms success");
  return form;
}

async function loadFormFields(supabase: Awaited<ReturnType<typeof createClient>>, formId: string) {
  console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=loadFormFields query=form_fields table=form_fields formId");
  const { data, error } = await supabase
    .from("form_fields")
    .select("id,label,field_type,is_required,options,position")
    .eq("form_id", formId)
    .order("position", { ascending: true });
  console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=loadFormFields query=form_fields table=form_fields success");

  if (error) {
    throw error;
  }

  return (data ?? []) as PublicFieldRow[];
}

async function rollbackSubmissionWrites(supabase: Awaited<ReturnType<typeof createClient>>, submissionId: string) {
  console.log("[SUBMIT][ROLLBACK_START]", { submissionId });

  const answersDeleteResult = await supabase
    .from("submission_answers")
    .delete()
    .eq("submission_id", submissionId);

  if (answersDeleteResult.error) {
    console.error("[SUBMIT][ROLLBACK_ANSWERS_DELETE_FAILED]", answersDeleteResult.error);
  }

  const submissionDeleteResult = await supabase
    .from("submissions")
    .delete()
    .eq("id", submissionId);

  if (submissionDeleteResult.error) {
    console.error("[SUBMIT][ROLLBACK_SUBMISSION_DELETE_FAILED]", submissionDeleteResult.error);
  }

  console.log("[SUBMIT][ROLLBACK_COMPLETE]", { submissionId });
}

async function validateShareStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  form: {
    id: string;
    owner_id: string;
    is_public: boolean;
    expires_at: string | null;
    response_limit: number | null;
    response_count: number;
  },
  deviceId: string,
): Promise<ShareValidationResult> {
  // --- STEP 3a: Basic share status (draft / expired / limit_reached) ---
  const baseStatus = getShareStatus({
    isPublic: form.is_public,
    expiresAt: form.expires_at,
    responseLimit: form.response_limit,
    responseCount: form.response_count,
  });

  if (baseStatus === "draft") {
    return { ok: false, code: "SUBMIT_003", message: "This form is still in draft.", status: 403 };
  }

  if (baseStatus === "expired") {
    return { ok: false, code: "SUBMIT_004", message: "This form has expired.", status: 403 };
  }

  if (baseStatus === "limit_reached") {
    return { ok: false, code: "SUBMIT_005", message: "This form has reached its response limit.", status: 403 };
  }

  // --- STEP 3b: Device restriction check (only if profile setting enables it) ---
  const { data: profile } = await supabase
    .from("profiles")
    .select("restrict_multiple_submissions")
    .eq("id", form.owner_id)
    .maybeSingle();

  const restrictMultiple = profile?.restrict_multiple_submissions ?? false;
  console.log("[SUBMIT][VALIDATE] restrict_multiple_submissions", restrictMultiple);

  if (restrictMultiple) {
    const { data: existing } = await supabase
      .from("submissions")
      .select("id")
      .eq("form_id", form.id)
      .eq("device_id", deviceId)
      .maybeSingle();

    if (existing) {
      console.error("[SUBMIT_014] duplicate device submission blocked", { formId: form.id, deviceId });
      return { ok: false, code: "SUBMIT_014", message: "You have already submitted this form", status: 403 };
    }
  }

  return { ok: true };
}

export async function POST(request: NextRequest) {
  try {
    console.log("[SUBMIT_ROUTE_START]");
    console.log("[SUBMIT][START]");

    const contentType = request.headers.get("content-type") ?? "";
    let publicToken = "";
    let deviceId = "";
    let answersInput: SubmissionRequestBody["answers"] = [];
    let body: Record<string, string | string[]> = {};

    if (contentType.includes("application/json")) {
      const requestBody = (await request.json().catch(() => ({}))) as SubmissionRequestBody;
      publicToken = typeof requestBody.publicToken === "string" ? requestBody.publicToken.trim() : "";
      deviceId = typeof requestBody.deviceId === "string" ? requestBody.deviceId.trim() : "";
      answersInput = Array.isArray(requestBody.answers) ? requestBody.answers : [];
      console.log("[SUBMIT][BODY]", requestBody);
    } else {
      const formData = await request.formData();
      body = parseSubmissionBody(formData);
      console.log("[SUBMIT][BODY]", body);
      publicToken = getFormString(formData, "publicToken");
      deviceId = getFormString(formData, "deviceId");
      answersInput = [];
    }

    console.log("[SUBMIT][TOKEN]", publicToken);

    if (!publicToken) {
      console.error("[SUBMIT_001] publicToken missing");
      console.error("[SUBMIT_EXIT]", "SUBMIT_001");
      return NextResponse.json(
        { code: "SUBMIT_001", message: "This form could not be submitted." },
        { status: 400 }
      );
    }

    if (!deviceId) {
      console.error("[SUBMIT_013] deviceId missing");
      console.error("[SUBMIT_EXIT]", "SUBMIT_013");
      return NextResponse.json(
        { code: "SUBMIT_013", message: "This form could not be submitted." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // ═══════════════════════════════════════════════════════════════
    // STEP 1 — Load form
    // ═══════════════════════════════════════════════════════════════
    const form = await loadPublicFormByToken(supabase, publicToken);
    console.log("[SUBMIT][FORM_RESOLVED]", form);

    if (!form) {
      console.error("[SUBMIT_002] form not found");
      console.error("[SUBMIT_EXIT]", "SUBMIT_002");
      return NextResponse.json(
        { code: "SUBMIT_002", message: "This form link is invalid or unavailable." },
        { status: 404 }
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 2 — Load profile settings (for restrict_multiple_submissions)
    // ═══════════════════════════════════════════════════════════════
    // Done inside validateShareStatus — one fetch, one gate.

    // ═══════════════════════════════════════════════════════════════
    // STEP 3+4 — Compute unified status + BLOCK EARLY if invalid
    // ═══════════════════════════════════════════════════════════════
    const validation = await validateShareStatus(supabase, form, deviceId);
    if (!validation.ok) {
      console.error(`[SUBMIT_EXIT] ${validation.code}`);
      return NextResponse.json(
        { code: validation.code, message: validation.message },
        { status: validation.status }
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 5 — Load fields and build payload (no DB writes yet)
    // ═══════════════════════════════════════════════════════════════
    const fields = await loadFormFields(supabase, form.id);
    console.log("[SUBMIT][FIELDS_LOADED]");
    console.log(
      "[DB_FIELDS]",
      fields.map((field) => ({
        id: field.id,
        label: field.label,
      }))
    );

    const validFieldIds = fields.map((field) => field.id);

    const normalizedAnswers =
      answersInput.length > 0
        ? answersInput
            .map((answer) => {
              const fieldId = typeof answer?.fieldId === "string" ? answer.fieldId.trim() : "";
              if (!fieldId) {
                return null;
              }

              const value = answer.value;
              if (typeof value !== "string" && !Array.isArray(value)) {
                return null;
              }

              return {
                form_field_id: fieldId,
                answer_value: normalizeRequestAnswerValue(value),
              };
            })
            .filter((answer): answer is { form_field_id: string; answer_value: SubmissionFieldValue } => answer !== null)
        : [];

    console.log(
      "[CLIENT_FIELD_KEYS]",
      answersInput.length > 0 ? normalizedAnswers.map((answer) => answer.form_field_id) : []
    );

    const submissionPayload = fields.map((field) => {
      const answer = answersInput.length > 0 ? normalizedAnswers.find((entry) => entry.form_field_id === field.id) : null;

      const value =
        answer?.answer_value ??
        (field.field_type === "checkbox"
          ? normalizeFieldValue(field.field_type, getBodyValues(body, `field_${field.id}[]`))
          : normalizeFieldValue(field.field_type, getBodyValues(body, `field_${field.id}`)));

      return {
        field,
        value,
      };
    });

    const missingRequiredField = submissionPayload.find(({ field, value }) => field.is_required && isBlankValue(value));
    if (missingRequiredField) {
      console.error("[SUBMIT_006] required field missing", missingRequiredField.field.label);
      console.error("[SUBMIT_EXIT]", "SUBMIT_006");
      return NextResponse.json(
        { code: "SUBMIT_006", message: `Please complete ${missingRequiredField.field.label}.` },
        { status: 400 }
      );
    }

    const invalidFieldIds = submissionPayload
      .filter(({ value }) => !isBlankValue(value))
      .map(({ field }) => field.id)
      .filter((formFieldId) => !validFieldIds.includes(formFieldId));

    if (invalidFieldIds.length > 0) {
      console.error("[SUBMIT_007] invalid field mapping", {
        invalidFieldIds,
        validFieldIds,
      });
      console.error("[SUBMIT_EXIT]", "SUBMIT_007");
      return NextResponse.json(
        { code: "SUBMIT_007", message: "This form could not be submitted." },
        { status: 400 }
      );
    }

    // Generate submissionId in application code (UUID)
    const submissionId = crypto.randomUUID();

    // Build answers using the unified submissionPayload
    // Works identically for JSON and FormData paths
    const answersWithSubmissionId: SubmissionAnswerRow[] = submissionPayload
      .filter(({ value }) => !isBlankValue(value))
      .map(({ field, value }) => ({
        submission_id: submissionId,
        form_field_id: field.id,
        answer_value: value,
      }));

    // Validate answers before any DB write
    const invalidAnswerRows = answersWithSubmissionId.filter((answer) => {
      return (
        !answer.submission_id ||
        !validFieldIds.includes(answer.form_field_id) ||
        !isValidAnswerValue(answer.answer_value)
      );
    });

    if (invalidAnswerRows.length > 0) {
      console.error("[SUBMIT_010] invalid answer rows", {
        invalidFieldIds: invalidAnswerRows.map((answer) => answer.form_field_id),
        validFieldIds,
      });
      console.error("[SUBMIT_EXIT]", "SUBMIT_010");
      return NextResponse.json(
        { code: "SUBMIT_010", message: "This form could not be submitted." },
        { status: 400 }
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 6 — Atomic increment response_count with limit check
    // ═══════════════════════════════════════════════════════════════
    // The RPC locks the form row with SELECT ... FOR UPDATE, reads
    // response_count & response_limit, rejects if limit reached,
    // otherwise increments — all in a single atomic operation.
    //
    // This eliminates the TOCTOU race condition between the
    // application-level limit check and the increment step.
    console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=POST query=increment_form_response_count_rpc table=forms formId");
    const incrementResult = await supabase.rpc("increment_form_response_count_rpc", { form_id: form.id });

    if (incrementResult.error) {
      console.error("[SUBMIT][INCREMENT_FAILED]", incrementResult.error);
      console.error("[SUBMIT_EXIT]", "SUBMIT_012");
      return NextResponse.json(
        { code: "SUBMIT_012", message: "We couldn't submit this response." },
        { status: 500 }
      );
    }

    const incrementAccepted = incrementResult.data as boolean | null;

    if (incrementAccepted === false) {
      // RPC rejected: response_limit already reached
      console.error("[SUBMIT_EXIT]", "SUBMIT_005");
      return NextResponse.json(
        { code: "SUBMIT_005", message: "This form has reached its response limit." },
        { status: 403 }
      );
    }

    console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=POST query=increment_form_response_count_rpc table=forms success");

    // ═══════════════════════════════════════════════════════════════
    // STEP 7 — Insert submission (count already claimed atomically)
    // ═══════════════════════════════════════════════════════════════
    // The count has already been incremented. If the submission or
    // answers insert fails, we must decrement to avoid drift.
    console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=POST query=submissions_insert table=submissions");
    const submissionInsert = await supabase.from("submissions").insert({
      id: submissionId,
      form_id: form.id,
      device_id: deviceId,
      submitted_by_user_id: null,
    });
    console.log("[SUBMISSION_INSERT_RESULT]", submissionInsert);

    if (submissionInsert.error) {
      // Roll back the count — submission didn't actually get created
      console.error("[SUBMIT_008] submission insert failed", submissionInsert.error);
      await supabase.rpc("decrement_form_response_count_rpc", { form_id: form.id });
      console.error("[SUBMIT_EXIT]", "SUBMIT_008");
      return NextResponse.json(
        { code: "SUBMIT_008", message: "We couldn't save this response." },
        { status: 400 }
      );
    }

    console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=POST query=submissions_insert table=submissions success");
    console.log("[SUBMIT][SUBMISSION_INSERT_SUCCESS]");

    // Insert answers using same submissionId — no select() after insert
    console.log("[SUBMIT][ANSWERS_INSERT_ATTEMPT]");

    if (answersWithSubmissionId.length > 0) {
      const answersInsert = await supabase.from("submission_answers").insert(answersWithSubmissionId);
      console.log("[ANSWERS_DB_RESULT]", answersInsert);

      if (answersInsert.error) {
        console.error("[SUBMIT_011] submission_answers insert failed", answersInsert.error);
        console.error("[SUBMIT_EXIT]", "SUBMIT_011");
        await rollbackSubmissionWrites(supabase, submissionId);
        // Count was already incremented — roll it back since the submission is gone
        await supabase.rpc("decrement_form_response_count_rpc", { form_id: form.id });
        return NextResponse.json(
          { code: "SUBMIT_011", message: "We couldn't save this response." },
          { status: 400 }
        );
      }
    }

    console.log("[SUBMIT][FINAL_SUCCESS_RETURN]");

    return NextResponse.json({ message: "Response submitted successfully." }, { status: 200 });
  } catch (error) {
    console.error("[SUBMIT_012] unexpected error", error);
    console.error("[SUBMIT_EXIT]", "SUBMIT_012");
    return NextResponse.json(
      { code: "SUBMIT_012", message: getFriendlyMessage(error, "We couldn't submit this response.") },
      { status: 500 }
    );
  }
}
