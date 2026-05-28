import { redirect } from "next/navigation";

import { LandingPage } from "../components/landing/LandingPage";
import { AuthEntryGuard } from "../components/auth/AuthRouteGuard";
import { DASHBOARD_ROUTE } from "../lib/auth/flow";
import { getPostAuthDestination } from "../lib/auth/post-auth";
import { getServerSupabaseClient } from "../lib/supabase/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function Page() {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const destination = await getPostAuthDestination(supabase, DASHBOARD_ROUTE);
    redirect(destination);
  }

  return (
    <AuthEntryGuard>
      <LandingPage />
    </AuthEntryGuard>
  );
}
