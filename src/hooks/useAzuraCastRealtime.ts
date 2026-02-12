/**
 * useAzuraCastRealtime Hook
 * React hook wrapper for AzuraCast SSE connection
 */

'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { AzuraCastRealtimeClient, type ConnectionStatus } from '@/lib/azuracast/realtime'
import type { AzuraCastNowPlaying } from '@/lib/azuracast/client'

const AZURACAST_BASE_URL = process.env.NEXT_PUBLIC_AZURACAST_BASE_URL || 'https://radio.ogclub.info'
const STATION_ID = process.env.NEXT_PUBLIC_AZURACAST_STATION_ID || 'og_club'

export interface UseAzuraCastRealtimeOptions {
  enabled?: boolean // Feature flag support
  onUpdate?: (data: AzuraCastNowPlaying) => void
}

export interface UseAzuraCastRealtimeReturn {
  status: ConnectionStatus
  error: Error | null
  disconnect: () => void
  reconnect: () => void
}

/**
 * Hook for managing AzuraCast SSE real-time connection
 * - Auto-connects on mount if enabled
 * - Handles connection lifecycle
 * - Provides status and error information
 * - Cleanup on unmount
 */
export function useAzuraCastRealtime(
  options: UseAzuraCastRealtimeOptions = {}
): UseAzuraCastRealtimeReturn {
  const { enabled = true, onUpdate } = options

  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<Error | null>(null)

  const clientRef = useRef<AzuraCastRealtimeClient | null>(null)
  const onUpdateRef = useRef(onUpdate)

  // Keep onUpdate ref current
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  /**
   * Handle status change
   */
  const handleStatusChange = useCallback((newStatus: ConnectionStatus) => {
    console.log('[useAzuraCastRealtime] Status changed:', newStatus)
    setStatus(newStatus)

    // Clear error when connected
    if (newStatus === 'connected') {
      setError(null)
    }
  }, [])

  /**
   * Handle error
   */
  const handleError = useCallback((err: Error) => {
    console.error('[useAzuraCastRealtime] Error:', err)
    setError(err)
  }, [])

  /**
   * Handle now playing update
   */
  const handleUpdate = useCallback((data: AzuraCastNowPlaying) => {
    onUpdateRef.current?.(data)
  }, [])

  /**
   * Manual disconnect
   */
  const disconnect = useCallback(() => {
    clientRef.current?.disconnect()
  }, [])

  /**
   * Manual reconnect
   */
  const reconnect = useCallback(() => {
    clientRef.current?.reconnect()
  }, [])

  /**
   * Initialize and manage connection
   */
  useEffect(() => {
    if (!enabled) {
      console.log('[useAzuraCastRealtime] Feature disabled')
      setStatus('disconnected')
      return
    }

    // Check if browser supports EventSource
    if (typeof EventSource === 'undefined') {
      console.warn('[useAzuraCastRealtime] EventSource not supported, will use polling fallback')
      setStatus('error')
      setError(new Error('EventSource not supported'))
      return
    }

    console.log('[useAzuraCastRealtime] Initializing SSE connection...')

    // Create client
    const client = new AzuraCastRealtimeClient({
      stationId: STATION_ID,
      baseUrl: AZURACAST_BASE_URL,
      onUpdate: handleUpdate,
      onStatusChange: handleStatusChange,
      onError: handleError,
    })

    clientRef.current = client

    // Connect
    client.connect()

    // Cleanup on unmount
    return () => {
      console.log('[useAzuraCastRealtime] Cleaning up SSE connection')
      client.disconnect()
      clientRef.current = null
    }
  }, [enabled, handleUpdate, handleStatusChange, handleError])

  /**
   * Handle page visibility changes (pause when hidden)
   */
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[useAzuraCastRealtime] Page hidden, pausing updates')
        // Don't disconnect, just let it idle
      } else {
        console.log('[useAzuraCastRealtime] Page visible, resuming updates')
        // Reconnect if disconnected
        if (clientRef.current?.getStatus() === 'disconnected') {
          clientRef.current?.connect()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled])

  /**
   * Handle network status changes (reconnect when back online)
   */
  useEffect(() => {
    if (!enabled) return

    const handleOnline = () => {
      console.log('[useAzuraCastRealtime] Network back online, reconnecting...')
      clientRef.current?.reconnect()
    }

    const handleOffline = () => {
      console.log('[useAzuraCastRealtime] Network offline')
      setStatus('disconnected')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [enabled])

  return {
    status,
    error,
    disconnect,
    reconnect,
  }
}
