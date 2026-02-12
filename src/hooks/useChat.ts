/**
 * useChat Hook
 * Manages chat state, sending messages, and real-time subscriptions
 */

'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRealtimeBroadcast } from './useSupabaseRealtime'
import { useAuth } from './useAuth'
import DOMPurify from 'isomorphic-dompurify'

export interface ChatMessage {
  id: string
  user_id: string | null
  content: string
  created_at: string
  anonymous_user?: {
    username: string
    avatar_url?: string | null
    is_anonymous: boolean
  } | null
  profiles?: {
    username: string
    avatar_url: string | null
    is_anonymous: boolean
  } | null
  // For optimistic updates
  _optimistic?: boolean
  _error?: boolean
}

export interface TypingUser {
  userId: string
  username: string
  timestamp: number
}

const MAX_MESSAGE_LENGTH = 500
const TYPING_TIMEOUT = 3000 // 3 seconds

/**
 * Hook for managing chat functionality
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isSending, setIsSending] = useState(false)

  const { profile } = useAuth()
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load initial messages
  useEffect(() => {
    const supabase = getSupabaseClient()
    let mounted = true

    async function loadMessages() {
      try {
        if (!mounted) return

        setLoading(true)
        console.log('[Chat] Starting message load...')
        console.log('[Chat] Profile:', profile)

        // Skip the connectivity test and just load messages directly
        console.log('[Chat] Fetching messages from database...')

        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(100)

        if (!mounted) {
          console.log('[Chat] Component unmounted, ignoring result')
          return
        }

        if (fetchError) {
          console.error('[Chat] Error loading messages:', fetchError)
          console.error('[Chat] Error details:', JSON.stringify(fetchError, null, 2))
          throw new Error(`Error al cargar mensajes: ${fetchError.message}`)
        }

        console.log('[Chat] ✓ Loaded messages:', data)
        console.log('[Chat] Message count:', data?.length || 0)

        setMessages(data || [])
        setError(null)
      } catch (err) {
        console.error('[Chat] Caught error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar mensajes'
        if (mounted) {
          setMessages([])
          setError(errorMessage)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadMessages()

    return () => {
      mounted = false
    }
  }, [])

  // Memoize callback for new messages to prevent re-subscriptions
  const handleNewMessage = useCallback((newMessage: ChatMessage) => {
    console.log('[Chat] Received broadcast message:', newMessage)

    // Don't add our own messages (we already added optimistically)
    // For anonymous users, compare by username since they don't have stable IDs
    const isOwnMessage = profile?.is_anonymous
      ? newMessage.anonymous_user?.username === profile?.username
      : newMessage.user_id === profile?.id

    if (isOwnMessage) {
      console.log('[Chat] Ignoring own broadcast message')
      return
    }

    // Add new message from other users
    setMessages((prev) => [...prev, newMessage])
  }, [profile?.id, profile?.username, profile?.is_anonymous])

  // Memoize callback for typing indicators
  const handleTyping = useCallback((payload: TypingUser) => {
    // Don't show our own typing indicator
    if (payload.userId === profile?.id) return

    setTypingUsers((prev) => {
      const filtered = prev.filter((u) => u.userId !== payload.userId)
      return [...filtered, payload]
    })

    // Remove typing indicator after timeout
    setTimeout(() => {
      setTypingUsers((prev) =>
        prev.filter((u) => u.userId !== payload.userId)
      )
    }, TYPING_TIMEOUT)
  }, [profile?.id])

  // Memoize subscription arrays to prevent re-subscriptions
  const messageSubscriptions = useMemo(() => [
    {
      event: 'new-message',
      callback: handleNewMessage,
    },
  ], [handleNewMessage])

  const typingSubscriptions = useMemo(() => [
    {
      event: 'typing',
      callback: handleTyping,
    },
  ], [handleTyping])

  // Subscribe to new messages via broadcast (works on free tier!)
  // We use broadcast instead of postgres_changes because it doesn't require replication
  const { broadcast: broadcastMessage } = useRealtimeBroadcast<ChatMessage>(
    'chat-room',
    messageSubscriptions
  )

  // Subscribe to typing indicators
  const { broadcast: broadcastTyping } = useRealtimeBroadcast<TypingUser>(
    'chat-typing',
    typingSubscriptions
  )

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (content: string) => {
      const supabase = getSupabaseClient()

      if (!profile) {
        setError('Debes iniciar sesión para enviar mensajes')
        return false
      }

      // Sanitize content
      const sanitized = DOMPurify.sanitize(content.trim(), {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      })

      if (!sanitized || sanitized.length === 0) {
        setError('El mensaje no puede estar vacío')
        return false
      }

      if (sanitized.length > MAX_MESSAGE_LENGTH) {
        setError(`Mensaje demasiado largo (máximo ${MAX_MESSAGE_LENGTH} caracteres)`)
        return false
      }

      try {
        setIsSending(true)
        setError(null)

        // Create optimistic message
        const optimisticMessage: ChatMessage = {
          id: `optimistic-${Date.now()}`,
          user_id: profile.is_anonymous ? null : profile.id,
          content: sanitized,
          created_at: new Date().toISOString(),
          anonymous_user: profile.is_anonymous ? {
            username: profile.username,
            avatar_url: profile.avatar_url,
            is_anonymous: true,
          } : undefined,
          profiles: !profile.is_anonymous ? {
            username: profile.username,
            avatar_url: profile.avatar_url,
            is_anonymous: false,
          } : undefined,
          _optimistic: true,
        }

        // Add optimistically
        setMessages((prev) => [...prev, optimisticMessage])

        // Send to database
        const messageData = profile.is_anonymous ? {
          user_id: null,
          content: sanitized,
          anonymous_user: {
            username: profile.username,
            avatar_url: profile.avatar_url,
            is_anonymous: true,
          },
        } : {
          user_id: profile.id,
          content: sanitized,
        }

        const { data: insertedData, error: insertError } = await supabase
          .from('messages')
          .insert([messageData] as any)
          .select()
          .single()

        if (insertError || !insertedData) {
          // Mark optimistic message as error
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === optimisticMessage.id ? { ...msg, _error: true } : msg
            )
          )
          throw insertError || new Error('Error al insertar mensaje')
        }

        // Broadcast to all connected clients (including ourselves, but we'll ignore it)
        const messageToShare: ChatMessage = {
          id: (insertedData as any).id,
          user_id: (insertedData as any).user_id,
          content: (insertedData as any).content,
          created_at: (insertedData as any).created_at,
          anonymous_user: (insertedData as any).anonymous_user,
          profiles: (insertedData as any).profiles,
        }

        console.log('[Chat] Broadcasting message to other clients:', messageToShare)
        await broadcastMessage('new-message', messageToShare)

        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id ? messageToShare : msg
          )
        )

        return true
      } catch (err) {
        console.error('Error sending message:', err)
        setError('Error al enviar mensaje')
        return false
      } finally {
        setIsSending(false)
      }
    },
    [profile, broadcastMessage]
  )

  /**
   * Broadcast typing indicator
   */
  const sendTypingIndicator = useCallback(() => {
    if (!profile) return

    // Debounce typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      broadcastTyping('typing', {
        userId: profile.id,
        username: profile.username,
        timestamp: Date.now(),
      })
    }, 300)
  }, [profile, broadcastTyping])

  /**
   * Retry failed message
   */
  const retryMessage = useCallback(
    async (messageId: string) => {
      const failedMsg = messages.find((m) => m.id === messageId && m._error)
      if (!failedMsg) return

      // Remove failed message
      setMessages((prev) => prev.filter((m) => m.id !== messageId))

      // Try sending again
      await sendMessage(failedMsg.content)
    },
    [messages, sendMessage]
  )

  return {
    messages,
    loading,
    error,
    isSending,
    typingUsers: typingUsers.filter(
      (u) => Date.now() - u.timestamp < TYPING_TIMEOUT
    ),
    sendMessage,
    sendTypingIndicator,
    retryMessage,
  }
}
