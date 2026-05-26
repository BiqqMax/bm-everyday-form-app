import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getPostAuthDestination(
  supabase: SupabaseClient,
  fallbackPath: string,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fallbackPath;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return fallbackPath;
  }

  if (!profile) {
    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? "",
      account_type: "individual",
      onboarding_completed: false,
    });

    if (upsertError) {
      return "/onboarding";
    }

    return "/onboarding";
  }

  return profile.onboarding_completed ? fallbackPath : "/onboarding";
}
