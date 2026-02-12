/**
 * SongHistory Component
 * Collapsible panel showing recently played songs
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Music, Radio, User, RefreshCw, Clock, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { GlassPanel, Badge } from '@/components/ui'
import { useSongHistory, type SongHistoryItem } from '@/hooks/useSongHistory'
import { fadeInVariants, staggerContainer } from '@/lib/animations'

export interface SongHistoryProps {
  className?: string
  defaultExpanded?: boolean
}

/**
 * Individual history item component
 */
function HistoryItem({ item }: { item: SongHistoryItem }) {
  // Get source icon
  const SourceIcon = item.source === 'live' ? Radio : item.source === 'request' ? User : Music

  return (
    <motion.div
      variants={fadeInVariants}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
    >
      {/* Mini Album Art */}
      <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-accent-purple/20 border border-accent-purple/40">
        {item.albumArt ? (
          <Image
            src={item.albumArt}
            alt={`${item.track} portada`}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <SourceIcon className="w-5 h-5 text-accent-purple" />
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate text-white">
          {item.track}
        </p>
        <p className="text-xs text-white/60 truncate">
          {item.artist}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-center gap-1 text-xs text-white/40">
            <Clock className="w-3 h-3" />
            <span>{item.playedAtFormatted}</span>
          </div>
          {item.source === 'request' && (
            <Badge variant="default" size="sm">
              Pedida
            </Badge>
          )}
          {item.source === 'live' && item.streamerName && (
            <Badge variant="playing" size="sm">
              DJ: {item.streamerName}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Song History Panel Component
 */
export function SongHistory({ className, defaultExpanded = true }: SongHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const { history, loading, error, refresh } = useSongHistory(5)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setIsRefreshing(false)
  }

  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className={cn('w-full', className)}
    >
      <GlassPanel padding="none">
        {/* Header */}
        <div className="w-full flex items-center justify-between p-4 border-b border-white/10">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Ocultar historial de canciones' : 'Mostrar historial de canciones'}
          >
            <Music className="w-5 h-5 text-accent-blue" />
            <h2 className="font-display font-black text-lg">HISTORIAL</h2>
            {!loading && history.length > 0 && (
              <span className="ml-2 text-xs text-white/50">
                ({history.length})
              </span>
            )}

            {/* Expand/Collapse Icon */}
            <span className="ml-auto">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-white/70" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/70" />
              )}
            </span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="ml-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            aria-label="Actualizar historial"
          >
            <RefreshCw
              className={cn(
                'w-4 h-4 text-white/70',
                isRefreshing && 'animate-spin'
              )}
            />
          </button>
        </div>

        {/* Collapsible Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div
                className="max-h-[400px] overflow-y-auto p-4"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
                }}
              >
                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-white/50">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Cargando historial...</span>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {!loading && error && (
                  <div className="flex items-center justify-center py-8 px-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 max-w-md">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <div>
                        <p className="text-red-400 text-sm font-bold">{error}</p>
                        <p className="text-red-400/70 text-xs mt-1">
                          Intenta actualizar de nuevo
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!loading && !error && history.length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-3">
                      <div className="flex justify-center">
                        <div className="p-4 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-2xl">
                          <Music className="w-12 h-12 text-white/30" />
                        </div>
                      </div>
                      <div>
                        <p className="text-white/50 text-sm font-bold">No hay historial disponible</p>
                        <p className="text-white/30 text-xs mt-1">
                          El historial de canciones aparecerá aquí
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* History List */}
                {!loading && !error && history.length > 0 && (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-1"
                  >
                    {history.map((item) => (
                      <HistoryItem key={item.id} item={item} />
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>
    </motion.div>
  )
}
