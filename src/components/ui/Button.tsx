/**
 * Button Component
 * Brutalist-styled button with glass effects
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Full width button */
  fullWidth?: boolean
  /** Loading state */
  loading?: boolean
  /** Children elements */
  children?: React.ReactNode
}

const variantStyles = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          (disabled || loading) && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner />
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Loading spinner component
function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
