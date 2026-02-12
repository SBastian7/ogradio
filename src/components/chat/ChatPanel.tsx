/**
 * ChatPanel Component
 * Main chat container with glassmorphic styling
 */

'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { GlassPanel } from '@/components/ui'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import { useChat } from '@/hooks/useChat'
import { cn } from '@/lib/utils'
import { fadeInVariants } from '@/lib/animations'

export interface ChatPanelProps {
  className?: string
}

export function ChatPanel({ className }: ChatPanelProps) {
  const {
    messages,
    loading,
    error,
    isSending,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
    retryMessage,
  } = useChat()

  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className={cn('flex flex-col h-full', className)}
    >
      <GlassPanel className="flex flex-col h-full" padding="none">
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b border-white/10">
          <MessageCircle className="w-5 h-5 text-accent-blue" />
          <h2 className="font-display font-black text-lg">Chat en Vivo</h2>
          {messages.length > 0 && (
            <span className="ml-auto text-xs text-white/50">
              {messages.length} mensaje{messages.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            loading={loading}
            error={error}
            onRetry={retryMessage}
          />
        </div>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2 border-t border-white/5">
            <TypingIndicator users={typingUsers} />
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t border-white/10">
          <MessageInput
            onSend={sendMessage}
            onTyping={sendTypingIndicator}
            disabled={isSending}
          />
        </div>
      </GlassPanel>
    </motion.div>
  )
}
