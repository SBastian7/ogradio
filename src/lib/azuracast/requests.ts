/**
 * AzuraCast Request API Client
 * Handles song request submission and media library search
 */

import type { AzuraCastSong } from './client'

const AZURACAST_BASE_URL = process.env.NEXT_PUBLIC_AZURACAST_BASE_URL || ''
const STATION_ID = process.env.NEXT_PUBLIC_AZURACAST_STATION_ID || ''

export interface AzuraCastRequestableTrack {
  request_id: string // Used for submission
  request_url: string // Full URL for request
  song: AzuraCastSong
  track: {
    id: string
    title: string
    artist: string
    album: string
  }
}

export interface AzuraCastRequestResponse {
  success: boolean
  message?: string
  formatted_message?: string
  request_id?: string
}

/**
 * Search media library for requestable tracks
 * Uses AzuraCast's requestable endpoint with search query
 */
export async function searchRequestableTracks(
  query: string,
  limit = 500
): Promise<AzuraCastRequestableTrack[]> {
  if (!query.trim()) {
    return []
  }

  try {
    console.log('[AzuraCastRequests] Searching for:', query)

    const url = `/api/azuracast/requests?search=${encodeURIComponent(query)}&limit=${limit}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[AzuraCastRequests] Search failed:', response.status, response.statusText)
      return []
    }

    const data = await response.json()

    // AzuraCast returns array of requestable tracks
    if (!Array.isArray(data)) {
      console.warn('[AzuraCastRequests] Unexpected response format:', data)
      return []
    }

    console.log(`[AzuraCastRequests] Found ${data.length} results`)

    // Transform to our interface (limit already applied by proxy)
    return data.map((item: any) => ({
      request_id: item.request_id,
      request_url: item.request_url,
      song: item.song,
      track: {
        id: item.song.id,
        title: item.song.title,
        artist: item.song.artist,
        album: item.song.album || '',
      },
    }))
  } catch (error) {
    console.error('[AzuraCastRequests] Search error:', error)
    return []
  }
}

/**
 * List all requestable tracks via proxy (without search filter)
 * Note: This can return a large dataset, use with caution
 */
export async function fetchRequestableTracks(limit = 10000): Promise<AzuraCastRequestableTrack[]> {
  try {
    console.log('[AzuraCastRequests] Fetching all requestable tracks')

    const url = `/api/azuracast/requests?limit=${limit}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[AzuraCastRequests] Fetch failed:', response.status, response.statusText)
      return []
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      console.warn('[AzuraCastRequests] Unexpected response format:', data)
      return []
    }

    console.log(`[AzuraCastRequests] Fetched ${data.length} requestable tracks`)

    return data.map((item: any) => ({
      request_id: item.request_id,
      request_url: item.request_url,
      song: item.song,
      track: {
        id: item.song.id,
        title: item.song.title,
        artist: item.song.artist,
        album: item.song.album || '',
      },
    }))
  } catch (error) {
    console.error('[AzuraCastRequests] Fetch error:', error)
    return []
  }
}

/**
 * Submit request to AzuraCast queue
 * Uses the request_id from search results
 */
export async function submitRequest(
  requestId: string,
  apiKey?: string
): Promise<AzuraCastRequestResponse> {
  try {
    console.log('[AzuraCastRequests] Submitting request:', requestId)

    const url = `${AZURACAST_BASE_URL}/api/station/${STATION_ID}/request/${requestId}`

    const headers: HeadersInit = {
      'Accept': 'application/json',
    }

    // Add API key if provided (may not be needed for public request endpoint)
    if (apiKey) {
      headers['X-API-Key'] = apiKey
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[AzuraCastRequests] Submit failed:', response.status, data)
      return {
        success: false,
        message: data.message || data.error || 'Request submission failed',
        formatted_message: data.formatted_message,
      }
    }

    console.log('[AzuraCastRequests] Submit successful:', data)

    return {
      success: data.success !== false, // AzuraCast returns success: true/false
      message: data.message,
      formatted_message: data.formatted_message,
      request_id: requestId,
    }
  } catch (error) {
    console.error('[AzuraCastRequests] Submit error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Parse AzuraCast error messages to user-friendly Spanish
 */
export function parseRequestError(message: string): string {
  const errorMap: Record<string, string> = {
    'already_queued': 'Esta canción ya está en la cola',
    'This song or album is already in the queue': 'Esta canción ya está en la cola',
    'recently_played': 'Esta canción se reprodujo recientemente',
    'This song or album was played too recently': 'Esta canción se reprodujo recientemente',
    'not_requestable': 'Esta canción no está disponible para solicitudes',
    'This song is not allowed to be requested': 'Esta canción no está disponible para solicitudes',
    'rate_limit': 'Espera unos minutos antes de solicitar otra canción',
    'You have submitted a request too recently': 'Espera unos minutos antes de solicitar otra canción',
    'network_error': 'Error de conexión. Por favor intenta de nuevo.',
  }

  // Check for exact matches
  for (const [key, value] of Object.entries(errorMap)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }

  // Return original message if no match
  return message
}
