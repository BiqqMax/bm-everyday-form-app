import { redirect } from "next/navigation";

import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import { createClient } from "../../lib/supabase/server";
import { getPostAuthDestination } from "../../lib/auth/post-auth";
import { DASHBOARD_ROUTE } from "../../lib/auth/flow";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const destination = await getPostAuthDestination(supabase, DASHBOARD_ROUTE);
    redirect(destination);
  }

  return <ResetPasswordForm />;
}
