/**
 * Toast Component
 * Glassmorphic toast notifications
 */

'use client'

import { Toaster, toast as hotToast, type Toast as HotToast } from 'react-hot-toast'

/**
 * Toast Provider Component
 * Add this to your root layout
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          fontWeight: '600',
        },
        success: {
          iconTheme: {
            primary: '#00d4ff',
            secondary: '#0a0a0f',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#0a0a0f',
          },
        },
      }}
    />
  )
}

/**
 * Toast notification helpers
 */
export const toast = {
  success: (message: string) => {
    hotToast.success(message, {
      style: {
        border: '1px solid #00d4ff',
      },
    })
  },

  error: (message: string) => {
    hotToast.error(message, {
      style: {
        border: '1px solid #ef4444',
      },
    })
  },

  loading: (message: string) => {
    return hotToast.loading(message)
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return hotToast.promise(promise, messages, {
      success: {
        style: {
          border: '1px solid #00d4ff',
        },
      },
      error: {
        style: {
          border: '1px solid #ef4444',
        },
      },
    })
  },

  dismiss: (toastId?: string) => {
    hotToast.dismiss(toastId)
  },

  custom: (message: string) => {
    hotToast(message)
  },
}
