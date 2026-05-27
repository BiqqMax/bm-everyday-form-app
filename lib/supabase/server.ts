import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          console.error("Supabase cookie set failed", { name, error });
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        } catch (error) {
          console.error("Supabase cookie removal failed", { name, error });
        }
      },
    },
  });
}

export const getServerSupabaseClient = createClient;
export const createServerSupabaseClient = createClient;
export const createServerClientInstance = createClient;

export default createClient;
