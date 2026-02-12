/**
 * Supabase Library - Main Export
 */

export { createClient as createBrowserClient, getSupabaseClient } from './client'
export { createClient as createServerClient, createAdminClient } from './server'
export type { Database } from './database.types'
