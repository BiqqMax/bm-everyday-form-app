import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

type DashboardFormRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  public_slug: string;
  qr_share_token: string;
  expires_at: string | null;
  response_limit: number | null;
  response_count: number;
  created_at: string;
  updated_at: string;
};

type DashboardFieldRow = {
  id: string;
  form_id: string;
  label: string;
  field_type: string;
  is_required: boolean;
  position: number;
};

type DashboardSubmissionRow = {
  id: string;
  form_id: string;
  created_at: string;
  submitted_by_user_id: string | null;
};

type DashboardAnswerRow = {
  id: string;
  submission_id: string;
  form_field_id: string;
  answer_value: unknown;
  created_at: string;
};

export type DashboardForm = {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  publicSlug: string;
  qrShareToken: string;
  expiresAt: string | null;
  responseLimit: number | null;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
  fieldCount: number;
  submissionCount: number;
  lastSubmissionAt: string | null;
};

export type DashboardSubmission = {
  id: string;
  formId: string;
  formTitle: string;
  createdAt: string;
  submittedByUserId: string | null;
  answers: Array<{
    fieldId: string;
    fieldLabel: string;
    value: string;
  }>;
};

export type DashboardSummary = {
  totalForms: number;
  publishedForms: number;
  totalSubmissions: number;
  totalFields: number;
  recentSubmissions: number;
};

export type DashboardData = {
  forms: DashboardForm[];
  recentSubmissions: DashboardSubmission[];
  summary: DashboardSummary;
};

function safeString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((item) => safeString(item)).join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return "";
}

function formatAnswerValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => safeString(item)).filter(Boolean).join(", ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  return safeString(value);
}

function formatDateLong(value: string | null) {
  if (!value) {
    return "No submissions yet";
  }

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}

function groupBy<T>(rows: T[], keyGetter: (row: T) => string) {
  return rows.reduce<Record<string, T[]>>((acc, row) => {
    const key = keyGetter(row);
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});
}

function sortNewest<T>(rows: T[], getCreatedAt: (row: T) => string) {
  return [...rows].sort((left, right) => getCreatedAt(right).localeCompare(getCreatedAt(left)));
}

function logQueryFailure(queryName: string, error: unknown) {
  const supabaseError = error as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };

  console.error("QUERY FAILED", {
    file: "lib/dashboard/dashboard.ts",
    queryName,
    error,
    code: supabaseError.code,
    message: supabaseError.message,
    details: supabaseError.details,
    hint: supabaseError.hint,
  });
}

