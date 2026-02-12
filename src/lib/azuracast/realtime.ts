/**
 * AzuraCast Real-Time Client
 * Manages SSE connection with Centrifugo for instant track updates
 */

import type { AzuraCastNowPlaying } from './client'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface AzuraCastRealtimeOptions {
  stationId: string
  baseUrl: string
  onUpdate: (data: AzuraCastNowPlaying) => void
  onStatusChange?: (status: ConnectionStatus) => void
  onError?: (error: Error) => void
}

export interface RealtimeNowPlayingUpdate {
  station: string
  nowPlaying: AzuraCastNowPlaying
  timestamp: number
}

/**
 * AzuraCast Real-Time SSE Client
 * Connects to AzuraCast's Server-Sent Events endpoint for instant updates
 */
export class AzuraCastRealtimeClient {
  private eventSource: EventSource | null = null
  private status: ConnectionStatus = 'disconnected'
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private readonly reconnectDelays = [1000, 2000, 5000, 10000, 30000] // Exponential backoff
  private reconnectTimeout: NodeJS.Timeout | null = null
  private options: AzuraCastRealtimeOptions

  constructor(options: AzuraCastRealtimeOptions) {
    this.options = options
  }

  /**
   * Connect to AzuraCast SSE endpoint
   */
  public connect(): void {
    if (this.eventSource) {
      console.log('[AzuraCastRealtime] Already connected or connecting')
      return
    }

    // Check if EventSource is supported
    if (typeof EventSource === 'undefined') {
      console.error('[AzuraCastRealtime] EventSource not supported')
      this.setStatus('error')
      this.options.onError?.(new Error('EventSource not supported in this browser'))
      return
    }

    try {
      console.log('[AzuraCastRealtime] Connecting to SSE...')
      this.setStatus('connecting')

      // Use local proxy endpoint to avoid CORS issues
      // The Next.js API route will forward SSE events from AzuraCast
      const sseUrl = `/api/sse/nowplaying`

      console.log('[AzuraCastRealtime] SSE URL:', sseUrl)

      this.eventSource = new EventSource(sseUrl)

      // Connection opened
      this.eventSource.onopen = () => {
        console.log('[AzuraCastRealtime] SSE connection established')
        this.setStatus('connected')
        this.reconnectAttempts = 0 // Reset on successful connection
      }

      // Message received
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('[AzuraCastRealtime] Failed to parse message:', error)
        }
      }

      // Error occurred
      this.eventSource.onerror = (event) => {
        console.error('[AzuraCastRealtime] SSE connection error')

        // EventSource automatically tries to reconnect
        // We track errors but let browser handle basic reconnection
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          this.setStatus('error')

          console.log('[AzuraCastRealtime] Connection closed - attempting reconnect')
          this.options.onError?.(new Error('SSE connection closed'))

          // Schedule a reconnect attempt
          this.scheduleReconnect()
        }
      }

      // Listen for specific events if AzuraCast sends them
      this.eventSource.addEventListener('nowplaying', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('[AzuraCastRealtime] Failed to parse nowplaying event:', error)
        }
      })

    } catch (error) {
      console.error('[AzuraCastRealtime] Failed to create EventSource:', error)
      this.setStatus('error')
      this.options.onError?.(error instanceof Error ? error : new Error('Unknown connection error'))
      this.scheduleReconnect()
    }
  }

  /**
   * Disconnect from SSE endpoint
   */
  public disconnect(): void {
    console.log('[AzuraCastRealtime] Disconnecting...')

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    this.setStatus('disconnected')
    this.reconnectAttempts = 0
  }

  /**
   * Get current connection status
   */
  public getStatus(): ConnectionStatus {
    return this.status
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: any): void {
    try {
      // AzuraCast SSE message format may vary
      // Check for different possible structures
      let nowPlayingData: AzuraCastNowPlaying | null = null

      if (data.np) {
        // Centrifugo format: { channel: "...", data: { np: {...} } }
        nowPlayingData = data.np
      } else if (data.data?.np) {
        nowPlayingData = data.data.np
      } else if (data.station) {
        // Direct format
        nowPlayingData = data
      }

      if (nowPlayingData) {
        console.log('[AzuraCastRealtime] Received now playing update')
        this.options.onUpdate(nowPlayingData)
      } else {
        console.warn('[AzuraCastRealtime] Unknown message format:', data)
      }
    } catch (error) {
      console.error('[AzuraCastRealtime] Error handling message:', error)
    }
  }

  /**
   * Handle connection error and schedule reconnection
   */
  private handleConnectionError(): void {
    console.log('[AzuraCastRealtime] Connection error detected')
    this.setStatus('error')
    this.scheduleReconnect()
  }

  /**
   * Schedule reconnection attempt with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[AzuraCastRealtime] Max reconnection attempts reached')
      return
    }

    const delay = this.reconnectDelays[Math.min(this.reconnectAttempts, this.reconnectDelays.length - 1)]
    console.log(`[AzuraCastRealtime] Scheduling reconnect attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts} in ${delay}ms`)

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++
      this.disconnect()
      this.connect()
    }, delay)
  }

  /**
   * Update connection status and notify listeners
   */
  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status
      console.log(`[AzuraCastRealtime] Status changed: ${status}`)
      this.options.onStatusChange?.(status)
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.status === 'connected' && this.eventSource !== null
  }

  /**
   * Manual reconnect (called by user action)
   */
  public reconnect(): void {
    console.log('[AzuraCastRealtime] Manual reconnect requested')
    this.reconnectAttempts = 0
    this.disconnect()
    this.connect()
  }
}
