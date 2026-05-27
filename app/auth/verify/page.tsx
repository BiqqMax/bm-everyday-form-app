import { redirect } from "next/navigation";

import AuthVerifyClient from "../../../components/auth/AuthVerifyClient";
import { getPostAuthDestination } from "../../../lib/auth/post-auth";
import { createClient } from "../../../lib/supabase/server";

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

  return <AuthVerifyClient searchParams={resolvedSearchParams} />;
}
