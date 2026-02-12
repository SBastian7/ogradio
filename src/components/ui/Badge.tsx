/**
 * Badge Component
 * Status indicators and labels
 */

import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Badge variant */
  variant?: 'default' | 'pending' | 'playing' | 'played' | 'skipped' | 'verified'
  /** Badge size */
  size?: 'sm' | 'md' | 'lg'
  /** Show dot indicator */
  dot?: boolean
  /** Children elements */
  children?: React.ReactNode
}

const variantStyles = {
  default: 'bg-glass-bg border-glass-border text-white',
  pending: 'bg-accent-purple/20 border-accent-purple text-accent-purple',
  playing: 'bg-accent-blue/20 border-accent-blue text-accent-blue animate-pulse',
  played: 'bg-green-500/20 border-green-500 text-green-400',
  skipped: 'bg-red-500/20 border-red-500 text-red-400',
  verified: 'bg-accent-blue/20 border-accent-blue text-accent-blue',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'sm',
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5',
          'rounded-full border',
          'font-bold uppercase tracking-wide',
          'transition-all duration-200',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              variant === 'playing' && 'bg-accent-blue animate-pulse',
              variant === 'pending' && 'bg-accent-purple',
              variant === 'played' && 'bg-green-400',
              variant === 'skipped' && 'bg-red-400',
              variant === 'verified' && 'bg-accent-blue',
              variant === 'default' && 'bg-white'
            )}
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
