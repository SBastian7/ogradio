/**
 * AzuraCast Now Playing API Proxy
 * Proxies now playing requests to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server'

const AZURACAST_BASE_URL = process.env.NEXT_PUBLIC_AZURACAST_BASE_URL || 'https://radio.ogclub.info'
const STATION_ID = process.env.NEXT_PUBLIC_AZURACAST_STATION_ID || 'og_club'
const API_KEY = process.env.NEXT_PUBLIC_AZURACAST_API_KEY

export async function GET(request: NextRequest) {
  try {
    // Construct AzuraCast API URL
    const url = `${AZURACAST_BASE_URL}/api/nowplaying/${STATION_ID}`

    console.log('[NowPlaying Proxy] Fetching from:', url)

    // Build headers
    const headers: HeadersInit = {
      'Accept': 'application/json',
    }

    // Add API key if available
    if (API_KEY) {
      headers['X-API-Key'] = API_KEY
    }

    // Fetch from AzuraCast
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[NowPlaying Proxy] AzuraCast API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `AzuraCast API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[NowPlaying Proxy] Successfully fetched now playing data')

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error) {
    console.error('[NowPlaying Proxy] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
