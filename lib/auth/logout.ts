"use server";

import { cookies } from "next/headers";

import { getServerSupabaseClient } from "../supabase/server";

const SUPABASE_COOKIE_PREFIXES = ["sb-", "supabase"];

function isSupabaseCookie(name: string) {
  return SUPABASE_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix) || name.includes(prefix));
}

export async function signOutServerSide() {
  const supabase = await getServerSupabaseClient();

  try {
    await supabase.auth.signOut({ scope: "global" });
  } finally {
    const cookieStore = await cookies();

    cookieStore.getAll().forEach(({ name }) => {
      if (isSupabaseCookie(name)) {
        cookieStore.delete(name);
      }
    });
  }
}
