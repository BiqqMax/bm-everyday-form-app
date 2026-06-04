import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getFormByPublicToken, type PublicFormRow } from "./public-resolver";

export type PublicFormFieldData = {
  id: string;
  label: string;
  type: "text" | "textarea" | "email" | "select" | "checkbox" | "radio" | "date";
  required: boolean;
  options: string[];
  position: number;
};

export type PublicFormViewData = {
  id: string;
  title: string;
  description: string | null;
  displayName: string;
  avatarUrl: string | null;
  qrShareToken: string;
  fields: PublicFormFieldData[];
  isPublished: boolean;
  expiresAt: string | null;
  responseLimit: number | null;
  responseCount: number | null;
};

type ProfileRow = {
  display_name: string | null;
  avatar_url: string | null;
};

function toPublicFormView(
  form: PublicFormRow,
  profile: ProfileRow | null,
  fields: PublicFormFieldData[],
): PublicFormViewData {
  return {
    id: form.id,
    title: form.title,
    description: form.description,
    displayName: profile?.display_name ?? "",
    avatarUrl: profile?.avatar_url ?? null,
    qrShareToken: form.qr_share_token,
    fields,
    isPublished: form.is_public,
    expiresAt: form.expires_at,
    responseLimit: form.response_limit,
    responseCount: form.response_count,
  };
}

export function statusMessage(form: PublicFormViewData | null): {
  title: string;
  description: string;
} | null {
  if (!form) {
    return {
      title: "Form not found",
      description: "This form link is invalid or no longer available.",
    };
  }

  if (!form.isPublished) {
    return {
      title: "Not published",
      description: "The owner has not made this form public yet.",
    };
  }

  if (form.expiresAt && new Date(form.expiresAt).getTime() < Date.now()) {
    return {
      title: "Form closed",
      description: "The response window for this form has expired.",
    };
  }

  if (
    typeof form.responseLimit === "number" &&
    typeof form.responseCount === "number" &&
    form.responseCount >= form.responseLimit
  ) {
    return {
      title: "Form full",
      description: "The response limit for this form has been reached.",
    };
  }

  return null;
}

export async function loadPublicForm(
  supabase: SupabaseClient,
  token: string,
): Promise<PublicFormViewData | null> {
  try {
    const form = await getFormByPublicToken(supabase, token);

    if (!form) {
      return null;
    }

    const [profileResult, fieldsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name,avatar_url")
        .eq("id", form.owner_id)
        .maybeSingle(),
      supabase
        .from("form_fields")
        .select("id,label,field_type,is_required,options,position")
        .eq("form_id", form.id)
        .order("position", { ascending: true }),
    ]);

    if (profileResult.error) {
      throw profileResult.error;
    }

    if (fieldsResult.error) {
      throw fieldsResult.error;
    }

    const profile = profileResult.data as ProfileRow | null;
    const fields: PublicFormFieldData[] = (fieldsResult.data ?? []).map((field) => ({
      id: field.id,
      label: field.label,
      type: field.field_type,
      required: field.is_required,
      options: Array.isArray(field.options)
        ? field.options.filter((option): option is string => typeof option === "string")
        : [],
      position: field.position,
    }));

    return toPublicFormView(form, profile, fields);
  } catch {
    return null;
  }
}
