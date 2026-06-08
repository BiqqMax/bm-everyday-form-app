"use server";

console.log("[ACTIONS_FILE_LOADED] createFormAction module imported");

import { revalidatePath } from "next/cache";
import { getFriendlyActionMessage } from "../utils/friendly-error";
import { getServerSupabaseClient } from "../supabase/server";
import { generateUniqueShortToken } from "../forms/token";
import { getDashboardData, type DashboardData } from "./dashboard";

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
      qr_share_token: string;
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
          ? field.options
              .filter((option): option is string => typeof option === "string" && option.trim().length > 0)
              .map((option) => option.trim())
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
  const [existingFieldsResult] = await Promise.all([supabase.from("form_fields").select("id").eq("form_id", formId)]);

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
  console.log("[CREATE_FORM_ACTION][ENTERED]");

  try {
    const title = getOptionalString(formData, "title") || "Untitled form";
    const description = getOptionalString(formData, "description");
    const isPublic = getBoolean(formData, "isPublic");
    const fields = parseFields(formData);
    const { supabase, user } = await getAuthenticatedUser();

    console.log("[CREATE_FORM][START]", {
      title,
      description,
      isPublic,
      userId: user?.id,
      environment: {
        runtime: typeof window === "undefined" ? "server" : "client",
        platform:
          typeof navigator !== "undefined"
            ? navigator.userAgent.includes("Mobile")
              ? "mobile"
              : "desktop"
            : "unknown",
      },
    });

    console.log("[CREATE_FORM][INPUT_RECEIVED]", {
      title,
      description,
      isPublic,
    });

    const qrShareToken = await generateUniqueShortToken(supabase, 6);
    console.log("[FORM CREATE][TOKEN]", qrShareToken);

    let createdForm: { id: string };

    try {
      console.log("[CREATE_FORM][DB][INSERT_ATTEMPT]", {
        owner_id: user.id,
        title,
        description: description || null,
        is_public: isPublic,
        qr_share_token: qrShareToken,
      });

      const result = await supabase
        .from("forms")
        .insert({
          owner_id: user.id,
          title,
          description: description || null,
          is_public: isPublic,
          qr_share_token: qrShareToken,
        })
        .select("id")
        .single();

      console.log("[CREATE_FORM][DB][SUCCESS]", result);

      if (result.error) {
        throw result.error;
      }

      createdForm = result.data as { id: string };
      console.log("[FORM CREATE][SUCCESS]", {
        formId: createdForm.id,
        qrShareToken,
      });
    } catch (error) {
      const dbError = error as {
        message?: string;
        details?: string;
        hint?: string;
      };

      console.error("[CREATE_FORM][DB][FAILED]", {
        error,
        message: dbError?.message,
        details: dbError?.details,
        hint: dbError?.hint,
      });

      throw error;
    }

    if (fields.length > 0) {
        const fieldRows = fields.map((field, index) => ({
          form_id: createdForm.id,
          label: field.label || "Untitled field",
          field_type: field.type,
          is_required: field.required,
          options: field.type === "select" ? field.options ?? [] : [],
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
    console.log("[CREATE_FORM][COMPLETE] SUCCESS");
    return {
      status: "success",
      message: "Form created.",
      formId: createdForm.id,
      qr_share_token: qrShareToken,
    };
  } catch (error) {
    console.error("[CREATE_FORM][CRASH]", {
      error,
      message: (error as { message?: string })?.message,
    });

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

    const { error } = await supabase.from("forms").update(updates).eq("id", formId).eq("owner_id", user.id);

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

/**
 * Server action that re-fetches the current user's dashboard data.
 * Used by the client-side fallback refresh hook to silently reconcile
 * dashboard state when realtime may have disconnected.
 */
export async function refreshDashboardAction(): Promise<DashboardData | null> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    return await getDashboardData(supabase, user.id);
  } catch (error) {
    console.error("[refreshDashboardAction] Failed", error);
    return null;
  }
}
