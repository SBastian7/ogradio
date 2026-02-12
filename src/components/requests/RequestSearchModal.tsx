/**
 * RequestSearchModal Component
 * Modal for searching and selecting songs from AzuraCast library
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Music, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { useRequestSearch } from '@/hooks/useRequestSearch'
import { fadeInVariants, scaleInVariants, staggerContainer } from '@/lib/animations'
import { cn } from '@/lib/utils'
import { getAlbumArtUrl } from '@/lib/azuracast/client'
import type { AzuraCastRequestableTrack } from '@/lib/azuracast/requests'

export interface RequestSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (track: AzuraCastRequestableTrack) => Promise<boolean>
  isSubmitting?: boolean
}

/**
 * Search result item component
 */
function SearchResultItem({
  track,
  onSelect,
  isSubmitting,
}: {
  track: AzuraCastRequestableTrack
  onSelect: () => void
  isSubmitting: boolean
}) {
  const albumArt = getAlbumArtUrl(track.song)

  return (
    <motion.div
      variants={fadeInVariants}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
    >
      {/* Album Art */}
      <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-accent-purple/20 border border-accent-purple/40">
        {albumArt ? (
          <Image
            src={albumArt}
            alt={`${track.track.title} portada`}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-6 h-6 text-accent-purple" />
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate text-white">
          {track.track.title}
        </p>
        <p className="text-xs text-white/60 truncate">
          {track.track.artist}
        </p>
        {track.track.album && (
          <p className="text-xs text-white/40 truncate">
            {track.track.album}
          </p>
        )}
      </div>

      {/* Select Button */}
      <Button
        size="sm"
        variant="primary"
        onClick={onSelect}
        disabled={isSubmitting}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        PEDIR
      </Button>
    </motion.div>
  )
}

export function RequestSearchModal({
  isOpen,
  onClose,
  onSelect,
  isSubmitting = false,
}: RequestSearchModalProps) {
  const [searchInput, setSearchInput] = useState('')
  const { results, loading, error, search, clear } = useRequestSearch()

  // Clear on close
  useEffect(() => {
    if (!isOpen) {
      setSearchInput('')
      clear()
    }
  }, [isOpen, clear])

  // Trigger search when input changes
  useEffect(() => {
    search(searchInput)
  }, [searchInput, search])

  const handleSelect = async (track: AzuraCastRequestableTrack) => {
    const success = await onSelect(track)
    if (success) {
      setSearchInput('')
      clear()
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setSearchInput('')
      clear()
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              variants={scaleInVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-dark-900/95 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative px-6 py-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <h2 className="font-display font-black text-xl">
                    BUSCAR CANCIONES
                  </h2>
                </div>

                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="absolute top-5 right-6 p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input */}
              <div className="p-6 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Busca canciones disponibles..."
                    autoFocus
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl
                      text-white placeholder:text-white/30
                      focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20
                      disabled:opacity-50 transition-all"
                  />
                  {loading && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 animate-spin" />
                  )}
                </div>
                <p className="text-xs text-white/40 mt-2">
                  Busca por título de canción, artista o álbum
                </p>
              </div>

              {/* Results */}
              <div
                className="max-h-[400px] overflow-y-auto p-6"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
                }}
              >
                {/* Empty State (no search yet) */}
                {!searchInput && !loading && results.length === 0 && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-3">
                      <div className="flex justify-center">
                        <div className="p-4 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-2xl">
                          <Search className="w-12 h-12 text-white/30" />
                        </div>
                      </div>
                      <div>
                        <p className="text-white/50 text-sm font-bold">
                          Comienza a buscar
                        </p>
                        <p className="text-white/30 text-xs mt-1">
                          Escribe el nombre de una canción o artista
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Results */}
                {searchInput && !loading && results.length === 0 && !error && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-3">
                      <div className="flex justify-center">
                        <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl">
                          <AlertCircle className="w-12 h-12 text-yellow-400/70" />
                        </div>
                      </div>
                      <div>
                        <p className="text-white/50 text-sm font-bold">
                          No se encontraron resultados
                        </p>
                        <p className="text-white/30 text-xs mt-1">
                          Intenta con otros términos de búsqueda
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 max-w-md">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <div>
                        <p className="text-red-400 text-sm font-bold">{error}</p>
                        <p className="text-red-400/70 text-xs mt-1">
                          Por favor intenta de nuevo
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Results List */}
                {results.length > 0 && (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-1"
                  >
                    {results.map((track) => (
                      <SearchResultItem
                        key={track.request_id}
                        track={track}
                        onSelect={() => handleSelect(track)}
                        isSubmitting={isSubmitting}
                      />
                    ))}
                  </motion.div>
                )}

                {/* Result Count */}
                {results.length > 0 && (
                  <p className="text-xs text-center text-white/40 mt-4">
                    {results.length} canción{results.length !== 1 ? 'es' : ''} encontrada{results.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
