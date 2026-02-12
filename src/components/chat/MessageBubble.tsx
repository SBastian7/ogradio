/**
 * MessageBubble Component
 * Individual chat message with glassmorphic styling
 */

'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Clock, RefreshCw } from 'lucide-react'
import { Avatar, Badge } from '@/components/ui'
import { ChatMessage } from '@/hooks/useChat'
import { useAuth } from '@/hooks/useAuth'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface MessageBubbleProps {
  message: ChatMessage
  onRetry: (messageId: string) => void
}

// Generate consistent color for username
function getUsernameColor(username: string): string {
  const colors = [
    'text-blue-400',
    'text-purple-400',
    'text-pink-400',
    'text-green-400',
    'text-yellow-400',
    'text-orange-400',
    'text-cyan-400',
    'text-indigo-400',
  ]

  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

// Memoized component for performance optimization
export const MessageBubble = memo(function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const { profile } = useAuth()

  // Check if this is our own message
  const isOwnMessage = profile?.is_anonymous
    ? message.anonymous_user?.username === profile?.username
    : profile?.id === message.user_id

  // Get username from either anonymous_user or profiles
  const username = message.anonymous_user?.username ||
                   message.profiles?.username ||
                   (isOwnMessage ? profile?.username : null) ||
                   (message.user_id ? `Listener_${message.user_id.slice(0, 4)}` : 'Anonymous')

  const isAnonymous = message.anonymous_user?.is_anonymous ??
                      message.profiles?.is_anonymous ??
                      true

  const avatarUrl = message.anonymous_user?.avatar_url ?? message.profiles?.avatar_url
  const usernameColor = getUsernameColor(username)

  return (
    <motion.div
      className={cn(
        'flex gap-3 group',
        message._optimistic && 'opacity-60',
        message._error && 'opacity-40'
      )}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar
          name={username}
          src={avatarUrl}
          verified={!isAnonymous}
          size="md"
        />
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'font-bold text-sm truncate',
              usernameColor,
              isOwnMessage && 'text-accent-blue'
            )}
          >
            {username}
          </span>

          {!isAnonymous && (
            <Badge variant="verified" size="sm">
              Verificado
            </Badge>
          )}

          {isAnonymous && (
            <Badge variant="default" size="sm">
              Anónimo
            </Badge>
          )}

          <span className="text-xs text-white/40">
            {message._optimistic ? (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Enviando...
              </span>
            ) : (
              formatRelativeTime(message.created_at)
            )}
          </span>
        </div>

        {/* Message Body */}
        <div
          className={cn(
            'px-4 py-2 rounded-lg',
            'bg-white/5 backdrop-blur-sm',
            'border border-white/10',
            'break-words',
            isOwnMessage && 'bg-accent-blue/10 border-accent-blue/20',
            message._error && 'border-red-500/30 bg-red-500/5'
          )}
        >
          <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>

          {/* Error State */}
          {message._error && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">Error al enviar</span>
              <button
                onClick={() => onRetry(message.id)}
                className="ml-auto text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Reintentar
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
})  // End of MessageBubble component, wrapped in memo for performance
