/**
 * AuthContext
 * Shared authentication state across all components
 */

'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
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
  _rev?: number
}

interface AuthContextValue extends AuthState {
  signInWithOAuth: (provider: 'google' | 'discord' | 'github') => Promise<void>
  signOut: () => Promise<void>
  updateUsername: (newUsername: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAnonymous: true,
    _rev: 0,
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
          _rev: 0,
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
            _rev: 0,
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
            _rev: 0,
          })
        } else if (event === 'SIGNED_OUT') {
          // Only create new anonymous user when explicitly signing out
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
            _rev: 0,
          })
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, supabase.auth])

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
  }, [supabase])

  // Update username
  const updateUsername = useCallback(async (newUsername: string) => {
    let isAnon = false
    let profileId = ''

    // Use flushSync to ensure state update completes synchronously
    flushSync(() => {
      setState(prev => {
        if (!prev.profile) return prev

        isAnon = prev.isAnonymous
        profileId = prev.profile.id

        if (prev.isAnonymous) {
          // Update localStorage for anonymous user
          localStorage.setItem('anonymous_username', newUsername)

          // Create completely new objects to force React to detect change
          const newProfile = {
            id: prev.profile.id,
            username: newUsername,
            avatar_url: prev.profile.avatar_url,
            is_anonymous: prev.profile.is_anonymous,
            created_at: prev.profile.created_at,
          }

          const newState = {
            user: prev.user,
            profile: newProfile,
            loading: false,
            isAnonymous: prev.isAnonymous,
            _rev: (prev._rev || 0) + 1,
          }

          return newState
        }

        return prev
      })
    })

    // For authenticated users, update in Supabase
    if (!isAnon && profileId) {
      const { updateProfile } = await import('@/lib/db/profiles')
      const updated = await updateProfile(supabase, profileId, {
        username: newUsername,
      })
      flushSync(() => {
        setState(prev => ({ ...prev, profile: updated, _rev: (prev._rev || 0) + 1 }))
      })
    }
  }, [supabase])

  const value: AuthContextValue = {
    ...state,
    signInWithOAuth,
    signOut,
    updateUsername,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
