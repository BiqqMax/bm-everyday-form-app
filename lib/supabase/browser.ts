import { createBrowserClient } from '@supabase/ssr'

import { getSupabaseAnonKey, getSupabaseUrl } from './env'

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey())
}

export const getBrowserSupabaseClient = createClient
export const createBrowserSupabaseClient = createClient
export const createBrowserClientInstance = createClient

export default createClient
