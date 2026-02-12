/**
 * usePresence Hook
 * Track online users using Supabase Realtime Presence
 */

'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'

export interface PresenceUser {
  userId: string
  username: string
  isAnonymous: boolean
  joinedAt: string
}

/**
 * Hook for tracking online users with Realtime Presence
 */
export function usePresence() {
  const [onlineCount, setOnlineCount] = useState(0)
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])
  const { profile } = useAuth()

  useEffect(() => {
    if (!profile) return

    const supabase = getSupabaseClient()
    const channelName = 'online-listeners'

    console.log('[Presence] Setting up presence tracking...')

    // Create presence channel
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: profile.id,
        },
      },
    })

    // Track presence state changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        console.log('[Presence] Sync - Current state:', state)

        // Convert presence state to user list
        const users: PresenceUser[] = []
        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[]
          presences.forEach((presence) => {
            users.push({
              userId: presence.userId,
              username: presence.username,
              isAnonymous: presence.isAnonymous,
              joinedAt: presence.joinedAt,
            })
          })
        })

        setOnlineUsers(users)
        setOnlineCount(users.length)
        console.log(`[Presence] ${users.length} users online`)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[Presence] User joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('[Presence] User left:', leftPresences)
      })

    // Subscribe and track our presence
    channel.subscribe(async (status) => {
      console.log('[Presence] Channel status:', status)

      if (status === 'SUBSCRIBED') {
        // Track our own presence
        const presenceData = {
          userId: profile.id,
          username: profile.username,
          isAnonymous: profile.is_anonymous,
          joinedAt: new Date().toISOString(),
        }

        const trackStatus = await channel.track(presenceData)
        console.log('[Presence] Tracking status:', trackStatus)
      }
    })

    // Cleanup
    return () => {
      console.log('[Presence] Untracking and unsubscribing...')
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [profile])

  return {
    onlineCount,
    onlineUsers,
  }
}
