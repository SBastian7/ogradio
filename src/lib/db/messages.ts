/**
 * Database Helper Functions - Messages
 */

import type { Database } from '@/lib/supabase/database.types'

type Message = Database['public']['Tables']['messages']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']

/**
 * Get recent messages
 * @param supabase - Supabase client instance
 * @param limit - Number of messages to fetch (default: 100)
 */
export async function getRecentMessages(
  supabase: any,
  limit: number = 100
) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url,
        is_anonymous
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  // Reverse to show oldest first
  return data.reverse()
}

/**
 * Send a message
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param content - Message content
 */
export async function sendMessage(
  supabase: any,
  userId: string,
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      user_id: userId,
      content: content.trim(),
    })
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url,
        is_anonymous
      )
    `)
    .single()

  if (error) throw error
  return data
}

/**
 * Subscribe to new messages
 * @param supabase - Supabase client instance
 * @param callback - Function to call when new message arrives
 */
export function subscribeToMessages(
  supabase: any,
  callback: (message: any) => void
) {
  const channel = supabase
    .channel('messages-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      async (payload: any) => {
        // Fetch the complete message with profile data
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            profiles:user_id (
              username,
              avatar_url,
              is_anonymous
            )
          `)
          .eq('id', payload.new.id)
          .single()

        if (data) {
          callback(data)
        }
      }
    )
    .subscribe()

  return channel
}
