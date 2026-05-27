"use server";

import { revalidatePath } from "next/cache";
import { getFriendlyActionMessage } from "../utils/friendly-error";
import { getServerSupabaseClient } from "../supabase/server";

export type DashboardActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "true" || value === "on" || value === "1";
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

export async function createFormAction(_: DashboardActionState, formData: FormData): Promise<DashboardActionState> {
  try {
    const title = getString(formData, "title");
    const description = getString(formData, "description");
    const isPublic = getBoolean(formData, "isPublic");
    const { supabase, user } = await getAuthenticatedUser();

    if (!title) {
      return { status: "error", message: "Please add a form title." };
    }

    const { error } = await supabase.from("forms").insert({
      owner_id: user.id,
      title,
      description: description || null,
      is_public: isPublic,
      public_slug: buildPublicSlug(title),
    });

    if (error) {
      return { status: "error", message: getFriendlyActionMessage(error) };
    }

    revalidatePath("/dashboard");
    return { status: "success", message: "Form created." };
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

    revalidatePath("/dashboard");
    return { status: "success", message: "Form updated." };
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
