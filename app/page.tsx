import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LandingPage } from "../components/landing/LandingPage";
import { AuthEntryGuard } from "../components/auth/AuthRouteGuard";
import { DASHBOARD_ROUTE } from "../lib/auth/flow";
import { getPostAuthDestination } from "../lib/auth/post-auth";
import { createPageMetadata } from "../lib/seo";
import { getServerSupabaseClient } from "../lib/supabase/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = createPageMetadata({
  title: "Calm form software for everyday teams",
  description: "Build, share, and manage everyday forms with clear workflows, dependable publishing, and secure response handling.",
  path: "/",
});

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
