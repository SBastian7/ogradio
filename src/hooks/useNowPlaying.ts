/**
 * useNowPlaying Hook
 * Fetches now playing data with SSE real-time updates and polling fallback
 */

'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { fetchNowPlaying, formatSong, getAlbumArtUrl, type AzuraCastNowPlaying } from '@/lib/azuracast/client'
import { useRealtimeBroadcast } from './useSupabaseRealtime'
import { useAzuraCastRealtime } from './useAzuraCastRealtime'
import type { ConnectionStatus } from '@/lib/azuracast/realtime'

export interface NowPlayingData {
  track: string
  artist: string
  albumArt: string | null
  isLive: boolean
  streamerName?: string
  listeners: number
  duration: number
  elapsed: number
}

const POLL_INTERVAL = 15000 // 15 seconds

/**
 * Transform AzuraCast API data to internal format
 */
function transformNowPlayingData(nowPlaying: AzuraCastNowPlaying): NowPlayingData {
  const song = formatSong(nowPlaying.now_playing.song)
  const albumArt = getAlbumArtUrl(nowPlaying.now_playing.song)

  return {
    track: song.track,
    artist: song.artist,
    albumArt,
    isLive: nowPlaying.live.is_live,
    streamerName: nowPlaying.live.streamer_name,
    listeners: nowPlaying.listeners.current,
    duration: nowPlaying.now_playing.duration,
    elapsed: nowPlaying.now_playing.elapsed,
  }
}

export function useNowPlaying() {
  const [data, setData] = useState<NowPlayingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Callback for receiving broadcast now playing updates
  const handleNowPlayingBroadcast = useCallback((broadcastData: NowPlayingData) => {
    console.log('[NowPlaying] Received broadcast:', broadcastData.track)
    setData(broadcastData)
    setLoading(false)
  }, [])

  // Memoize subscription array
  const subscriptions = useMemo(() => [
    {
      event: 'track-update',
      callback: handleNowPlayingBroadcast,
    },
  ], [handleNowPlayingBroadcast])

  // Subscribe to now playing broadcasts
  const { broadcast } = useRealtimeBroadcast<NowPlayingData>(
    'now-playing',
    subscriptions
  )

  // Handle SSE update
  const handleRealtimeUpdate = useCallback(async (azData: AzuraCastNowPlaying) => {
    console.log('[NowPlaying] Received SSE update')
    const newData = transformNowPlayingData(azData)
    setData(newData)
    setError(null)
    setLoading(false)

    // Broadcast to all connected clients
    console.log('[NowPlaying] Broadcasting:', newData.track)
    await broadcast('track-update', newData)
  }, [broadcast])

  // SSE real-time connection (enabled by feature flag)
  const sseEnabled = process.env.NEXT_PUBLIC_ENABLE_AZURACAST_REALTIME !== 'false'
  const { status: realtimeStatus } = useAzuraCastRealtime({
    enabled: sseEnabled,
    onUpdate: handleRealtimeUpdate,
  })

  // Polling fallback (only when SSE is not connected)
  useEffect(() => {
    let mounted = true
    let intervalId: NodeJS.Timeout | null = null

    async function fetchData() {
      try {
        const nowPlaying = await fetchNowPlaying()

        if (!mounted) return

        if (nowPlaying) {
          const newData = transformNowPlayingData(nowPlaying)

          setData(newData)
          setError(null)

          // Broadcast to all connected clients
          console.log('[NowPlaying] Broadcasting (polling):', newData.track)
          await broadcast('track-update', newData)
        } else {
          setError('Failed to fetch now playing data')
        }

        setLoading(false)
      } catch (err) {
        console.error('[NowPlaying] Error:', err)
        if (mounted) {
          setError('Failed to fetch now playing data')
          setLoading(false)
        }
      }
    }

    // Only poll if SSE is not available or feature disabled
    const shouldPoll = !sseEnabled ||
                       realtimeStatus === 'disconnected' ||
                       realtimeStatus === 'error'

    if (shouldPoll) {
      console.log('[NowPlaying] Using polling mode (SSE:', realtimeStatus, ')')

      // Initial fetch
      fetchData()

      // Poll for updates
      intervalId = setInterval(fetchData, POLL_INTERVAL)
    } else {
      console.log('[NowPlaying] Using SSE mode, polling disabled')
    }

    return () => {
      mounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [realtimeStatus, sseEnabled, broadcast])

  return {
    data,
    loading,
    error,
    realtimeStatus, // Expose for UI status badge
  }
}
