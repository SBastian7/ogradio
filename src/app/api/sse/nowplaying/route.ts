/**
 * SSE Proxy Endpoint for AzuraCast
 * Proxies Server-Sent Events from AzuraCast to avoid CORS issues
 * The browser connects to this local endpoint, and the server forwards SSE events from AzuraCast
 */

import { NextRequest } from 'next/server'

const AZURACAST_BASE_URL = process.env.NEXT_PUBLIC_AZURACAST_BASE_URL || 'https://radio.ogclub.info'

/**
 * GET handler for SSE proxy
 * Establishes a streaming connection to AzuraCast and forwards events to the client
 */
export async function GET(request: NextRequest) {
  // Construct the AzuraCast SSE URL
  const azuracastSSEUrl = `${AZURACAST_BASE_URL}/api/live/nowplaying/sse`

  console.log('[SSE Proxy] Connecting to AzuraCast SSE:', azuracastSSEUrl)

  try {
    // Fetch the SSE stream from AzuraCast
    const response = await fetch(azuracastSSEUrl, {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      // Important: Don't follow redirects automatically
      redirect: 'follow',
    })

    if (!response.ok) {
      console.error('[SSE Proxy] Failed to connect to AzuraCast:', response.status, response.statusText)
      return new Response(
        `Failed to connect to AzuraCast SSE: ${response.status} ${response.statusText}`,
        {
          status: response.status,
          headers: {
            'Content-Type': 'text/plain',
          },
        }
      )
    }

    if (!response.body) {
      console.error('[SSE Proxy] No response body from AzuraCast')
      return new Response('No response body from AzuraCast SSE', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }

    console.log('[SSE Proxy] Connected to AzuraCast SSE, streaming to client')

    // Create a streaming response with SSE headers
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()

        // Send initial connection comment
        controller.enqueue(encoder.encode(': connected\n\n'))

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              console.log('[SSE Proxy] Stream ended')
              controller.close()
              break
            }

            // Decode and forward the chunk
            const chunk = decoder.decode(value, { stream: true })
            controller.enqueue(encoder.encode(chunk))
          }
        } catch (error) {
          console.error('[SSE Proxy] Stream error:', error)
          controller.error(error)
        }
      },
      cancel() {
        console.log('[SSE Proxy] Client disconnected')
      },
    })

    // Return the streaming response with proper SSE headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering in nginx
      },
    })
  } catch (error) {
    console.error('[SSE Proxy] Error connecting to AzuraCast:', error)
    return new Response(
      `Error connecting to AzuraCast SSE: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    )
  }
}

/**
 * Configure route segment options
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
