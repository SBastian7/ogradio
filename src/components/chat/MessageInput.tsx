/**
 * MessageInput Component
 * Text input for sending chat messages
 */

'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonPressVariants } from '@/lib/animations'

export interface MessageInputProps {
  onSend: (message: string) => Promise<boolean>
  onTyping?: () => void
  disabled?: boolean
  className?: string
}

const MAX_MESSAGE_LENGTH = 500

// Common emojis
const EMOJIS = [
  '😀',
  '😂',
  '😍',
  '🤔',
  '👍',
  '👎',
  '❤️',
  '🔥',
  '🎵',
  '🎉',
  '👏',
  '🙌',
]

export function MessageInput({
  onSend,
  onTyping,
  disabled = false,
  className,
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = async () => {
    if (!message.trim() || disabled) return

    const success = await onSend(message.trim())

    if (success) {
      setMessage('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }

    // Trigger typing indicator
    if (onTyping) {
      onTyping()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value

    // Limit message length
    if (value.length > MAX_MESSAGE_LENGTH) {
      setMessage(value.slice(0, MAX_MESSAGE_LENGTH))
      return
    }

    setMessage(value)

    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newMessage =
      message.substring(0, start) + emoji + message.substring(end)

    setMessage(newMessage)
    setShowEmojis(false)

    // Focus back and move cursor after emoji
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

  const remainingChars = MAX_MESSAGE_LENGTH - message.length
  const isNearLimit = remainingChars < 50

  return (
    <div className={cn('space-y-2', className)}>
      {/* Input Container */}
      <div className="relative flex items-end gap-2">
        {/* Emoji Picker Button */}
        <motion.button
          variants={buttonPressVariants}
          initial="rest"
          whileHover="hover"
          whileTap="pressed"
          onClick={() => setShowEmojis(!showEmojis)}
          disabled={disabled}
          className={cn(
            'p-2 rounded-lg',
            'bg-white/5 hover:bg-white/10',
            'border border-white/10',
            'transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title="Agregar emoji"
        >
          <Smile className="w-5 h-5 text-white/70" />
        </motion.button>

        {/* Emoji Picker Popup */}
        {showEmojis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              'absolute bottom-full left-0 mb-2',
              'p-3 rounded-lg',
              'bg-background-darker/95 backdrop-blur-md',
              'border border-white/20',
              'shadow-xl',
              'grid grid-cols-6 gap-2',
              'z-10'
            )}
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className={cn(
                  'text-2xl',
                  'w-10 h-10',
                  'flex items-center justify-center',
                  'rounded-lg',
                  'hover:bg-white/10',
                  'transition-colors'
                )}
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Escribe un mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
            className={cn(
              'w-full px-4 py-3 rounded-lg',
              'bg-white/5 backdrop-blur-sm',
              'border border-white/10',
              'text-white placeholder:text-white/40',
              'focus:outline-none focus:border-accent-blue/50',
              'transition-all duration-200',
              'resize-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'min-h-[48px] max-h-[120px]'
            )}
            rows={1}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
            }}
          />
        </div>

        {/* Send Button */}
        <motion.button
          variants={buttonPressVariants}
          initial="rest"
          whileHover="hover"
          whileTap="pressed"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={cn(
            'p-3 rounded-lg',
            'bg-gradient-to-br from-accent-blue to-accent-purple',
            'border-2 border-white/20',
            'shadow-lg shadow-accent-blue/30',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'disabled:shadow-none',
            'hover:shadow-xl hover:shadow-accent-blue/50'
          )}
          title="Enviar mensaje (Enter)"
        >
          <Send className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {/* Character Counter */}
      {isNearLimit && (
        <div className="flex justify-end">
          <span
            className={cn(
              'text-xs tabular-nums',
              remainingChars < 20 ? 'text-red-400' : 'text-white/40'
            )}
          >
            {remainingChars} caracteres restantes
          </span>
        </div>
      )}
    </div>
  )
}
