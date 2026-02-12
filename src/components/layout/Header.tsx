/**
 * Header Component
 * Sticky header with logo, listener count, and sign-in button
 */

'use client'

import { motion } from 'framer-motion'
import { Radio, Users } from 'lucide-react'
import { Button } from '@/components/ui'
import { usePresence } from '@/hooks/usePresence'
import { fadeInVariants } from '@/lib/animations'

export interface HeaderProps {
  onSignInClick: () => void
  isAnonymous: boolean
  onSignOut: () => void
}

export function Header({ onSignInClick, isAnonymous, onSignOut }: HeaderProps) {
  const { onlineCount } = usePresence()

  return (
    <motion.header
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-50 backdrop-blur-xl bg-dark-950/80 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl shadow-lg shadow-accent-blue/20">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl gradient-text uppercase tracking-tight">
                OG Club Radio
              </h1>
              <p className="text-xs text-white/50 hidden sm:block">
                Live Streaming Experience
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Listener Count */}
            {onlineCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"
              >
                <Users className="w-4 h-4 text-accent-blue" />
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold">{onlineCount}</span>
                  <span className="text-[10px] text-white/50 uppercase tracking-wide hidden sm:block">
                    Listening
                  </span>
                </div>
              </motion.div>
            )}

            {/* Sign In/Out Button */}
            {isAnonymous ? (
              <Button
                onClick={onSignInClick}
                variant="primary"
                size="sm"
                className="hidden sm:flex"
              >
                Sign In
              </Button>
            ) : (
              <Button
                onClick={onSignOut}
                variant="ghost"
                size="sm"
                className="hidden sm:flex"
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
