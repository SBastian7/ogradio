/**
 * Supabase Client-Side Client
 * Use this in React components and client-side code
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.error('URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
    console.error('Key:', supabaseKey ? '✓ Set' : '✗ Missing')
    throw new Error('Supabase configuration missing. Check .env.local file.')
  }

  console.log('[Supabase] Creating client...')
  console.log('[Supabase] URL:', supabaseUrl)
  console.log('[Supabase] Key:', supabaseKey.substring(0, 20) + '...')

  try {
    const client = createBrowserClient<Database>(supabaseUrl, supabaseKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })

    console.log('[Supabase] ✓ Client created successfully')
    return client
  } catch (err) {
    console.error('[Supabase] ❌ Failed to create client:', err)
    throw err
  }
}

// Singleton instance for client-side
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
}
