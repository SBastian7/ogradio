/**
 * TypingIndicator Component
 * Shows who is currently typing with animated dots
 */

'use client'

import { motion } from 'framer-motion'
import { TypingUser } from '@/hooks/useChat'

export interface TypingIndicatorProps {
  users: TypingUser[]
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null

  // Format user names
  const formatUsers = () => {
    if (users.length === 1) {
      return `${users[0].username} is typing`
    } else if (users.length === 2) {
      return `${users[0].username} and ${users[1].username} are typing`
    } else {
      return `${users[0].username}, ${users[1].username}, and ${
        users.length - 2
      } other${users.length - 2 > 1 ? 's are' : ' is'} typing`
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm text-white/50">
      <span className="text-xs">{formatUsers()}</span>

      {/* Animated Dots */}
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-accent-blue rounded-full"
            animate={{
              y: [0, -4, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}
