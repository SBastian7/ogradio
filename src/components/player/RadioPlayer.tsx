/**
 * RadioPlayer Component
 * Main radio streaming player with visualizer
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { GlassPanel, Button } from '@/components/ui'
import { Visualizer } from './Visualizer'
import { NowPlaying } from './NowPlaying'
import { PlayerControls } from './PlayerControls'
import { SongHistory } from './SongHistory'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { useNowPlaying } from '@/hooks/useNowPlaying'
import { cn } from '@/lib/utils'
import { fadeInVariants } from '@/lib/animations'

export interface RadioPlayerProps {
  streamUrl: string
  className?: string
}

export function RadioPlayer({ streamUrl, className }: RadioPlayerProps) {
  const [visualizerEnabled, setVisualizerEnabled] = useState(true)

  const {
    isPlaying,
    volume,
    isMuted,
    isLoading,
    error,
    analyser,
    togglePlay,
    setVolume,
    toggleMute,
    retry,
  } = useAudioPlayer(streamUrl)

  const {
    data: nowPlayingData,
    loading: _nowPlayingLoading,
    error: _nowPlayingError,
    realtimeStatus,
  } = useNowPlaying()

  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className={cn('w-full', className)}
    >
      <GlassPanel className="overflow-hidden" padding="none">
        {/* Visualizer */}
        {
          isPlaying && (
            <div className="relative h-32 bg-gradient-to-b from-background-darker/50 to-transparent">
          <Visualizer
            analyser={analyser}
            isPlaying={isPlaying}
            enabled={visualizerEnabled}
            className="opacity-90"
          />

          {/* Connection Status Badge (top-left) - Only show meaningful states */}
          {realtimeStatus && realtimeStatus !== 'connecting' && (
            <div className="absolute top-2 left-2">
              {realtimeStatus === 'connected' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/40 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-green-100">Live Updates</span>
                </div>
              )}
              {(realtimeStatus === 'disconnected' || realtimeStatus === 'error') && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-500/20 border border-gray-500/40 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span className="text-xs font-bold text-gray-100">Polling Mode</span>
                </div>
              )}
            </div>
          )}

          {/* Visualizer Toggle */}
          <button
            onClick={() => setVisualizerEnabled(!visualizerEnabled)}
            className="absolute top-2 right-2 p-2 rounded-lg bg-black/30 hover:bg-black/50 transition-colors backdrop-blur-sm"
            title={visualizerEnabled ? 'Ocultar visualizador' : 'Mostrar visualizador'}
          >
            {visualizerEnabled ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
        </div>
          )
        }

        {/* Player Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-400 text-sm font-bold">{error}</p>
                <p className="text-red-400/70 text-xs mt-1">
                  Verifica tu conexión e intenta de nuevo
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={retry}
                className="flex-shrink-0"
              >
                Reintentar
              </Button>
            </div>
          )}

          {/* Now Playing */}
          <NowPlaying
            track={nowPlayingData?.track}
            artist={nowPlayingData?.artist}
            albumArt={nowPlayingData?.albumArt}
            isLive={nowPlayingData?.isLive}
            isPlaying={isPlaying}
          />

          {/* Player Controls */}
          <PlayerControls
            isPlaying={isPlaying}
            isLoading={isLoading}
            volume={volume}
            isMuted={isMuted}
            onTogglePlay={togglePlay}
            onVolumeChange={setVolume}
            onToggleMute={toggleMute}
          />

          {/* Song History */}
          <SongHistory />

          {/* Stream Info */}
          <div className="flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/10">
            <span>OG Club Radio • Transmisión en Vivo</span>
            <span className="flex items-center gap-3">
              {nowPlayingData && nowPlayingData.listeners > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full" />
                  {nowPlayingData.listeners} Oyente
                  {nowPlayingData.listeners !== 1 ? 's' : ''}
                </span>
              )}
              {isPlaying && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" />
                  Transmitiendo
                </span>
              )}
            </span>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  )
}
