import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { buildPublicFormPath, getShareStatus, type ShareableFormSummary } from "./public";

export type PublicFormField = {
  id: string;
  label: string;
  type: "text" | "textarea" | "email" | "select" | "checkbox";
  required: boolean;
  options: string[];
  position: number;
};

export type PublicFormDetails = ShareableFormSummary & {
  ownerDisplayName: string | null;
  fields: PublicFormField[];
  publicPath: string;
  shareStatus: ReturnType<typeof getShareStatus>;
};

type PublicFormRow = {
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
};

type PublicProfileRow = {
  display_name: string | null;
};

type PublicFieldRow = {
  id: string;
  label: string;
  field_type: "text" | "textarea" | "email" | "select" | "checkbox";
  is_required: boolean;
  options: unknown;
  position: number;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
}

export function getCanonicalPublicFormPath(ownerDisplayName: string | null, publicToken: string, fallbackTitle = "form") {
  const segment = ownerDisplayName?.trim() || fallbackTitle;
  return buildPublicFormPath(segment, publicToken);
}

export async function getPublicFormDetails(supabase: SupabaseClient, publicToken: string): Promise<PublicFormDetails | null> {
  const formResult = await supabase
    .from("forms")
    .select("id,owner_id,title,description,is_public,public_slug,qr_share_token,expires_at,response_limit,response_count")
    .eq("qr_share_token", publicToken)
    .maybeSingle();

  if (formResult.error) {
    throw formResult.error;
  }

  const form = formResult.data as PublicFormRow | null;

  if (!form) {
    return null;
  }

  const [profileResult, fieldsResult] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", form.owner_id).maybeSingle(),
    supabase.from("form_fields").select("id,label,field_type,is_required,options,position").eq("form_id", form.id).order("position", { ascending: true }),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (fieldsResult.error) {
    throw fieldsResult.error;
  }

  const profile = profileResult.data as PublicProfileRow | null;
  const fields = (fieldsResult.data ?? []) as PublicFieldRow[];
  const ownerDisplayName = profile?.display_name ?? null;

  const summary: ShareableFormSummary = {
    id: form.id,
    title: form.title,
    description: form.description,
    isPublic: form.is_public,
    publicSlug: form.public_slug,
    publicToken: form.qr_share_token,
    expiresAt: form.expires_at,
    responseLimit: form.response_limit,
    responseCount: form.response_count,
    ownerDisplayName,
  };

  return {
    ...summary,
    ownerDisplayName,
    fields: fields.map((field) => ({
      id: field.id,
      label: field.label,
      type: field.field_type,
      required: field.is_required,
      options: asStringArray(field.options),
      position: field.position,
    })),
    publicPath: getCanonicalPublicFormPath(ownerDisplayName, form.qr_share_token, form.public_slug),
    shareStatus: getShareStatus(summary),
  };
}
