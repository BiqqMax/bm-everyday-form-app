import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Dashboard from "../../components/dashboard/Dashboard";
import HistoryStabilizer from "../../components/layout/HistoryStabilizer";
import { DASHBOARD_ROUTE } from "../../lib/auth/flow";
import { getPostAuthDestination } from "../../lib/auth/post-auth";
import { getDashboardData } from "../../lib/dashboard/dashboard";
import { getServerSupabaseClient } from "../../lib/supabase/server";

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
    <>
      <HistoryStabilizer />
      <Dashboard data={data} userEmail={user.email} />
    </>
  );
}
