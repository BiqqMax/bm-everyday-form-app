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

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body = parseSubmissionBody(formData);
    console.log("[SUBMIT][BODY]", body);

    const publicToken = getFormString(formData, "publicToken");
    console.log("[SUBMIT][TOKEN]", publicToken);

    if (!publicToken) {
      return NextResponse.json({ message: "This form could not be submitted." }, { status: 400 });
    }

    const supabase = await createClient();
    const form = await loadPublicFormByToken(supabase, publicToken);
    console.log("[SUBMIT][FORM_RESOLVED]", form);

    if (!form) {
      return NextResponse.json({ message: "This form link is invalid or unavailable." }, { status: 404 });
    }

    const status = getShareStatus({
      isPublic: form.is_public,
      expiresAt: form.expires_at,
      responseLimit: form.response_limit,
      responseCount: form.response_count,
    });

    if (status === "draft") {
      return NextResponse.json({ message: "This form is still in draft." }, { status: 403 });
    }

    if (status === "expired") {
      return NextResponse.json({ message: "This form has expired." }, { status: 403 });
    }

    if (status === "limit_reached") {
      return NextResponse.json({ message: "This form has reached its response limit." }, { status: 403 });
    }

    const fields = await loadFormFields(supabase, form.id);
    console.log("[DB_FIELDS]", fields.map((field) => ({ id: field.id, label: field.label })));

    const validFieldIds = fields.map((field) => field.id);
    const clientFieldKeys = Object.keys(body).filter((key) => key.startsWith("field_"));
    console.log("[CLIENT_FIELD_KEYS]", clientFieldKeys);

    const invalidFieldIds = clientFieldKeys
      .map((key) => key.replace(/^field_/, "").replace(/\[\]$/, ""))
      .filter((fieldId) => fieldId.length > 0 && !validFieldIds.includes(fieldId));

    if (invalidFieldIds.length > 0) {
      console.error("[FIELD_MISMATCH]", {
        invalidFieldIds,
        validFieldIds,
      });
      throw new Error("Field mapping mismatch.");
    }

    const submissionPayload = fields.map((field) => {
      const singleValue = getBodyValues(body, `field_${field.id}`)[0] ?? "";
      const checkboxValues = getBodyValues(body, `field_${field.id}[]`);
      const rawValue = field.field_type === "checkbox" ? checkboxValues : singleValue ? [singleValue] : [];
      const value = normalizeFieldValue(field.field_type, rawValue.length ? rawValue : checkboxValues);

      return {
        field,
        value,
      };
    });

    const missingRequiredField = submissionPayload.find(({ field, value }) => field.is_required && isBlankValue(value));
    if (missingRequiredField) {
      return NextResponse.json(
        { message: `Please complete ${missingRequiredField.field.label}.` },
        { status: 400 }
      );
    }

    console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=POST query=submissions_insert table=submissions");
    const submissionInsert = await supabase
      .from("submissions")
      .insert({
        form_id: form.id,
        submitted_by_user_id: null,
      })
      .select("id")
      .maybeSingle();
    console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=POST query=submissions_insert table=submissions success");

    if (submissionInsert.error || !submissionInsert.data) {
      return NextResponse.json(
        { message: getFriendlyMessage(submissionInsert.error, "We couldn't save this response.") },
        { status: 400 }
      );
    }

    const submissionId = submissionInsert.data.id as string;

    const answersToInsert = submissionPayload
      .filter(({ value }) => !isBlankValue(value))
      .map(({ field, value }) => ({
        submission_id: submissionId,
        form_field_id: field.id,
        answer_value: Array.isArray(value) ? value.map((entry) => entry.trim()).filter(Boolean) : value.trim(),
      }));

    console.log("[ANSWERS_INSERT][PAYLOAD]", answersToInsert);
    console.log("[ANSWERS_FINAL_PAYLOAD]", answersToInsert);
    console.log("[MAPPED_ANSWERS]", answersToInsert);

    if (answersToInsert.length > 0) {
      console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=POST query=submission_answers_insert table=submission_answers");
      const result = await supabase.from("submission_answers").insert(answersToInsert);
      console.log("[ANSWERS_DB_RESULT]", result);
      const { error: answersError } = result;
      console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=POST query=submission_answers_insert table=submission_answers success");

      if (answersError) {
        console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=POST query=submissions_delete_cleanup table=submissions");
        await supabase.from("submissions").delete().eq("id", submissionId);
        console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=POST query=submissions_delete_cleanup table=submissions success");
        return NextResponse.json(
          { message: getFriendlyMessage(answersError, "We couldn't save all response answers.") },
          { status: 400 }
        );
      }
    }

    console.log("[SUBMIT][END_OF_INSERTS_REACHED]");
    console.log("[SUBMIT][ABOUT_TO_RETURN_SUCCESS]");
    console.log("[SUBMIT][ABOUT_TO_RETURN_400_CHECKS]");

    return NextResponse.json({ message: "Response submitted successfully." }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: getFriendlyMessage(error, "We couldn't submit this response.") },
      { status: 500 }
    );
  }
}
