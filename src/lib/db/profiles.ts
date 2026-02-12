/**
 * Database Helper Functions - Profiles
 */

import type { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']

/**
 * Generate a random anonymous username
 */
export function generateAnonymousUsername(): string {
  const adjectives = [
    'Cool', 'Groovy', 'Funky', 'Jazzy', 'Smooth', 'Chill', 'Rad', 'Epic',
    'Vibe', 'Cosmic', 'Electric', 'Neon', 'Stellar', 'Dynamic', 'Sonic'
  ]
  const nouns = [
    'Listener', 'Viber', 'Dancer', 'Groover', 'Fan', 'Beat', 'Soul',
    'Wave', 'Rhythm', 'Melody', 'Harmony', 'Frequency', 'Echo', 'Tune'
  ]

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 10000)

  return `${adj}${noun}_${num}`
}

/**
 * Get or create profile for user
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param options - Optional profile data
 */
export async function getOrCreateProfile(
  supabase: any,
  userId: string,
  options?: {
    username?: string
    is_anonymous?: boolean
    avatar_url?: string | null
  }
) {
  // Try to get existing profile
  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (existing) return existing

  // Create new profile if it doesn't exist
  const username = options?.username || generateAnonymousUsername()

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username,
      is_anonymous: options?.is_anonymous ?? true,
      avatar_url: options?.avatar_url ?? null,
    })
    .select()
    .single()

  if (error) {
    // Handle unique constraint violation (username already taken)
    if (error.code === '23505') {
      // Try again with a new username
      return getOrCreateProfile(supabase, userId, options)
    }
    throw error
  }

  return data
}

/**
 * Update profile
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param updates - Profile updates
 */
export async function updateProfile(
  supabase: any,
  userId: string,
  updates: {
    username?: string
    avatar_url?: string
    is_anonymous?: boolean
  }
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    // Handle unique constraint violation (username already taken)
    if (error.code === '23505') {
      throw new Error('Username already taken')
    }
    throw error
  }

  return data
}

/**
 * Get profile by ID
 * @param supabase - Supabase client instance
 * @param userId - User ID
 */
export async function getProfile(
  supabase: any,
  userId: string
) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

/**
 * Check if username is available
 * @param supabase - Supabase client instance
 * @param username - Username to check
 * @param currentUserId - Current user ID (to exclude from check)
 */
export async function isUsernameAvailable(
  supabase: any,
  username: string,
  currentUserId?: string
): Promise<boolean> {
  let query = supabase
    .from('profiles')
    .select('id')
    .eq('username', username)

  if (currentUserId) {
    query = query.neq('id', currentUserId)
  }

  const { data, error } = await query.maybeSingle()

  if (error) throw error
  return !data
}
