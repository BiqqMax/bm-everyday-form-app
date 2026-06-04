import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthVerifyClient from "../../../components/auth/AuthVerifyClient";
import { AuthEntryGuard } from "../../../components/auth/AuthRouteGuard";
import { getPostAuthDestination } from "../../../lib/auth/post-auth";
import { createPageMetadata } from "../../../lib/seo";
import { createClient } from "../../../lib/supabase/server";

// Prevent browser cache restoration of transitional auth page
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = createPageMetadata({
  title: "Verify account",
  description: "Verify your Everyday Forms account.",
  path: "/auth/verify",
  noindex: true,
});

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AuthVerifyPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const destination = await getPostAuthDestination(supabase, "/dashboard");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(destination);
  }

  return (
    <AuthEntryGuard>
      <AuthVerifyClient searchParams={resolvedSearchParams} />
    </AuthEntryGuard>
  );
}
