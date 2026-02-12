/**
 * useSongHistory Hook
 * Fetches and manages song history state with automatic updates
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchSongHistory, formatHistoryTimestamp, getAlbumArtUrl, type AzuraCastHistoryItem } from '@/lib/azuracast/client'
import { useNowPlaying } from './useNowPlaying'

export interface SongHistoryItem {
  id: string
  track: string
  artist: string
  albumArt: string | null
  playedAt: Date
  playedAtFormatted: string
  source: 'playlist' | 'request' | 'live'
  streamerName?: string
  duration: number
}

export interface UseSongHistoryReturn {
  history: SongHistoryItem[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook for managing song history state
 * - Fetches history on mount
 * - Auto-updates when track changes
 * - Maintains limit in state
 * - Provides manual refresh capability
 */
export function useSongHistory(limit: number = 20): UseSongHistoryReturn {
  const [history, setHistory] = useState<SongHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { data: nowPlayingData } = useNowPlaying()
  const previousTrackRef = useRef<string | null>(null)

  /**
   * Transform AzuraCast history item to internal format
   */
  const transformHistoryItem = useCallback((item: AzuraCastHistoryItem): SongHistoryItem => {
    // Determine source
    let source: 'playlist' | 'request' | 'live' = 'playlist'
    if (item.is_request) {
      source = 'request'
    } else if (item.streamer) {
      source = 'live'
    }

    return {
      id: `${item.played_at}-${item.song.title}-${item.song.artist}`,
      track: item.song.title || 'Unknown Track',
      artist: item.song.artist || 'Unknown Artist',
      albumArt: getAlbumArtUrl(item.song),
      playedAt: new Date(item.played_at * 1000), // Convert Unix to Date
      playedAtFormatted: formatHistoryTimestamp(item.played_at),
      source,
      streamerName: item.streamer || undefined,
      duration: item.duration || 0,
    }
  }, [])

  /**
   * Fetch history from API
   */
  const fetchHistory = useCallback(async () => {
    try {
      console.log('[SongHistory] Fetching history...')

      // Fetch one extra song to account for filtering out the current track
      const historyData = await fetchSongHistory(limit + 1)

      let transformed = historyData.map(transformHistoryItem)

      // Filter out the currently playing song if it appears in history
      if (nowPlayingData) {
        const currentTrackKey = `${nowPlayingData.track.toLowerCase()}-${nowPlayingData.artist.toLowerCase()}`
        transformed = transformed.filter(item => {
          const itemKey = `${item.track.toLowerCase()}-${item.artist.toLowerCase()}`
          return itemKey !== currentTrackKey
        })
      }

      // Ensure we only keep the requested limit
      transformed = transformed.slice(0, limit)

      console.log('[SongHistory] Showing', transformed.length, 'items (current track filtered out)')
      setHistory(transformed)
      setError(null)
    } catch (err) {
      console.error('[SongHistory] Error fetching history:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar historial'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [limit, transformHistoryItem, nowPlayingData])

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    setLoading(true)
    await fetchHistory()
  }, [fetchHistory])

  // Initial fetch on mount
  useEffect(() => {
    let mounted = true

    if (mounted) {
      fetchHistory()
    }

    return () => {
      mounted = false
    }
  }, [fetchHistory])

  // Auto-update when track changes
  useEffect(() => {
    if (!nowPlayingData) return

    const currentTrack = `${nowPlayingData.track}-${nowPlayingData.artist}`

    // Detect track change
    if (previousTrackRef.current && previousTrackRef.current !== currentTrack) {
      console.log('[SongHistory] Track changed, updating history')

      // Create history item from previous track
      const previousItem: SongHistoryItem = {
        id: `${Date.now()}-${nowPlayingData.track}-${nowPlayingData.artist}`,
        track: nowPlayingData.track,
        artist: nowPlayingData.artist,
        albumArt: nowPlayingData.albumArt,
        playedAt: new Date(),
        playedAtFormatted: 'Hace unos segundos',
        source: nowPlayingData.isLive ? 'live' : 'playlist',
        streamerName: nowPlayingData.streamerName,
        duration: nowPlayingData.duration || 0,
      }

      // Prepend to history and keep only limit items
      setHistory((prev) => [previousItem, ...prev.slice(0, limit - 1)])
    }

    previousTrackRef.current = currentTrack
  }, [nowPlayingData, limit])

  // Update timestamps periodically (every minute)
  useEffect(() => {
    const intervalId = setInterval(() => {
      setHistory((prev) =>
        prev.map((item) => ({
          ...item,
          playedAtFormatted: formatHistoryTimestamp(
            Math.floor(item.playedAt.getTime() / 1000)
          ),
        }))
      )
    }, 60000) // Update every 60 seconds

    return () => clearInterval(intervalId)
  }, [])

  return {
    history,
    loading,
    error,
    refresh,
  }
}
