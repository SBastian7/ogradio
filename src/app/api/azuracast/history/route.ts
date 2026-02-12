/**
 * AzuraCast History API Proxy
 * Proxies song history requests to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server'

const AZURACAST_BASE_URL = process.env.NEXT_PUBLIC_AZURACAST_BASE_URL || 'https://radio.ogclub.info'
const STATION_ID = process.env.NEXT_PUBLIC_AZURACAST_STATION_ID || 'og_club'
const API_KEY = process.env.NEXT_PUBLIC_AZURACAST_API_KEY

export async function GET(request: NextRequest) {
  try {
    // Get limit from query params
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') || '20'

    // Construct AzuraCast API URL
    const url = `${AZURACAST_BASE_URL}/api/station/${STATION_ID}/history?limit=${limit}`

    console.log('[History Proxy] Fetching from:', url)

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
      console.error('[History Proxy] AzuraCast API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `AzuraCast API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[History Proxy] Successfully fetched', data.length, 'items')

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error) {
    console.error('[History Proxy] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
