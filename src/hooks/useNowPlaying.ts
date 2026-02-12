/**
 * useNowPlaying Hook
 * Fetches and polls AzuraCast now playing data
 */

'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { fetchNowPlaying, formatSong, getAlbumArtUrl, type AzuraCastNowPlaying } from '@/lib/azuracast/client'
import { useRealtimeBroadcast } from './useSupabaseRealtime'

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

  useEffect(() => {
    let mounted = true
    let intervalId: NodeJS.Timeout | null = null

    async function fetchData() {
      try {
        const nowPlaying = await fetchNowPlaying()

        if (!mounted) return

        if (nowPlaying) {
          const song = formatSong(nowPlaying.now_playing.song)
          const albumArt = getAlbumArtUrl(nowPlaying.now_playing.song)

          const newData: NowPlayingData = {
            track: song.track,
            artist: song.artist,
            albumArt,
            isLive: nowPlaying.live.is_live,
            streamerName: nowPlaying.live.streamer_name,
            listeners: nowPlaying.listeners.current,
            duration: nowPlaying.now_playing.duration,
            elapsed: nowPlaying.now_playing.elapsed,
          }

          setData(newData)
          setError(null)

          // Broadcast to all connected clients
          console.log('[NowPlaying] Broadcasting:', newData.track)
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

    // Initial fetch
    fetchData()

    // Poll for updates
    intervalId = setInterval(fetchData, POLL_INTERVAL)

    return () => {
      mounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [broadcast])

  return { data, loading, error }
}
