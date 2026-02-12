/**
 * SongRequestQueue Component
 * Main container for the song request queue with add button
 */

'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { ListMusic, Plus, Loader2, AlertCircle } from 'lucide-react'
import { GlassPanel, Button } from '@/components/ui'
import { RequestItem } from './RequestItem'
import { useSongRequests } from '@/hooks/useSongRequests'
import { fadeInVariants, staggerContainer } from '@/lib/animations'

// Code splitting - lazy load modal
const AddRequestModal = dynamic(() => import('./AddRequestModal').then(mod => ({ default: mod.AddRequestModal })), {
  ssr: false,
})

export interface SongRequestQueueProps {
  className?: string
}

export function SongRequestQueue({ className }: SongRequestQueueProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [votingRequestId, setVotingRequestId] = useState<string | null>(null)

  const {
    requests,
    loading,
    error,
    isSubmitting,
    addRequest,
    toggleVote,
  } = useSongRequests()

  const handleVote = async (requestId: string) => {
    setVotingRequestId(requestId)
    await toggleVote(requestId)
    setVotingRequestId(null)
  }

  const handleAddRequest = async (songName: string, artist: string) => {
    const success = await addRequest(songName, artist)
    return success
  }

  return (
    <>
      <motion.div
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
        className={className}
      >
        <GlassPanel className="flex flex-col h-full" padding="none">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-accent-purple" />
              <h2 className="font-display font-black text-lg">SONG QUEUE</h2>
              {requests.length > 0 && (
                <span className="ml-2 text-xs text-white/50">
                  {requests.length} request{requests.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              REQUEST
            </Button>
          </div>

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto p-4" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
          }}>
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-3 text-white/50">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading queue...</span>
                </div>
              </div>
            )}

            {!loading && error && (
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
            )}

            {!loading && !error && requests.length === 0 && (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="p-4 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-2xl">
                      <ListMusic className="w-12 h-12 text-white/30" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm font-bold">No requests yet</p>
                    <p className="text-white/30 text-xs mt-1">
                      Be the first to request a song!
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Request a Song
                  </Button>
                </div>
              </div>
            )}

            {!loading && !error && requests.length > 0 && (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                <AnimatePresence mode="popLayout">
                  {requests.map((request) => (
                    <RequestItem
                      key={request.id}
                      request={request}
                      onVote={handleVote}
                      isVoting={votingRequestId === request.id}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-4 py-3 border-t border-white/10 bg-white/5">
            <p className="text-xs text-white/40 text-center">
              Vote for your favorite songs • Most voted plays next
            </p>
          </div>
        </GlassPanel>
      </motion.div>

      {/* Add Request Modal */}
      <AddRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddRequest}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
