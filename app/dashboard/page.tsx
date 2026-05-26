import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Dashboard from "../../components/dashboard/Dashboard";
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

  const data = await getDashboardData(supabase, user.id);

  return <Dashboard data={data} userEmail={user.email} />;
}
