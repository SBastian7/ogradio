/**
 * NowPlaying Component
 * Displays current track information with album art
 */

'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Music, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui'

export interface NowPlayingProps {
  track?: string
  artist?: string
  albumArt?: string | null
  isLive?: boolean
  isPlaying?: boolean
  className?: string
}

export function NowPlaying({
  track = 'OG Club Radio',
  artist = 'Live Stream',
  albumArt,
  isLive = false,
  isPlaying = false,
  className,
}: NowPlayingProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Album Art */}
      <motion.div
        className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-accent-purple/20 border-2 border-accent-purple/40"
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={
          isPlaying
            ? {
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }
            : { duration: 0.3 }
        }
      >
        {albumArt ? (
          <Image
            src={albumArt}
            alt={`${track} album art`}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isLive ? (
              <Radio className="w-10 h-10 text-accent-blue" />
            ) : (
              <Music className="w-10 h-10 text-accent-purple" />
            )}
          </div>
        )}

        {/* Playing indicator */}
        {isPlaying && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-1">
            <div className="flex gap-0.5">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-accent-blue rounded-full"
                  animate={{
                    height: ['4px', '12px', '4px'],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display font-black text-lg truncate">
            {track}
          </h3>
          {isLive && (
            <Badge variant="playing" size="sm" dot>
              LIVE
            </Badge>
          )}
        </div>
        <p className="text-white/70 text-sm truncate">{artist}</p>
        <p className="text-white/50 text-xs mt-1">
          {isPlaying ? 'Now Playing' : 'Paused'}
        </p>
      </div>
    </div>
  )
}
