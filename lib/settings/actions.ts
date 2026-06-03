"use server";

import { revalidatePath } from "next/cache";

import { getFriendlyActionMessage } from "../utils/friendly-error";
import { getServerSupabaseClient } from "../supabase/server";

export type SettingsActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "true" || value === "on" || value === "1";
}

function getOptionalInteger(formData: FormData, key: string) {
  const rawValue = getFormValue(formData, key);

  if (!rawValue) {
    return null;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw new Error(`Please enter a whole number for ${key}.`);
  }

  return parsedValue;
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

export async function updateSettingsAction(formData: FormData): Promise<SettingsActionState> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const updates = {
      default_expiry_minutes: getOptionalInteger(formData, "defaultExpiryMinutes"),
      default_response_limit: getOptionalInteger(formData, "defaultResponseLimit"),
      default_publish_state: getBoolean(formData, "defaultPublishState"),
      enable_qr_generation: getBoolean(formData, "enableQrGeneration"),
      auto_generate_share_links: getBoolean(formData, "autoGenerateShareLinks"),
      use_display_name_in_share_url: getBoolean(formData, "useDisplayNameInShareUrl"),
      enable_email_alerts: getBoolean(formData, "enableEmailAlerts"),
      allow_anonymous_submissions: getBoolean(formData, "allowAnonymousSubmissions"),
      restrict_multiple_submissions: getBoolean(formData, "restrictMultipleSubmissions"),
      require_email_validation: getBoolean(formData, "requireEmailValidation"),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);

    if (error) {
      return {
        status: "error",
        message: getFriendlyActionMessage(error),
      };
    }

    revalidatePath("/dashboard");

    return {
      status: "success",
      message: "Settings saved.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getFriendlyActionMessage(error),
    };
  }
}
