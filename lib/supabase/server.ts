import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import { supabaseAnonKey, supabaseUrl } from './env'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // Route handlers can set cookies; server components may not.
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 })
        } catch {
          // Ignore when cookies cannot be mutated.
        }
      },
    },
  })
}

export const getServerSupabaseClient = createClient
export const createServerSupabaseClient = createClient
export const createServerClientInstance = createClient

export default createClient
