import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Dashboard from "../../components/dashboard/Dashboard";
import { DASHBOARD_ROUTE } from "../../lib/auth/flow";
import { getPostAuthDestination } from "../../lib/auth/post-auth";
import { getDashboardData } from "../../lib/dashboard/dashboard";
import { getServerSupabaseClient } from "../../lib/supabase/server";
import { ProtectedRouteGuard } from "../../components/auth/AuthRouteGuard";

// Force fresh server validation on every dashboard entry.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Dashboard | Everyday Forms",
  description: "Manage forms and review responses securely in a shared workspace.",
};

export default async function DashboardPage() {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const destination = await getPostAuthDestination(supabase, DASHBOARD_ROUTE);
  if (destination !== DASHBOARD_ROUTE) {
    redirect(destination);
  }

  const data = await getDashboardData(supabase, user.id);

  return (
    <ProtectedRouteGuard expectedPath="/dashboard">
      <Dashboard data={data} userEmail={user.email} />
    </ProtectedRouteGuard>
  );
}
