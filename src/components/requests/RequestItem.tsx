/**
 * RequestItem Component
 * Individual song request with upvote button and status
 */

'use client'

import { motion } from 'framer-motion'
import { Heart, Music2, Clock, Play } from 'lucide-react'
import { Avatar, Badge } from '@/components/ui'
import { SongRequestWithVotes } from '@/types/song-requests'
import { formatDistanceToNow } from 'date-fns'
import { fadeInVariants } from '@/lib/animations'

export interface RequestItemProps {
  request: SongRequestWithVotes
  onVote: (requestId: string) => void
  isVoting?: boolean
}

export function RequestItem({ request, onVote, isVoting = false }: RequestItemProps) {
  const isPlaying = request.status === 'playing'
  const hasVoted = request.hasUserVoted || false

  const handleVote = () => {
    if (!isVoting) {
      onVote(request.id)
    }
  }

  // Get status info
  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    },
    playing: {
      label: 'Now Playing',
      icon: Play,
      color: 'bg-green-500/10 text-green-400 border-green-500/30',
    },
  }

  const status = statusConfig[request.status as 'pending' | 'playing']

  // Get username
  const username = request.anonymous_user?.username || 'Listener'

  return (
    <motion.div
      layout
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className={`
        group relative p-4 bg-white/5 backdrop-blur-xl border-2 rounded-xl transition-all
        ${isPlaying ? 'border-accent-blue shadow-lg shadow-accent-blue/20' : 'border-white/10'}
        ${request._error ? 'border-red-500/30 bg-red-500/5' : ''}
        ${request._optimistic ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Vote Button */}
        <motion.button
          onClick={handleVote}
          disabled={isVoting}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`
            flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl transition-all
            ${hasVoted
              ? 'bg-gradient-to-br from-pink-500 to-red-500 shadow-lg shadow-pink-500/30'
              : 'bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-pink-500/50'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <Heart
            className={`w-6 h-6 transition-all ${
              hasVoted ? 'fill-current' : ''
            }`}
          />
          <motion.span
            key={request.vote_count}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-sm font-bold"
          >
            {request.vote_count}
          </motion.span>
        </motion.button>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-lg truncate">
                {request.song_name}
              </h3>
              <p className="text-white/60 text-sm truncate">
                {request.artist}
              </p>
            </div>

            {/* Status Badge */}
            {status && (
              <Badge variant={request.status as 'pending' | 'playing' | 'played'} className={status.color}>
                <status.icon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 text-xs text-white/40">
            <div className="flex items-center gap-2">
              <Avatar
                src={request.anonymous_user?.avatar_url}
                alt={username}
                size="xs"
              />
              <span>{username}</span>
            </div>

            <span>•</span>

            <span>
              {formatDistanceToNow(new Date(request.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        {/* Playing Indicator */}
        {isPlaying && (
          <div className="absolute -right-1 -top-1 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-accent-blue to-accent-purple rounded-full shadow-lg">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-2 h-2 bg-white rounded-full"
            />
            <Music2 className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Error State */}
      {request._error && (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">Failed to submit request</p>
        </div>
      )}
    </motion.div>
  )
}
