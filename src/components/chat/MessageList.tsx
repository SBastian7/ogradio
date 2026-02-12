/**
 * MessageList Component
 * Scrollable list of messages with auto-scroll to bottom
 */

'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Loader2 } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { ChatMessage } from '@/hooks/useChat'
import { staggerContainer, fadeInVariants } from '@/lib/animations'

export interface MessageListProps {
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  onRetry: (messageId: string) => void
}

export function MessageList({
  messages,
  loading,
  error,
  onRetry,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isUserScrollingRef = useRef(false)
  const lastMessageCountRef = useRef(messages.length)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!scrollRef.current) return

    const scrollContainer = scrollRef.current
    const isAtBottom =
      scrollContainer.scrollHeight - scrollContainer.scrollTop <=
      scrollContainer.clientHeight + 100

    // Auto-scroll if user is at bottom or new message is from current user
    if (
      !isUserScrollingRef.current ||
      isAtBottom ||
      messages.length > lastMessageCountRef.current
    ) {
      setTimeout(() => {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth',
        })
      }, 100)
    }

    lastMessageCountRef.current = messages.length
  }, [messages])

  // Track user scrolling
  const handleScroll = () => {
    if (!scrollRef.current) return

    const scrollContainer = scrollRef.current
    const isAtBottom =
      scrollContainer.scrollHeight - scrollContainer.scrollTop <=
      scrollContainer.clientHeight + 50

    isUserScrollingRef.current = !isAtBottom
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-white/50">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading messages...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 max-w-md">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-400 text-sm font-bold">{error}</p>
            <p className="text-red-400/70 text-xs mt-1">
              Check your connection and try refreshing
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center space-y-2">
          <p className="text-white/50 text-sm">No messages yet</p>
          <p className="text-white/30 text-xs">
            Be the first to say something!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto p-4 space-y-3 scroll-smooth"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
      }}
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={fadeInVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              layout
            >
              <MessageBubble message={message} onRetry={onRetry} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
