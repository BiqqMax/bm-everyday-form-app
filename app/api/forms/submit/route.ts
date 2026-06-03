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
    const formId = getFormString(formData, "formId");
    const publicToken = getFormString(formData, "publicToken");
    const token = publicToken;

    if (!formId || !token) {
      return NextResponse.json({ message: "This form could not be submitted." }, { status: 400 });
    }

    const supabase = await createClient();
    const form = await loadPublicFormByToken(supabase, token);

    if (!form || form.id !== formId) {
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
    const submissionPayload = fields.map((field) => {
      const singleValue = getFormString(formData, `field_${field.id}`);
      const multiValues = formData.getAll(`field_${field.id}[]`).filter((value): value is string => typeof value === "string");
      const rawValue = field.field_type === "checkbox" ? multiValues : singleValue ? [singleValue] : [];

      return {
        field,
        value: normalizeFieldValue(field.field_type, rawValue.length ? rawValue : multiValues),
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
        answer_value: value,
      }));

    if (answersToInsert.length > 0) {
      console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=POST query=submission_answers_insert table=submission_answers");
      const { error: answersError } = await supabase.from("submission_answers").insert(answersToInsert);
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

    console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=POST query=forms_increment_response_count table=forms formId qrShareToken");
    const responseCountUpdate = await supabase
      .from("forms")
      .update({ response_count: form.response_count + 1 })
      .eq("id", form.id)
      .eq("qr_share_token", token);
    console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=POST query=forms_increment_response_count table=forms success");

    if (responseCountUpdate.error) {
      console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=POST query=submission_cleanup table=submission_answers table=submissions");
      await supabase.from("submission_answers").delete().eq("submission_id", submissionId);
      await supabase.from("submissions").delete().eq("id", submissionId);
      console.log("[SUBMIT] file=app/api/forms/submit/route.ts function=POST query=submission_cleanup table=submission_answers table=submissions success");
      return NextResponse.json(
        { message: getFriendlyMessage(responseCountUpdate.error, "We couldn't update the form response count.") },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Response submitted successfully." }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: getFriendlyMessage(error, "We couldn't submit this response.") },
      { status: 500 }
    );
  }
}
