import { redirect } from "next/navigation";

import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import { createClient } from "../../lib/supabase/server";
import { getPostAuthDestination } from "../../lib/auth/post-auth";
import { DASHBOARD_ROUTE } from "../../lib/auth/flow";

// Prevent browser cache restoration of password reset entry page
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function ForgotPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const destination = await getPostAuthDestination(supabase, DASHBOARD_ROUTE);
    redirect(destination);
  }

  return <ForgotPasswordForm />;
}
