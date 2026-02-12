/**
 * OnlineUsersList Component
 * Displays list of currently connected users
 */

'use client'

import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { Avatar, Badge } from '@/components/ui'
import { PresenceUser } from '@/hooks/usePresence'
import { fadeInVariants } from '@/lib/animations'

export interface OnlineUsersListProps {
  users: PresenceUser[]
  count: number
}

export function OnlineUsersList({ users, count }: OnlineUsersListProps) {
  return (
    <div className="border-t border-white/10 bg-white/5">
      {/* Header with counter only */}
      <div className="flex items-center gap-2 p-3">
        <Users className="w-4 h-4 text-accent-green" />
        <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">
          Conectados
        </h3>
        <Badge variant="default" size="sm" className="ml-auto">
          {count}
        </Badge>
      </div>
    </div>
  )
}
