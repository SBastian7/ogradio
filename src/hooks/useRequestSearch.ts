/**
 * useRequestSearch Hook
 * Manages searching AzuraCast media library with client-side filtering
 * Fetches all requestable tracks once and filters them locally
 */

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchRequestableTracks, type AzuraCastRequestableTrack } from '@/lib/azuracast/requests'

export function useRequestSearch() {
  const [allTracks, setAllTracks] = useState<AzuraCastRequestableTrack[]>([])
  const [results, setResults] = useState<AzuraCastRequestableTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [tracksLoaded, setTracksLoaded] = useState(false)

  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  /**
   * Fetch all requestable tracks (called once)
   */
  const loadAllTracks = useCallback(async () => {
    if (tracksLoaded) return // Already loaded

    try {
      setLoading(true)
      setError(null)

      console.log('[RequestSearch] Loading all requestable tracks...')
      const tracks = await fetchRequestableTracks(10000) // Large limit to get all tracks

      if (!mounted.current) return

      console.log(`[RequestSearch] Loaded ${tracks.length} tracks for client-side filtering`)
      setAllTracks(tracks)
      setTracksLoaded(true)
      setError(null)
    } catch (err) {
      console.error('[RequestSearch] Error loading tracks:', err)
      if (mounted.current) {
        setError('Error al cargar canciones')
      }
    } finally {
      if (mounted.current) {
        setLoading(false)
      }
    }
  }, [tracksLoaded])

  /**
   * Filter tracks based on search query (client-side)
   */
  const filterTracks = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      const query = searchQuery.toLowerCase()
      const filtered = allTracks.filter((track) => {
        const title = track.track.title.toLowerCase()
        const artist = track.track.artist.toLowerCase()
        const album = track.track.album?.toLowerCase() || ''

        return (
          title.includes(query) ||
          artist.includes(query) ||
          album.includes(query)
        )
      })

      console.log(`[RequestSearch] Filtered ${filtered.length} tracks for query: "${searchQuery}"`)
      setResults(filtered.slice(0, 50)) // Limit to 50 results for display
    },
    [allTracks]
  )

  /**
   * Search function (loads tracks if needed, then filters)
   */
  const search = useCallback(
    async (searchQuery: string) => {
      setQuery(searchQuery)

      // If empty query, clear results
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      // Load tracks if not already loaded
      if (!tracksLoaded && !loading) {
        await loadAllTracks()
      }

      // Filter tracks client-side
      filterTracks(searchQuery)
    },
    [tracksLoaded, loading, loadAllTracks, filterTracks]
  )

  /**
   * Clear search results
   */
  const clear = useCallback(() => {
    setQuery('')
    setResults([])
    setError(null)
  }, [])

  return {
    results,
    loading,
    error,
    query,
    search,
    clear,
  }
}
