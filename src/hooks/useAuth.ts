/**
 * useAuth Hook
 * Authentication state management with anonymous user support
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getOrCreateProfile, generateAnonymousUsername } from '@/lib/db/profiles'
import type { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAnonymous: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAnonymous: true,
  })

  const supabase = getSupabaseClient()

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    async function initAuth() {
      // Skip Supabase auth entirely - just use anonymous users
      const savedUserId = localStorage.getItem('anonymous_user_id')
      const savedUsername = localStorage.getItem('anonymous_username')

      if (savedUserId && savedUsername && mounted) {
        // Restore existing anonymous session
        setState({
          user: null,
          profile: {
            id: savedUserId,
            username: savedUsername,
            avatar_url: null,
            is_anonymous: true,
            created_at: new Date().toISOString(),
          },
          loading: false,
          isAnonymous: true,
        })
      } else {
        // Create new anonymous user
        const anonymousId = crypto.randomUUID()
        const anonymousUsername = generateAnonymousUsername()
        localStorage.setItem('anonymous_user_id', anonymousId)
        localStorage.setItem('anonymous_username', anonymousUsername)

        if (mounted) {
          setState({
            user: null,
            profile: {
              id: anonymousId,
              username: anonymousUsername,
              avatar_url: null,
              is_anonymous: true,
              created_at: new Date().toISOString(),
            },
            loading: false,
            isAnonymous: true,
          })
        }
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (session?.user) {
          const profile = await getOrCreateProfile(supabase, session.user.id)
          setState({
            user: session.user,
            profile,
            loading: false,
            isAnonymous: false,
          })
        } else {
          // User signed out - revert to client-side anonymous user
          const anonymousId = crypto.randomUUID()
          const anonymousUsername = generateAnonymousUsername()
          localStorage.setItem('anonymous_user_id', anonymousId)
          localStorage.setItem('anonymous_username', anonymousUsername)

          setState({
            user: null,
            profile: {
              id: anonymousId,
              username: anonymousUsername,
              avatar_url: null,
              is_anonymous: true,
              created_at: new Date().toISOString(),
            },
            loading: false,
            isAnonymous: true,
          })
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  // Sign in with OAuth provider
  const signInWithOAuth = useCallback(async (provider: 'google' | 'discord' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }
  }, [supabase])

  // Sign out
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    // State will be updated by onAuthStateChange
  }, [supabase])

  // Update username
  const updateUsername = useCallback(async (newUsername: string) => {
    if (!state.profile) return

    if (state.isAnonymous) {
      // Update localStorage for anonymous user
      localStorage.setItem('anonymous_username', newUsername)
      setState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, username: newUsername } : null,
      }))
    } else {
      // Update Supabase for authenticated user
      const { updateProfile } = await import('@/lib/db/profiles')
      const updated = await updateProfile(supabase, state.profile.id, {
        username: newUsername,
      })
      setState(prev => ({ ...prev, profile: updated }))
    }
  }, [state.profile, state.isAnonymous, supabase])

  return {
    ...state,
    signInWithOAuth,
    signOut,
    updateUsername,
  }
}
