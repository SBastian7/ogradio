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
  played_at: number
}

const AZURACAST_BASE_URL = process.env.NEXT_PUBLIC_AZURACAST_BASE_URL || 'https://radio.ogclub.info'
const STATION_ID = process.env.NEXT_PUBLIC_AZURACAST_STATION_ID || 'og_club'

/**
 * Fetch now playing data from AzuraCast
 */
export async function fetchNowPlaying(): Promise<AzuraCastNowPlaying | null> {
  try {
    const response = await fetch(`${AZURACAST_BASE_URL}/api/nowplaying/${STATION_ID}`, {
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
 * Fetch song history from AzuraCast
 */
export async function fetchSongHistory(limit: number = 5): Promise<AzuraCastHistoryItem[]> {
  try {
    const response = await fetch(
      `${AZURACAST_BASE_URL}/api/station/${STATION_ID}/history?limit=${limit}`,
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
