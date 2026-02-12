'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Badge, toast, GlassPanel } from '@/components/ui'
import { RadioPlayer } from '@/components/player'
import { ChatPanel } from '@/components/chat'
import { SongRequestQueue } from '@/components/requests'
import { Header } from '@/components/layout'

// Code splitting - lazy load modals
const AuthModal = dynamic(() => import('@/components/ui').then(mod => ({ default: mod.AuthModal })), {
  ssr: false,
})

const STREAM_URL = process.env.NEXT_PUBLIC_RADIO_STREAM_URL || 'https://radio.ogclub.info/listen/og_club/radio.mp3'

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { profile, loading, isAnonymous, signInWithOAuth, signOut } = useAuth()

  const handleSignIn = async (provider: 'google' | 'discord' | 'github') => {
    try {
      await signInWithOAuth(provider)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('¡Sesión cerrada exitosamente!')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/70">Cargando...</div>
      </main>
    )
  }

  return (
    <>
      {/* Skip to Content Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]
          px-4 py-2 bg-accent-blue text-white font-bold rounded-lg
          focus:outline-none focus:ring-4 focus:ring-accent-blue/50"
      >
        Saltar al contenido principal
      </a>

      {/* Header */}
      <Header
        onSignInClick={() => setAuthModalOpen(true)}
        isAnonymous={isAnonymous}
        onSignOut={handleSignOut}
      />

      <main id="main-content" className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8 pt-4">

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radio Player - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <RadioPlayer streamUrl={STREAM_URL} />
          </div>

          {/* User Info Sidebar */}
          <div className="space-y-6">
            {/* User Profile */}
            <GlassPanel>
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider">
                  Oyente
                </h2>

                {profile && (
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={profile.username}
                      src={profile.avatar_url}
                      verified={!isAnonymous}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{profile.username}</p>
                      <div className="mt-1">
                        {isAnonymous ? (
                          <Badge variant="default" size="sm">Anónimo</Badge>
                        ) : (
                          <Badge variant="verified" size="sm" dot>Verificado</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isAnonymous ? (
                  <button
                    className="btn-primary w-full text-sm"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    Iniciar Sesión
                  </button>
                ) : (
                  <button
                    className="btn-ghost w-full text-sm"
                    onClick={handleSignOut}
                  >
                    Cerrar Sesión
                  </button>
                )}
              </div>
            </GlassPanel>

            {/* Progress */}
            <GlassPanel>
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider">
                  Espacio para publicidad
                </h2>
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* Chat & Song Requests Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat */}
          <div className="h-[600px]">
            <ChatPanel />
          </div>

          {/* Song Request Queue */}
          <div className="h-[600px]">
            <SongRequestQueue />
          </div>
        </div>

          {/* Info Text */}
          <div className="text-center text-sm text-white/50 pt-8">
            <p>Sebastián Molina @ OG Club 2026</p>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSignIn={handleSignIn}
      />
    </>
  )
}
