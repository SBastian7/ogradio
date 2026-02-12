/**
 * AzuraCast API Client
 * Fetches now playing data, listener count, and song history
 */

export interface AzuraCastSong {
  title: string
  artist: string
  album: string
  art: string | null
}

export interface AzuraCastNowPlaying {
  station: {
    name: string
    listen_url: string
    is_public: boolean
  }
  listeners: {
    current: number
    unique: number
  }
  now_playing: {
    song: AzuraCastSong
    duration: number
    elapsed: number
  }
  live: {
    is_live: boolean
    streamer_name?: string
  }
}

export interface AzuraCastHistoryItem {
  song: AzuraCastSong
  played_at: number       // Unix timestamp
  duration: number        // Song duration in seconds
  playlist: string        // Playlist name or empty
  streamer: string | null // DJ name if live broadcast
  is_request: boolean     // True if song was requested
}

const AZURACAST_BASE_URL = process.env.NEXT_PUBLIC_AZURACAST_BASE_URL || 'https://radio.ogclub.info'
const STATION_ID = process.env.NEXT_PUBLIC_AZURACAST_STATION_ID || 'og_club'

/**
 * Fetch now playing data from AzuraCast via proxy
 */
export async function fetchNowPlaying(): Promise<AzuraCastNowPlaying | null> {
  try {
    const response = await fetch('/api/azuracast/nowplaying', {
      cache: 'no-store',
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      throw new Error(`AzuraCast API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch now playing:', error)
    return null
  }
}

/**
 * Fetch song history from AzuraCast via proxy
 */
export async function fetchSongHistory(limit: number = 20): Promise<AzuraCastHistoryItem[]> {
  try {
    const response = await fetch(
      `/api/azuracast/history?limit=${limit}`,
      {
        cache: 'no-store',
        next: { revalidate: 0 },
      }
    )

    if (!response.ok) {
      throw new Error(`AzuraCast API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch song history:', error)
    return []
  }
}

/**
 * Format AzuraCast song for display
 */
export function formatSong(song: AzuraCastSong): { track: string; artist: string } {
  return {
    track: song.title || 'Unknown Track',
    artist: song.artist || 'Unknown Artist',
  }
}

/**
 * Get album art URL with fallback
 */
export function getAlbumArtUrl(song: AzuraCastSong): string | null {
  if (!song.art) return null

  // If art is a relative URL, make it absolute
  if (song.art.startsWith('/')) {
    return `${AZURACAST_BASE_URL}${song.art}`
  }

  return song.art
}

/**
 * Format history timestamp to relative time
 * @param playedAt - Unix timestamp in seconds
 * @returns Relative time string (e.g., "2 minutes ago")
 */
export function formatHistoryTimestamp(playedAt: number): string {
  const now = Date.now()
  const playedDate = playedAt * 1000 // Convert to milliseconds
  const diffMs = now - playedDate
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) {
    return 'Hace unos segundos'
  } else if (diffMin < 60) {
    return `Hace ${diffMin} minuto${diffMin !== 1 ? 's' : ''}`
  } else if (diffHour < 24) {
    return `Hace ${diffHour} hora${diffHour !== 1 ? 's' : ''}`
  } else {
    return `Hace ${diffDay} día${diffDay !== 1 ? 's' : ''}`
  }
}
