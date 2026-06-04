import type { Metadata } from "next";
import { redirect } from "next/navigation";

import SignupForm from "../../components/auth/SignupForm";
import { AuthEntryGuard } from "../../components/auth/AuthRouteGuard";
import { DASHBOARD_ROUTE } from "../../lib/auth/flow";
import { getPostAuthDestination } from "../../lib/auth/post-auth";
import { createPageMetadata } from "../../lib/seo";
import { createClient } from "../../lib/supabase/server";

// Prevent browser cache restoration of auth entry page
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = createPageMetadata({
  title: "Sign up",
  description: "Create an Everyday Forms account and start building structured workflows.",
  path: "/signup",
  noindex: true,
});

export default async function SignupPage() {
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
      <SignupForm />
    </AuthEntryGuard>
  );
}
