import { createClient } from "../supabase/server";
import { getFormByPublicToken } from "../forms/public-resolver";
import type { PublicFormView } from "../../app/f/[token]/public-form-client";

export type { PublicFormView } from "../../app/f/[token]/public-form-client";

type PublicFormRow = NonNullable<Awaited<ReturnType<typeof getFormByPublicToken>>>;
type PublicFormField = PublicFormView["fields"][number];
type UserRow = {
  display_name: string | null;
  avatar_url?: string | null;
};

export function toPublicFormView(
  form: PublicFormRow,
  owner: UserRow | null,
  fields: PublicFormField[],
): PublicFormView {
  return {
    id: form.id,
    title: form.title,
    description: form.description,
    displayName: owner?.display_name ?? "",
    avatarUrl: owner?.avatar_url ?? null,
    qrShareToken: form.qr_share_token,
    fields,
    isPublished: form.is_public,
    expiresAt: form.expires_at,
    responseLimit: form.response_limit,
    responseCount: form.response_count,
  };
}

export function statusMessage(form: PublicFormView | null): {
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
      title: "This form is not published yet",
      description: "The owner has not made this form public.",
    };
  }

  if (form.expiresAt && new Date(form.expiresAt).getTime() < Date.now()) {
    return {
      title: "This form has closed",
      description: "The response window for this form has expired.",
    };
  }

  if (
    typeof form.responseLimit === "number" &&
    typeof form.responseCount === "number" &&
    form.responseCount >= form.responseLimit
  ) {
    return {
      title: "This form is full",
      description: "The response limit for this form has already been reached.",
    };
  }

  return null;
}

export async function loadPublicForm(token: string): Promise<PublicFormView | null> {
  const supabase = await createClient();

  try {
    const form = await getFormByPublicToken(supabase, token);

    if (!form) {
      return null;
    }

    const [ownerResult, fieldsResult] = await Promise.all([
      supabase.from("profiles").select("display_name,avatar_url").eq("id", form.owner_id).maybeSingle(),
      supabase
        .from("form_fields")
        .select("id,label,field_type,is_required,options,position")
        .eq("form_id", form.id)
        .order("position", { ascending: true }),
    ]);

    if (ownerResult.error) {
      throw ownerResult.error;
    }

    if (fieldsResult.error) {
      throw fieldsResult.error;
    }

    const owner = ownerResult.data as UserRow | null;
    const fields = (fieldsResult.data ?? []).map((field) => ({
      id: field.id,
      label: field.label,
      type: field.field_type,
      required: field.is_required,
      options: Array.isArray(field.options) ? field.options.filter((option): option is string => typeof option === "string") : [],
      position: field.position,
    }));

    return toPublicFormView(form, owner, fields);
  } catch {
    return null;
  }
}
