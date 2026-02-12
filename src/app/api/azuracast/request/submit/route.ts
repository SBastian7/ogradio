/**
 * AzuraCast Request Submit API Proxy
 * Proxies song request submission to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server'

const AZURACAST_BASE_URL = process.env.NEXT_PUBLIC_AZURACAST_BASE_URL || 'https://radio.ogclub.info'
const STATION_ID = process.env.NEXT_PUBLIC_AZURACAST_STATION_ID || 'og_club'
const API_KEY = process.env.NEXT_PUBLIC_AZURACAST_API_KEY

export async function POST(request: NextRequest) {
  try {
    // Get request_id from body
    const body = await request.json()
    const { request_id } = body

    if (!request_id) {
      return NextResponse.json(
        { success: false, message: 'request_id is required' },
        { status: 400 }
      )
    }

    console.log('[Request Submit Proxy] Submitting request:', request_id)

    // Construct AzuraCast API URL
    const url = `${AZURACAST_BASE_URL}/api/station/${STATION_ID}/request/${request_id}`

    // Build headers
    const headers: HeadersInit = {
      'Accept': 'application/json',
    }

    // Add API key if available
    if (API_KEY) {
      headers['X-API-Key'] = API_KEY
    }

    // Submit to AzuraCast
    const response = await fetch(url, {
      method: 'POST',
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[Request Submit Proxy] AzuraCast API error:', response.status, data)
      return NextResponse.json(
        {
          success: false,
          message: data.message || data.error || 'Request submission failed',
          formatted_message: data.formatted_message,
        },
        { status: response.status }
      )
    }

    console.log('[Request Submit Proxy] Submit successful:', data)

    return NextResponse.json({
      success: data.success !== false,
      message: data.message,
      formatted_message: data.formatted_message,
      request_id,
    })
  } catch (error) {
    console.error('[Request Submit Proxy] Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
