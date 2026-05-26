import { createBrowserClient } from '@supabase/ssr'

import { supabaseAnonKey, supabaseUrl } from './env'

export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!)
}

export const getBrowserSupabaseClient = createClient
export const createBrowserSupabaseClient = createClient
export const createBrowserClientInstance = createClient

export default createClient
