"use server";

import { revalidatePath } from "next/cache";
import { getFriendlyActionMessage } from "../utils/friendly-error";
import { getServerSupabaseClient } from "../supabase/server";

export type DashboardActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type CreateFormActionState =
  | {
      status: "idle" | "error";
      message: string;
    }
  | {
      status: "success";
      message: string;
      formId: string;
      publicToken: string;
    };

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "true" || value === "on" || value === "1";
}

function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.length > 0 ? slug : "form";
}

function buildPublicSlug(title: string) {
  return `${slugify(title)}-${crypto.randomUUID().slice(0, 8)}`;
}

async function getAuthenticatedUser() {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Please sign in again to continue.");
  }

  return { supabase, user };
}

type CreateFormFieldPayload = {
  id: string;
  type: "text" | "textarea" | "email" | "number" | "checkbox" | "select";
  label: string;
  required: boolean;
  options?: string[];
};

function parseFields(formData: FormData) {
  const rawFields = getString(formData, "fields");

  if (!rawFields) {
    return [] as CreateFormFieldPayload[];
  }

  try {
    const value = JSON.parse(rawFields);

    if (!Array.isArray(value)) {
      return [] as CreateFormFieldPayload[];
    }

    return value
      .filter((field): field is CreateFormFieldPayload => {
        return (
          Boolean(field) &&
          typeof field === "object" &&
          typeof field.id === "string" &&
          typeof field.type === "string" &&
          typeof field.label === "string" &&
          typeof field.required === "boolean" &&
          ["text", "textarea", "email", "number", "checkbox", "select"].includes(field.type)
        );
      })
      .map((field) => ({
        id: field.id,
        type: field.type,
        label: field.label.trim(),
        required: field.required,
        options: Array.isArray(field.options)
          ? field.options.filter((option): option is string => typeof option === "string" && option.trim().length > 0).map((option) => option.trim())
          : undefined,
      }));
  } catch {
    return [] as CreateFormFieldPayload[];
  }
}

async function syncFormFields(
  supabase: Awaited<ReturnType<typeof getServerSupabaseClient>>,
  formId: string,
  fields: CreateFormFieldPayload[],
) {
  const [existingFieldsResult] = await Promise.all([
    supabase.from("form_fields").select("id").eq("form_id", formId),
  ]);

  if (existingFieldsResult.error) {
    return existingFieldsResult.error;
  }

  const existingIds = new Set<string>((existingFieldsResult.data ?? []).map((field) => field.id));
  const incomingIds = new Set(fields.map((field) => field.id));

  if (fields.length > 0) {
    const fieldRows = fields.map((field, index) => ({
      id: field.id,
      form_id: formId,
      label: field.label || "Untitled field",
      field_type: field.type,
      is_required: field.required,
      options: field.type === "select" ? field.options ?? [] : [],
      position: index,
    }));

    const { error: upsertError } = await supabase.from("form_fields").upsert(fieldRows, { onConflict: "id" });

    if (upsertError) {
      return upsertError;
    }
  }

  const removedIds = [...existingIds].filter((id) => !incomingIds.has(id));

  if (removedIds.length > 0) {
    const { error: deleteError } = await supabase.from("form_fields").delete().eq("form_id", formId).in("id", removedIds);

    if (deleteError) {
      return deleteError;
    }
  }

  return null;
}

export async function createFormAction(_: CreateFormActionState, formData: FormData): Promise<CreateFormActionState> {
  try {
    const title = getString(formData, "title");
    const description = getString(formData, "description");
    const isPublic = getBoolean(formData, "isPublic");
    const fields = parseFields(formData);
    const { supabase, user } = await getAuthenticatedUser();

    if (!title) {
      return { status: "error", message: "Please add a form title." };
    }

    const { data: createdForm, error } = await supabase
      .from("forms")
      .insert({
        owner_id: user.id,
        title,
        description: description || null,
        is_public: isPublic,
        public_slug: buildPublicSlug(title),
      })
      .select("id,qr_share_token")
      .single();

    if (error) {
      return { status: "error", message: getFriendlyActionMessage(error) };
    }

    if (fields.length > 0) {
      const fieldRows = fields.map((field, index) => ({
        form_id: createdForm.id,
        label: field.label || "Untitled field",
        field_type: field.type,
        is_required: field.required,
        options: field.type === "select" ? field.options ?? [] : null,
        position: index + 1,
      }));

      try {
        const { error: fieldsError } = await supabase.from("form_fields").insert(fieldRows);

        if (fieldsError) {
          console.error("Failed to insert form fields for created form", fieldsError);
        }
      } catch (fieldsError) {
        console.error("Failed to insert form fields for created form", fieldsError);
      }
    }

    revalidatePath("/dashboard");
    return {
      status: "success",
      message: "Form created.",
      formId: createdForm.id,
      publicToken: createdForm.qr_share_token,
    };
  } catch (error) {
    return {
      status: "error",
      message: getFriendlyActionMessage(error),
    };
  }
}

