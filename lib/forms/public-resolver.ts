import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type PublicFormRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  qr_share_token: string;
  expires_at: string | null;
  response_limit: number | null;
  response_count: number;
};

export async function getFormByPublicToken(
  supabase: SupabaseClient,
  qrShareToken: string,
): Promise<PublicFormRow | null> {
  const { data, error } = await supabase
    .from("forms")
    .select("id,owner_id,title,description,is_public,qr_share_token,expires_at,response_limit,response_count")
    .eq("qr_share_token", qrShareToken)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PublicFormRow | null;
}
