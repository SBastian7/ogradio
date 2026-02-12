/**
 * useSupabaseRealtime Hook
 * Generic hook for subscribing to Supabase Realtime channels
 */

'use client'

import { useEffect, useRef } from 'react'
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

export interface RealtimeSubscriptionOptions<T extends Record<string, any> = any> {
  event: RealtimeEvent
  schema: string
  table: string
  filter?: string
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
}

export interface BroadcastSubscriptionOptions<T = any> {
  event: string
  callback: (payload: T) => void
}

/**
 * Subscribe to Realtime database changes
 */
export function useSupabaseRealtime<T extends Record<string, any> = any>(
  channelName: string,
  subscriptions?: RealtimeSubscriptionOptions<T>[]
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0) return

    const supabase = getSupabaseClient()

    // Create channel
    const channel = supabase.channel(channelName)
    channelRef.current = channel

    // Subscribe to each event
    subscriptions.forEach((sub) => {
      channel.on(
        'postgres_changes',
        {
          event: sub.event,
          schema: sub.schema,
          table: sub.table,
          filter: sub.filter,
        },
        sub.callback
      )
    })

    // Subscribe to channel with timeout and retry
    const subscriptionTimeout = setTimeout(() => {
      console.warn(`[Realtime] Subscription to ${channelName} is taking longer than expected...`)
    }, 10000)

    channel.subscribe((status, err) => {
      clearTimeout(subscriptionTimeout)
      console.log(`[Realtime] ${channelName} status: ${status}`, err || '')

      if (status === 'SUBSCRIBED') {
        console.log(`✓ [Realtime] Successfully subscribed to ${channelName}`)
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`✗ [Realtime] Channel error for ${channelName}:`, err)
        console.error('[Realtime] Possible causes:')
        console.error('  1. Invalid Supabase URL/Key in .env.local')
        console.error('  2. Supabase project is paused or deleted')
        console.error('  3. Network firewall blocking connections')
      } else if (status === 'TIMED_OUT') {
        console.error(`✗ [Realtime] Timeout subscribing to ${channelName}`)
        console.error('[Realtime] Troubleshooting steps:')
        console.error('  1. Check if Supabase project is active at https://supabase.com/dashboard')
        console.error('  2. Verify WebSocket (wss://) connections are not blocked')
        console.error('  3. Check browser DevTools Network tab for failed WebSocket connections')
        console.error('  4. Verify Realtime is enabled for the "messages" table')
      } else if (status === 'CLOSED') {
        console.warn(`⚠ [Realtime] Channel ${channelName} closed`)
      }
    })

    // Cleanup on unmount
    return () => {
      console.log(`[Realtime] Unsubscribing from ${channelName}`)
      supabase.removeChannel(channel)
    }
  }, [channelName, subscriptions])

  return {
    channel: channelRef.current,
    /**
     * Send a broadcast event to the channel
     */
    broadcast: async <T = any>(event: string, payload: T) => {
      if (!channelRef.current) {
        console.warn(`[Realtime] Channel ${channelName} not initialized`)
        return
      }

      await channelRef.current.send({
        type: 'broadcast',
        event,
        payload,
      })
    },
  }
}

/**
 * Subscribe to broadcast events (ephemeral, like typing indicators)
 */
export function useRealtimeBroadcast<T = any>(
  channelName: string,
  subscriptions?: BroadcastSubscriptionOptions<T>[]
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0) return

    const supabase = getSupabaseClient()

    // Create channel
    const channel = supabase.channel(channelName)
    channelRef.current = channel

    // Subscribe to each broadcast event
    subscriptions.forEach((sub) => {
      console.log(`[Realtime Broadcast] Registering listener for '${sub.event}' on ${channelName}`)
      channel.on('broadcast', { event: sub.event }, ({ payload }) => {
        console.log(`[Realtime Broadcast] ✓ Received '${sub.event}' on ${channelName}:`, payload)
        sub.callback(payload as T)
      })
    })

    // Subscribe to channel
    channel.subscribe((status) => {
      console.log(`[Realtime Broadcast] ${channelName} status: ${status}`)
      if (status === 'SUBSCRIBED') {
        console.log(`✓ [Realtime Broadcast] Subscribed to ${channelName}`)
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`✗ [Realtime Broadcast] Failed to subscribe to ${channelName}: ${status}`)
      }
    })

    // Cleanup on unmount
    return () => {
      // Check channel state before cleanup to prevent React Strict Mode issues
      const state = channel.state
      if (state === 'joined') {
        console.log(`[Realtime Broadcast] Unsubscribing from ${channelName} (state: ${state})`)
        supabase.removeChannel(channel)
      } else {
        console.log(`[Realtime Broadcast] Skipping cleanup for ${channelName} (state: ${state})`)
      }
    }
  }, [channelName, subscriptions])

  return {
    channel: channelRef.current,
    /**
     * Send a broadcast event to the channel
     */
    broadcast: async <P = any>(event: string, payload: P) => {
      if (!channelRef.current) {
        console.warn(`[Realtime Broadcast] Channel ${channelName} not initialized`)
        return
      }

      const state = channelRef.current.state
      console.log(`[Realtime Broadcast] Sending '${event}' to ${channelName} (state: ${state})`, payload)

      if (state !== 'joined') {
        console.warn(`[Realtime Broadcast] Channel ${channelName} not joined (state: ${state}), broadcast may fail`)
      }

      try {
        await channelRef.current.send({
          type: 'broadcast',
          event,
          payload,
        })
        console.log(`[Realtime Broadcast] ✓ Sent '${event}' to ${channelName}`)
      } catch (err) {
        console.error(`[Realtime Broadcast] ✗ Failed to send '${event}':`, err)
      }
    },
  }
}
