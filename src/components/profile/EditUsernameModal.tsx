/**
 * EditUsernameModal Component
 * Modal for editing user's username (both anonymous and authenticated users)
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { fadeInVariants, scaleInVariants } from '@/lib/animations'

export interface EditUsernameModalProps {
  isOpen: boolean
  onClose: () => void
  currentUsername: string
}

const MAX_USERNAME_LENGTH = 30
const MIN_USERNAME_LENGTH = 3
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/

export function EditUsernameModal({
  isOpen,
  onClose,
  currentUsername,
}: EditUsernameModalProps) {
  const [username, setUsername] = useState(currentUsername)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { updateUsername, profile, isAnonymous } = useAuth()

  // Sync local state with profile from useAuth (not parent prop which may be stale)
  useEffect(() => {
    if (isOpen && profile) {
      setUsername(profile.username)
      setError(null)
    }
  }, [isOpen, profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedUsername = username.trim()

    // Client-side validation
    if (!trimmedUsername) {
      setError('El nombre de usuario no puede estar vacío')
      return
    }

    if (trimmedUsername === currentUsername) {
      setError('El nuevo nombre debe ser diferente al actual')
      return
    }

    if (!USERNAME_REGEX.test(trimmedUsername)) {
      setError('Nombre inválido. Solo letras, números y guiones bajos (3-30 caracteres)')
      return
    }

    try {
      setIsSubmitting(true)

      // For authenticated users, check username availability
      if (!isAnonymous && profile) {
        const supabase = getSupabaseClient()
        const { isUsernameAvailable } = await import('@/lib/db/profiles')

        const available = await isUsernameAvailable(supabase, trimmedUsername, profile.id)

        if (!available) {
          setError('Este nombre de usuario ya está en uso')
          return
        }
      }

      // Update username using the hook
      await updateUsername(trimmedUsername)

      toast.success('¡Nombre de usuario actualizado!')
      onClose()
    } catch (err) {
      console.error('Error updating username:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el nombre de usuario'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setUsername(currentUsername)
      setError(null)
      onClose()
    }
  }

  const remainingChars = MAX_USERNAME_LENGTH - username.length
  const isNearLimit = remainingChars < 10

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
                    <User className="w-5 h-5" />
                  </div>
                  <h2 className="font-display font-black text-xl">
                    EDITAR NOMBRE DE USUARIO
                  </h2>
                </div>

                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="absolute top-5 right-6 p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Username Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="block text-sm font-bold text-white/70 uppercase tracking-wide"
                  >
                    Nuevo Nombre de Usuario
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Ingresa tu nuevo nombre"
                      maxLength={MAX_USERNAME_LENGTH}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl
                        text-white placeholder:text-white/30
                        focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20
                        disabled:opacity-50 transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/40">
                      Solo letras, números y guiones bajos
                    </p>
                    <p
                      className={`text-xs tabular-nums ${
                        isNearLimit ? 'text-yellow-400' : 'text-white/40'
                      }`}
                    >
                      {username.length}/{MAX_USERNAME_LENGTH}
                    </p>
                  </div>
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

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting || !username.trim() || username === currentUsername}
                    className="flex-1"
                  >
                    {isSubmitting ? 'GUARDANDO...' : 'GUARDAR'}
                  </Button>
                </div>

                <p className="text-xs text-center text-white/40">
                  {isAnonymous
                    ? 'Tu nombre se guardará localmente en este dispositivo'
                    : 'Tu nombre se actualizará en todos tus dispositivos'}
                </p>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
