/**
 * PlayerControls Component
 * Audio player controls (play/pause, volume)
 */

'use client'

import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonPressVariants } from '@/lib/animations'

export interface PlayerControlsProps {
  isPlaying: boolean
  isLoading: boolean
  volume: number
  isMuted: boolean
  onTogglePlay: () => void
  onVolumeChange: (volume: number) => void
  onToggleMute: () => void
  className?: string
}

export function PlayerControls({
  isPlaying,
  isLoading,
  volume,
  isMuted,
  onTogglePlay,
  onVolumeChange,
  onToggleMute,
  className,
}: PlayerControlsProps) {
  return (
    <div className={cn('flex items-center gap-6', className)}>
      {/* Play/Pause Button */}
      <motion.button
        variants={buttonPressVariants}
        initial="rest"
        whileHover="hover"
        whileTap="pressed"
        onClick={onTogglePlay}
        disabled={isLoading}
        className={cn(
          'relative w-16 h-16 rounded-full',
          'bg-gradient-to-br from-accent-blue to-accent-purple',
          'flex items-center justify-center',
          'shadow-lg shadow-accent-blue/50',
          'transition-shadow duration-300',
          'hover:shadow-xl hover:shadow-accent-blue/70',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'border-2 border-white/20'
        )}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isLoading ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-8 h-8 text-white fill-white" />
        ) : (
          <Play className="w-8 h-8 text-white fill-white ml-1" />
        )}

        {/* Glow effect when playing */}
        {isPlaying && !isLoading && (
          <motion.div
            className="absolute inset-0 rounded-full bg-accent-blue/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.button>

      {/* Volume Controls */}
      <div className="flex items-center gap-3 flex-1 max-w-xs">
        {/* Mute Button */}
        <motion.button
          variants={buttonPressVariants}
          initial="rest"
          whileHover="hover"
          whileTap="pressed"
          onClick={onToggleMute}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-6 h-6 text-white/70" />
          ) : (
            <Volume2 className="w-6 h-6 text-white/70" />
          )}
        </motion.button>

        {/* Volume Slider */}
        <div className="relative flex-1 h-2 group">
          {/* Track */}
          <div className="absolute inset-0 bg-white/20 rounded-full overflow-hidden">
            {/* Progress */}
            <motion.div
              className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full relative"
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              layout
            >
              {/* Glow effect */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg shadow-accent-blue/50" />
            </motion.div>
          </div>

          {/* Input */}
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume * 100}
            onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            aria-label="Volume"
          />
        </div>

        {/* Volume Percentage */}
        <span className="text-sm font-bold text-white/50 w-10 text-right tabular-nums">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>
    </div>
  )
}
