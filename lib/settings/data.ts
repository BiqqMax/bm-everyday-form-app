import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type SettingsData = {
  account: {
    displayName: string;
    email: string;
    accountType: "individual" | "organization";
  };
  defaults: {
    defaultExpiryMinutes: number | null;
    defaultResponseLimit: number | null;
    defaultPublishState: boolean;
  };
  sharing: {
    enableQrGeneration: boolean;
    autoGenerateShareLinks: boolean;
    useDisplayNameInShareUrl: boolean;
  };
  notifications: {
    enableEmailAlerts: boolean;
  };
  security: {
    allowAnonymousSubmissions: boolean;
    restrictMultipleSubmissions: boolean;
    requireEmailValidation: boolean;
  };
  danger: {
    ownedFormsCount: number;
    publishedFormsCount: number;
  };
};

type SettingsProfileRow = {
  display_name: string | null;
  email: string;
  account_type: string;
  default_expiry_minutes: number | null;
  default_response_limit: number | null;
  default_publish_state: boolean | null;
  enable_qr_generation: boolean | null;
  auto_generate_share_links: boolean | null;
  use_display_name_in_share_url: boolean | null;
  enable_email_alerts: boolean | null;
  allow_anonymous_submissions: boolean | null;
  restrict_multiple_submissions: boolean | null;
  require_email_validation: boolean | null;
};

type SettingsFormRow = {
  id: string;
  is_public: boolean;
};

export async function getSettingsData(supabase: SupabaseClient, userId: string): Promise<SettingsData> {
  const [profileResult, formsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name,email,account_type,default_expiry_minutes,default_response_limit,default_publish_state,enable_qr_generation,auto_generate_share_links,use_display_name_in_share_url,enable_email_alerts,allow_anonymous_submissions,restrict_multiple_submissions,require_email_validation"
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("forms").select("id,is_public").eq("owner_id", userId),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (formsResult.error) throw formsResult.error;

  const profile = profileResult.data as SettingsProfileRow | null;
  const forms = (formsResult.data ?? []) as SettingsFormRow[];

  return {
    account: {
      displayName: profile?.display_name ?? "",
      email: profile?.email ?? "",
      accountType: profile?.account_type === "organization" ? "organization" : "individual",
    },
    defaults: {
      defaultExpiryMinutes: profile?.default_expiry_minutes ?? null,
      defaultResponseLimit: profile?.default_response_limit ?? null,
      defaultPublishState: profile?.default_publish_state ?? false,
    },
    sharing: {
      enableQrGeneration: profile?.enable_qr_generation ?? true,
      autoGenerateShareLinks: profile?.auto_generate_share_links ?? true,
      useDisplayNameInShareUrl: profile?.use_display_name_in_share_url ?? false,
    },
    notifications: {
      enableEmailAlerts: profile?.enable_email_alerts ?? true,
    },
    security: {
      allowAnonymousSubmissions: profile?.allow_anonymous_submissions ?? true,
      restrictMultipleSubmissions: profile?.restrict_multiple_submissions ?? false,
      requireEmailValidation: profile?.require_email_validation ?? false,
    },
    danger: {
      ownedFormsCount: forms.length,
      publishedFormsCount: forms.filter((form) => form.is_public).length,
    },
  };
}
