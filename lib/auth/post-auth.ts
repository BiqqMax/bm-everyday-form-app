import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getPostAuthDestination(
  supabase: SupabaseClient,
  fallbackPath: string,
): Promise<string> {
  console.log("[AUTH] file=lib/auth/post-auth.ts function=getPostAuthDestination query=getUser auth.getUser");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("[AUTH] file=lib/auth/post-auth.ts function=getPostAuthDestination query=getUser auth.getUser success");

  if (!user) {
    return fallbackPath;
  }

  console.log("[AUTH] file=lib/auth/post-auth.ts function=getPostAuthDestination query=profile_lookup table=profiles userId");
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();
  console.log("[AUTH] file=lib/auth/post-auth.ts function=getPostAuthDestination query=profile_lookup table=profiles success");

  if (profileError) {
    return fallbackPath;
  }

  if (!profile) {
    return "/onboarding";
  }

  return profile.onboarding_completed ? fallbackPath : "/onboarding";
}
