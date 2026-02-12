/**
 * AzuraCast Requests API Proxy
 * Proxies song request search to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server'

const AZURACAST_BASE_URL = process.env.NEXT_PUBLIC_AZURACAST_BASE_URL || 'https://radio.ogclub.info'
const STATION_ID = process.env.NEXT_PUBLIC_AZURACAST_STATION_ID || 'og_club'
const API_KEY = process.env.NEXT_PUBLIC_AZURACAST_API_KEY

export async function GET(request: NextRequest) {
  try {
    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams
    const searchQuery = searchParams.get('search') || ''
    const limit = searchParams.get('limit') || '50'

    // Construct AzuraCast API URL with search parameter
    let url = `${AZURACAST_BASE_URL}/api/station/${STATION_ID}/requests`

    // Add search query if provided
    if (searchQuery) {
      url += `?searchphrase=${encodeURIComponent(searchQuery)}`
    }

    console.log('[Requests Proxy] Search query:', searchQuery)
    console.log('[Requests Proxy] Fetching from:', url)

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
      console.error('[Requests Proxy] AzuraCast API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `AzuraCast API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      console.error('[Requests Proxy] Unexpected response format:', data)
      return NextResponse.json([], {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      })
    }

    console.log('[Requests Proxy] Successfully fetched', data.length, 'requestable tracks')

    // Apply limit
    const limitedData = data.slice(0, parseInt(limit, 10))

    return NextResponse.json(limitedData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error) {
    console.error('[Requests Proxy] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
