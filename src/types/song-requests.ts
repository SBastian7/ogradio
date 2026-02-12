/**
 * Song Request Types
 * TypeScript definitions for the song request system
 */

export type RequestStatus = 'pending' | 'playing' | 'played'

export interface SongRequest {
  id: string
  user_id: string | null
  song_name: string
  artist: string
  status: RequestStatus
  created_at: string
  played_at: string | null
  anonymous_user?: {
    username: string
    avatar_url?: string | null
    is_anonymous: boolean
  } | null
  vote_count?: number
  // AzuraCast integration fields
  azuracast_request_id?: string | null // Links to AzuraCast queue
  azuracast_track_id?: string | null // Media library ID
  is_legacy?: boolean // True for old manual requests
  // For client-side tracking
  _optimistic?: boolean
  _error?: boolean
}

export interface Upvote {
  id: string
  request_id: string
  user_id: string | null
  created_at: string
  anonymous_user?: {
    username: string
    avatar_url?: string | null
    is_anonymous: boolean
  } | null
}

export interface SongRequestWithVotes extends SongRequest {
  vote_count: number
  hasUserVoted?: boolean
}
