/**
 * useSongRequests Hook
 * Manages song request state, voting, and real-time subscriptions
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRealtimeBroadcast } from './useSupabaseRealtime'
import { useAuth } from '@/contexts/AuthContext'
import { SongRequest, SongRequestWithVotes, RequestStatus } from '@/types/song-requests'
import DOMPurify from 'isomorphic-dompurify'

const MAX_SONG_NAME_LENGTH = 100
const MAX_ARTIST_LENGTH = 100

/**
 * Hook for managing song requests and upvotes
 */
export function useSongRequests() {
  const [requests, setRequests] = useState<SongRequestWithVotes[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set())

  const { profile } = useAuth()

  // Load initial requests and user votes
  useEffect(() => {
    const supabase = getSupabaseClient()
    let mounted = true

    async function loadRequests() {
      try {
        if (!mounted) return

        setLoading(true)
        console.log('[SongRequests] Loading requests...')

        // Load active requests (pending and playing) from the last 15 minutes
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

        const { data: requestsData, error: requestsError } = await supabase
          .from('song_requests')
          .select('*')
          .in('status', ['pending', 'playing'])
          .gte('created_at', fifteenMinutesAgo)
          .order('created_at', { ascending: true })

        if (requestsError) throw requestsError

        // Load vote counts for each request
        const { data: votesData, error: votesError } = await supabase
          .from('upvotes')
          .select('request_id, user_id, anonymous_user')

        if (votesError) throw votesError

        // Calculate vote counts and check if user has voted
        const voteCounts = new Map<string, number>()
        const userVotedSet = new Set<string>()

        votesData?.forEach((vote: any) => {
          const count = voteCounts.get(vote.request_id) || 0
          voteCounts.set(vote.request_id, count + 1)

          // Check if current user voted
          if (profile) {
            if (profile.is_anonymous) {
              if (vote.anonymous_user?.username === profile.username) {
                userVotedSet.add(vote.request_id)
              }
            } else {
              if (vote.user_id === profile.id) {
                userVotedSet.add(vote.request_id)
              }
            }
          }
        })

        // Combine requests with vote counts
        const requestsWithVotes: SongRequestWithVotes[] = (requestsData || []).map((req: any) => ({
          ...req,
          vote_count: voteCounts.get(req.id) || 0,
          hasUserVoted: userVotedSet.has(req.id),
        }))

        // Sort by vote count (desc), then by created_at (asc)
        requestsWithVotes.sort((a, b) => {
          if (b.vote_count !== a.vote_count) {
            return b.vote_count - a.vote_count
          }
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        })

        console.log('[SongRequests] Loaded', requestsWithVotes.length, 'requests')
        setRequests(requestsWithVotes)
        setUserVotes(userVotedSet)
        setError(null)
      } catch (err) {
        console.error('[SongRequests] Error loading:', err)
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar solicitudes'
        if (mounted) {
          setError(errorMessage)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadRequests()

    return () => {
      mounted = false
    }
  }, [profile])

  // Memoize callbacks for broadcast events
  const handleNewRequest = useCallback((newRequest: SongRequest) => {
    console.log('[SongRequests] Received broadcast new request:', newRequest)

    setRequests((prev) => {
      // Check if we already have this request (from optimistic update)
      if (prev.some((r) => r.id === newRequest.id)) {
        return prev.map((r) =>
          r.id === newRequest.id
            ? { ...newRequest, vote_count: r.vote_count, hasUserVoted: r.hasUserVoted }
            : r
        )
      }

      // Add new request with 0 votes
      const requestWithVotes: SongRequestWithVotes = {
        ...newRequest,
        vote_count: 0,
        hasUserVoted: false,
      }

      return sortRequests([...prev, requestWithVotes])
    })
  }, [])

  const handleVoteChange = useCallback((data: { requestId: string; voteCount: number }) => {
    console.log('[SongRequests] Received broadcast vote change:', data)

    setRequests((prev) =>
      sortRequests(
        prev.map((r) =>
          r.id === data.requestId ? { ...r, vote_count: data.voteCount } : r
        )
      )
    )
  }, [])

  const handleStatusChange = useCallback((data: { requestId: string; status: RequestStatus }) => {
    console.log('[SongRequests] Received broadcast status change:', data)

    setRequests((prev) => {
      // If status is 'played', remove from list
      if (data.status === 'played') {
        return prev.filter((r) => r.id !== data.requestId)
      }

      // Update status
      return prev.map((r) =>
        r.id === data.requestId ? { ...r, status: data.status } : r
      )
    })
  }, [])

  // Memoize subscription arrays
  const requestSubscriptions = useMemo(
    () => [
      {
        event: 'new-request',
        callback: handleNewRequest,
      },
      {
        event: 'vote-change',
        callback: handleVoteChange,
      },
      {
        event: 'status-change',
        callback: handleStatusChange,
      },
    ],
    [handleNewRequest, handleVoteChange, handleStatusChange]
  )

  // Subscribe to request updates via broadcast
  const { broadcast } = useRealtimeBroadcast<any>(
    'song-requests',
    requestSubscriptions
  )

  /**
   * Add a new song request
   */
  const addRequest = useCallback(
    async (songName: string, artist: string) => {
      const supabase = getSupabaseClient()

      if (!profile) {
        setError('Debes iniciar sesión para solicitar canciones')
        return false
      }

      // Sanitize and validate
      const sanitizedSong = DOMPurify.sanitize(songName.trim(), {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      })
      const sanitizedArtist = DOMPurify.sanitize(artist.trim(), {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      })

      if (!sanitizedSong || !sanitizedArtist) {
        setError('El nombre de la canción y el artista son requeridos')
        return false
      }

      if (sanitizedSong.length > MAX_SONG_NAME_LENGTH) {
        setError(`Nombre de canción demasiado largo (máximo ${MAX_SONG_NAME_LENGTH} caracteres)`)
        return false
      }

      if (sanitizedArtist.length > MAX_ARTIST_LENGTH) {
        setError(`Nombre de artista demasiado largo (máximo ${MAX_ARTIST_LENGTH} caracteres)`)
        return false
      }

      try {
        setIsSubmitting(true)
        setError(null)

        // Create optimistic request
        const optimisticRequest: SongRequestWithVotes = {
          id: `optimistic-${Date.now()}`,
          user_id: profile.is_anonymous ? null : profile.id,
          song_name: sanitizedSong,
          artist: sanitizedArtist,
          status: 'pending',
          created_at: new Date().toISOString(),
          played_at: null,
          anonymous_user: profile.is_anonymous ? {
            username: profile.username,
            avatar_url: profile.avatar_url,
            is_anonymous: true,
          } : undefined,
          vote_count: 0,
          hasUserVoted: false,
          _optimistic: true,
        }

        // Add optimistically
        setRequests((prev) => sortRequests([...prev, optimisticRequest]))

        // Insert to database
        const requestData = profile.is_anonymous ? {
          user_id: null,
          song_name: sanitizedSong,
          artist: sanitizedArtist,
          status: 'pending' as RequestStatus,
          anonymous_user: {
            username: profile.username,
            avatar_url: profile.avatar_url,
            is_anonymous: true,
          },
        } : {
          user_id: profile.id,
          song_name: sanitizedSong,
          artist: sanitizedArtist,
          status: 'pending' as RequestStatus,
        }

        const { data: insertedData, error: insertError } = await supabase
          .from('song_requests')
          .insert([requestData] as any)
          .select()
          .single()

        if (insertError || !insertedData) {
          // Mark optimistic request as error
          setRequests((prev) =>
            prev.map((r) =>
              r.id === optimisticRequest.id ? { ...r, _error: true } : r
            )
          )
          throw insertError || new Error('Failed to insert request')
        }

        // Broadcast to all clients
        await broadcast('new-request', insertedData)

        // Replace optimistic with real
        setRequests((prev) =>
          sortRequests(
            prev.map((r) =>
              r.id === optimisticRequest.id
                ? { ...(insertedData as any), vote_count: 0, hasUserVoted: false }
                : r
            )
          )
        )

        return true
      } catch (err) {
        console.error('[SongRequests] Error adding request:', err)
        setError('Error al agregar solicitud')
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [profile, broadcast]
  )

  /**
   * Toggle upvote on a request
   */
  const toggleVote = useCallback(
    async (requestId: string) => {
      const supabase = getSupabaseClient()

      if (!profile) {
        setError('Debes iniciar sesión para votar')
        return false
      }

      const isVoted = userVotes.has(requestId)

      try {
        // Optimistic update
        setRequests((prev) =>
          sortRequests(
            prev.map((r) =>
              r.id === requestId
                ? {
                    ...r,
                    vote_count: isVoted ? r.vote_count - 1 : r.vote_count + 1,
                    hasUserVoted: !isVoted,
                  }
                : r
            )
          )
        )

        setUserVotes((prev) => {
          const newSet = new Set(prev)
          if (isVoted) {
            newSet.delete(requestId)
          } else {
            newSet.add(requestId)
          }
          return newSet
        })

        if (isVoted) {
          // Remove vote
          const { error: deleteError } = await supabase
            .from('upvotes')
            .delete()
            .eq('request_id', requestId)
            .eq(
              profile.is_anonymous ? 'anonymous_user->>username' : 'user_id',
              profile.is_anonymous ? profile.username : profile.id
            )

          if (deleteError) throw deleteError
        } else {
          // Add vote
          const voteData = profile.is_anonymous ? {
            request_id: requestId,
            user_id: null,
            anonymous_user: {
              username: profile.username,
              avatar_url: profile.avatar_url,
              is_anonymous: true,
            },
          } : {
            request_id: requestId,
            user_id: profile.id,
          }

          const { error: insertError } = await supabase
            .from('upvotes')
            .insert([voteData] as any)

          if (insertError) throw insertError
        }

        // Get updated vote count
        const { count } = await supabase
          .from('upvotes')
          .select('*', { count: 'exact', head: true })
          .eq('request_id', requestId)

        // Broadcast vote change
        await broadcast('vote-change', {
          requestId,
          voteCount: count || 0,
        })

        return true
      } catch (err) {
        console.error('[SongRequests] Error toggling vote:', err)

        // Rollback optimistic update
        setRequests((prev) =>
          sortRequests(
            prev.map((r) =>
              r.id === requestId
                ? {
                    ...r,
                    vote_count: isVoted ? r.vote_count + 1 : r.vote_count - 1,
                    hasUserVoted: isVoted,
                  }
                : r
            )
          )
        )

        setUserVotes((prev) => {
          const newSet = new Set(prev)
          if (isVoted) {
            newSet.add(requestId)
          } else {
            newSet.delete(requestId)
          }
          return newSet
        })

        setError('Error al actualizar voto')
        return false
      }
    },
    [profile, userVotes, broadcast]
  )

  return {
    requests,
    loading,
    error,
    isSubmitting,
    addRequest,
    toggleVote,
  }
}

/**
 * Helper function to sort requests by vote count and created_at
 */
function sortRequests(requests: SongRequestWithVotes[]): SongRequestWithVotes[] {
  return [...requests].sort((a, b) => {
    // Playing status always first
    if (a.status === 'playing' && b.status !== 'playing') return -1
    if (b.status === 'playing' && a.status !== 'playing') return 1

    // Then sort by vote count (desc)
    if (b.vote_count !== a.vote_count) {
      return b.vote_count - a.vote_count
    }

    // Then by created_at (asc - older requests first if votes are equal)
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
}
