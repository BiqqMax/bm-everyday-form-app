import type { Metadata } from "next";
import { redirect } from "next/navigation";

import BrandMark from "../../components/layout/BrandMark";
import OnboardingForm from "../../components/onboarding/OnboardingForm";
import { DASHBOARD_ROUTE, LOGIN_ROUTE } from "../../lib/auth/flow";
import { getServerSupabaseClient } from "../../lib/supabase/server";

export const metadata: Metadata = {
  title: "Onboarding | Everyday Forms",
  description: "Finish setting up your Everyday Forms workspace.",
};

export default async function OnboardingPage() {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(LOGIN_ROUTE);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, account_type, display_name, organization_name, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed) {
    redirect(DASHBOARD_ROUTE);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <BrandMark href="" />
        </header>

        <div className="flex flex-1 items-center justify-center py-10">
          <OnboardingForm
            userId={user.id}
            initialAccountType={profile?.account_type ?? null}
            initialDisplayName={profile?.display_name ?? null}
            initialOrganizationName={profile?.organization_name ?? null}
          />
        </div>
      </div>
    </main>
  );
}
