import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { buildPublicFormPath, getShareStatus, type ShareableFormSummary } from "./public";
import { getFormByPublicToken } from "./public-resolver";

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

export function getCanonicalPublicFormPath(qrShareToken: string) {
  return buildPublicFormPath(qrShareToken);
}

export async function getPublicFormDetails(supabase: SupabaseClient, publicToken: string): Promise<PublicFormDetails | null> {
  const form = await getFormByPublicToken(supabase, publicToken);

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
    qrShareToken: publicToken,
    expiresAt: form.expires_at,
    responseLimit: form.response_limit,
    responseCount: form.response_count,
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
    publicPath: buildPublicFormPath(publicToken),
    shareStatus: getShareStatus(summary),
  };
}
