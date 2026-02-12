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
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-white/5">
        <Users className="w-4 h-4 text-accent-green" />
        <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">
          Conectados
        </h3>
        <Badge variant="default" size="sm" className="ml-auto">
          {count}
        </Badge>
      </div>

      {/* Users List */}
      <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {users.length === 0 ? (
          <div className="p-4 text-center text-sm text-white/40">
            No hay usuarios conectados
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {users.map((user) => (
              <motion.div
                key={user.userId}
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Avatar
                  name={user.username}
                  size="xs"
                  verified={!user.isAnonymous}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.username}
                  </p>
                </div>
                {user.isAnonymous ? (
                  <Badge variant="default" size="sm" className="text-xs">
                    Anónimo
                  </Badge>
                ) : (
                  <Badge variant="verified" size="sm" className="text-xs" dot>
                    Verificado
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
