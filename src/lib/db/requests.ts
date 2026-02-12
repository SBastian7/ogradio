/**
 * Database Helper Functions - Song Requests
 */

import type { Database } from '@/lib/supabase/database.types'

type SongRequest = Database['public']['Tables']['song_requests']['Row']
type SongRequestInsert = Database['public']['Tables']['song_requests']['Insert']

/**
 * Get song requests queue with upvote counts
 * @param supabase - Supabase client instance
 * @param status - Filter by status (default: 'pending')
 */
export async function getSongRequestsQueue(
  supabase: any,
  status: 'pending' | 'playing' | 'played' | 'skipped' = 'pending'
) {
  const { data, error } = await supabase
    .from('song_requests_with_votes')
    .select('*')
    .eq('status', status)
    .order('upvote_count', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Create a new song request
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param songName - Song name
 * @param artist - Artist name
 */
export async function createSongRequest(
  supabase: any,
  userId: string,
  songName: string,
  artist: string
) {
  const { data, error } = await supabase
    .from('song_requests')
    .insert({
      user_id: userId,
      song_name: songName.trim(),
      artist: artist.trim(),
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Upvote a song request
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param requestId - Request ID
 */
export async function upvoteSongRequest(
  supabase: any,
  userId: string,
  requestId: string
) {
  const { data, error } = await supabase
    .from('upvotes')
    .insert({
      user_id: userId,
      request_id: requestId,
    })
    .select()
    .single()

  if (error) {
    // Check if it's a duplicate error (user already upvoted)
    if (error.code === '23505') {
      throw new Error('You have already upvoted this request')
    }
    throw error
  }

  return data
}

/**
 * Remove upvote from a song request
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param requestId - Request ID
 */
export async function removeUpvote(
  supabase: any,
  userId: string,
  requestId: string
) {
  const { error } = await supabase
    .from('upvotes')
    .delete()
    .eq('user_id', userId)
    .eq('request_id', requestId)

  if (error) throw error
}

/**
 * Check if user has upvoted a request
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param requestId - Request ID
 */
export async function hasUserUpvoted(
  supabase: any,
  userId: string,
  requestId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('upvotes')
    .select('id')
    .eq('user_id', userId)
    .eq('request_id', requestId)
    .maybeSingle()

  if (error) throw error
  return !!data
}

/**
 * Get user's upvoted request IDs
 * @param supabase - Supabase client instance
 * @param userId - User ID
 */
export async function getUserUpvotedRequests(
  supabase: any,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('upvotes')
    .select('request_id')
    .eq('user_id', userId)

  if (error) throw error
  return data.map((item: any) => item.request_id)
}

/**
 * Subscribe to song requests changes
 * @param supabase - Supabase client instance
 * @param callback - Function to call when requests change
 */
export function subscribeToSongRequests(
  supabase: any,
  callback: () => void
) {
  const channel = supabase
    .channel('song-requests-channel')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'song_requests',
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'upvotes',
      },
      callback
    )
    .subscribe()

  return channel
}

/**
 * Update song request status (admin only - use with service role key)
 * @param supabase - Supabase admin client instance
 * @param requestId - Request ID
 * @param status - New status
 */
export async function updateRequestStatus(
  supabase: any,
  requestId: string,
  status: 'pending' | 'playing' | 'played' | 'skipped'
) {
  const { data, error } = await supabase
    .from('song_requests')
    .update({ status })
    .eq('id', requestId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get currently playing song
 * @param supabase - Supabase client instance
 */
export async function getCurrentlyPlaying(supabase: any) {
  const { data, error } = await supabase
    .from('song_requests_with_votes')
    .select('*')
    .eq('status', 'playing')
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Get recently played songs
 * @param supabase - Supabase client instance
 * @param limit - Number of songs to fetch (default: 10)
 */
export async function getRecentlyPlayed(
  supabase: any,
  limit: number = 10
) {
  const { data, error } = await supabase
    .from('song_requests_with_votes')
    .select('*')
    .eq('status', 'played')
    .order('played_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