export async function getDashboardData(supabase: SupabaseClient, userId: string): Promise<DashboardData> {
  console.log("[DASHBOARD] file=lib/dashboard/dashboard.ts function=getDashboardData query=forms table=forms owner_id");
  const formsResult = await supabase
    .from("forms")
    .select("id,owner_id,title,description,is_public,public_slug,qr_share_token,created_at,updated_at,expires_at,response_limit,response_count")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  console.log("[DASHBOARD] file=lib/dashboard/dashboard.ts function=getDashboardData query=forms table=forms success");

  if (formsResult.error) {
    logQueryFailure("getDashboardData.forms", formsResult.error);
    throw formsResult.error;
  }

  const forms = (formsResult.data ?? []) as DashboardFormRow[];

  if (forms.length === 0) {
    return {
      forms: [],
      recentSubmissions: [],
      summary: {
        totalForms: 0,
        publishedForms: 0,
        totalSubmissions: 0,
        totalFields: 0,
        recentSubmissions: 0,
      },
    };
  }

  const formIds = forms.map((form) => form.id);

  console.log("[DASHBOARD] file=lib/dashboard/dashboard.ts function=getDashboardData query=form_fields table=form_fields formIds");
  console.log("[DASHBOARD] file=lib/dashboard/dashboard.ts function=getDashboardData query=submissions table=submissions formIds");
  const [fieldsResult, submissionsResult] = await Promise.all([
    supabase
      .from("form_fields")
      .select("id,form_id,label,field_type,is_required,position")
      .in("form_id", formIds)
      .order("position", { ascending: true }),

    supabase
      .from("submissions")
      .select("id,form_id,created_at,submitted_by_user_id")
      .in("form_id", formIds)
      .order("created_at", { ascending: false }),
  ]);
  console.log("[DASHBOARD] file=lib/dashboard/dashboard.ts function=getDashboardData query=form_fields table=form_fields success");
  console.log("[DASHBOARD] file=lib/dashboard/dashboard.ts function=getDashboardData query=submissions table=submissions success");

  if (fieldsResult.error) {
    logQueryFailure("getDashboardData.form_fields", fieldsResult.error);
    throw fieldsResult.error;
  }
  if (submissionsResult.error) {
    logQueryFailure("getDashboardData.submissions", submissionsResult.error);
    throw submissionsResult.error;
  }

  const fields = (fieldsResult.data ?? []) as DashboardFieldRow[];
  const submissions = (submissionsResult.data ?? []) as DashboardSubmissionRow[];
  const submissionIds = submissions.map((submission) => submission.id);

  const answersResult =
    submissionIds.length > 0
      ? await supabase
          .from("submission_answers")
          .select("id,submission_id,form_field_id,answer_value,created_at")
          .in("submission_id", submissionIds)
          .order("created_at", { ascending: false })
      : { data: [], error: null };

  if (answersResult.error) {
    logQueryFailure("getDashboardData.submission_answers", answersResult.error);
    throw answersResult.error;
  }

  const answers = (answersResult.data ?? []) as DashboardAnswerRow[];

  const fieldsByFormId = groupBy(fields, (field) => field.form_id);
  const fieldsById = new Map(fields.map((field) => [field.id, field]));
  const submissionsByFormId = groupBy(submissions, (submission) => submission.form_id);
  const answersBySubmissionId = groupBy(answers, (answer) => answer.submission_id);
  const formById = new Map(forms.map((form) => [form.id, form]));

  const submissionRecords: DashboardSubmission[] = submissions
    .filter((submission) => formById.has(submission.form_id))
    .map((submission) => {
      const form = formById.get(submission.form_id);

      return {
        id: submission.id,
        formId: submission.form_id,
        formTitle: form?.title ?? "Untitled form",
        createdAt: submission.created_at,
        submittedByUserId: submission.submitted_by_user_id,
        answers: (answersBySubmissionId[submission.id] ?? []).map((answer) => {
          const field = fieldsById.get(answer.form_field_id);

          return {
            fieldId: answer.form_field_id,
            fieldLabel: field?.label ?? "Field",
            value: formatAnswerValue(answer.answer_value),
          };
        }),
      };
    });

  const recentSubmissions = sortNewest(submissionRecords, (submission) => submission.createdAt).slice(0, 6);

  const dashboardForms = forms.map((form) => {
    const formFields = fieldsByFormId[form.id] ?? [];
    const formSubmissions = submissionsByFormId[form.id] ?? [];
    const lastSubmissionAt = formSubmissions[0]?.created_at ?? null;

      return {
      id: form.id,
      title: form.title,
      description: form.description,
      isPublic: form.is_public,
      publicSlug: form.public_slug,
      qrShareToken: form.qr_share_token,
      expiresAt: form.expires_at,
      responseLimit: form.response_limit,
      responseCount: form.response_count,
      createdAt: form.created_at,
      updatedAt: form.updated_at,
      fieldCount: formFields.length,
      submissionCount: formSubmissions.length,
      lastSubmissionAt,
    };
  });

  return {
    forms: dashboardForms,
    recentSubmissions,
    summary: {
      totalForms: dashboardForms.length,
      publishedForms: dashboardForms.filter((form) => form.isPublic).length,
      totalSubmissions: submissionRecords.length,
      totalFields: fields.length,
      recentSubmissions: recentSubmissions.length,
    },
  };
}