export async function updateFormAction(_: DashboardActionState, formData: FormData): Promise<DashboardActionState> {
  try {
    const formId = getString(formData, "formId");
    const title = getString(formData, "title");
    const description = getString(formData, "description");
    const isPublic = getBoolean(formData, "isPublic");
    const { supabase, user } = await getAuthenticatedUser();

    if (!formId) {
      return { status: "error", message: "Please choose a form." };
    }

    if (!title) {
      return { status: "error", message: "A form title is required." };
    }

    const { data: ownedForm, error: lookupError } = await supabase
      .from("forms")
      .select("id")
      .eq("id", formId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (lookupError) {
      return { status: "error", message: getFriendlyActionMessage(lookupError) };
    }

    if (!ownedForm) {
      return { status: "error", message: "We couldn’t find that form." };
    }

    const { error } = await supabase
      .from("forms")
      .update({
        title,
        description: description || null,
        is_public: isPublic,
      })
      .eq("id", formId)
      .eq("owner_id", user.id);

    if (error) {
      return { status: "error", message: getFriendlyActionMessage(error) };
    }

    if (formData.has("fields")) {
      const fieldsError = await syncFormFields(supabase, formId, parseFields(formData));

      if (fieldsError) {
        return { status: "error", message: getFriendlyActionMessage(fieldsError) };
      }
    }

    revalidatePath("/dashboard");
    revalidatePath(`/forms/${formId}/edit`);
    return { status: "success", message: "Form updated." };
  } catch (error) {
    return {
      status: "error",
      message: getFriendlyActionMessage(error),
    };
  }
}

export async function updateFormLifecycleAction(_: DashboardActionState, formData: FormData): Promise<DashboardActionState> {
  try {
    const formId = getString(formData, "formId");
    const visibility = getOptionalString(formData, "visibility");
    const actionKind = getOptionalString(formData, "actionKind");
    const { supabase, user } = await getAuthenticatedUser();

    if (!formId) {
      return { status: "error", message: "Please choose a form." };
    }

    const { data: ownedForm, error: lookupError } = await supabase
      .from("forms")
      .select("id")
      .eq("id", formId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (lookupError) {
      return { status: "error", message: getFriendlyActionMessage(lookupError) };
    }

    if (!ownedForm) {
      return { status: "error", message: "We couldn’t find that form." };
    }

    const updates: Record<string, string | boolean | null> = {};

    if (visibility === "public" || visibility === "private") {
      updates.is_public = visibility === "public";
    }

    if (actionKind === "pause") {
      updates.expires_at = new Date().toISOString();
    } else if (actionKind === "resume") {
      updates.expires_at = null;
    } else if (actionKind === "archive") {
      updates.is_public = false;
      updates.expires_at = new Date().toISOString();
    }

    if (Object.keys(updates).length === 0) {
      return { status: "error", message: "Choose a lifecycle change to save." };
    }

    const { error } = await supabase
      .from("forms")
      .update(updates)
      .eq("id", formId)
      .eq("owner_id", user.id);

    if (error) {
      return { status: "error", message: getFriendlyActionMessage(error) };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/forms/${formId}/edit`);
    return { status: "success", message: "Form settings saved." };
  } catch (error) {
    return {
      status: "error",
      message: getFriendlyActionMessage(error),
    };
  }
}

export async function deleteFormAction(_: DashboardActionState, formData: FormData): Promise<DashboardActionState> {
  try {
    const formId = getString(formData, "formId");
    const { supabase, user } = await getAuthenticatedUser();

    if (!formId) {
      return { status: "error", message: "Please choose a form." };
    }

    const { data: ownedForm, error: lookupError } = await supabase
      .from("forms")
      .select("id")
      .eq("id", formId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (lookupError) {
      return { status: "error", message: getFriendlyActionMessage(lookupError) };
    }

    if (!ownedForm) {
      return { status: "error", message: "We couldn’t find that form." };
    }

    const { error } = await supabase.from("forms").delete().eq("id", formId).eq("owner_id", user.id);

    if (error) {
      return { status: "error", message: getFriendlyActionMessage(error) };
    }

    revalidatePath("/dashboard");
    return { status: "success", message: "Form deleted." };
  } catch (error) {
    return {
      status: "error",
      message: getFriendlyActionMessage(error),
    };
  }
}
