import { redirect } from "next/navigation";

import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import { AuthEntryGuard } from "../../components/auth/AuthRouteGuard";
import { createClient } from "../../lib/supabase/server";
import { getPostAuthDestination } from "../../lib/auth/post-auth";
import { DASHBOARD_ROUTE } from "../../lib/auth/flow";

// Prevent browser cache restoration of password reset confirmation page
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const destination = await getPostAuthDestination(supabase, DASHBOARD_ROUTE);
    redirect(destination);
  }

  return (
    <AuthEntryGuard>
      <ResetPasswordForm />
    </AuthEntryGuard>
  );
}
