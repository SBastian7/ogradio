/**
 * AddRequestModal Component
 * Modal for submitting new song requests
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Music, User, Plus } from 'lucide-react'
import { Button } from '@/components/ui'
import { fadeInVariants, scaleInVariants } from '@/lib/animations'

export interface AddRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (songName: string, artist: string) => Promise<boolean>
  isSubmitting: boolean
}

export function AddRequestModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: AddRequestModalProps) {
  const [songName, setSongName] = useState('')
  const [artist, setArtist] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!songName.trim() || !artist.trim()) {
      setError('Both song name and artist are required')
      return
    }

    const success = await onSubmit(songName, artist)
    if (success) {
      setSongName('')
      setArtist('')
      onClose()
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setSongName('')
      setArtist('')
      setError(null)
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
              className="w-full max-w-md bg-dark-900/95 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative px-6 py-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h2 className="font-display font-black text-xl">
                    REQUEST A SONG
                  </h2>
                </div>

                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="absolute top-5 right-6 p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Song Name Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="song-name"
                    className="block text-sm font-bold text-white/70 uppercase tracking-wide"
                  >
                    Song Name
                  </label>
                  <div className="relative">
                    <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      id="song-name"
                      type="text"
                      value={songName}
                      onChange={(e) => setSongName(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Enter song title"
                      maxLength={100}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl
                        text-white placeholder:text-white/30
                        focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20
                        disabled:opacity-50 transition-all"
                    />
                  </div>
                  <p className="text-xs text-white/40">
                    {songName.length}/100
                  </p>
                </div>

                {/* Artist Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="artist"
                    className="block text-sm font-bold text-white/70 uppercase tracking-wide"
                  >
                    Artist
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      id="artist"
                      type="text"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Enter artist name"
                      maxLength={100}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl
                        text-white placeholder:text-white/30
                        focus:outline-none focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20
                        disabled:opacity-50 transition-all"
                    />
                  </div>
                  <p className="text-xs text-white/40">
                    {artist.length}/100
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    variants={fadeInVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || !songName.trim() || !artist.trim()}
                  className="w-full"
                >
                  {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
                </Button>

                <p className="text-xs text-center text-white/40">
                  Your request will be added to the queue
                </p>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
