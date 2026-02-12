/**
 * GlassPanel Component
 * Reusable glassmorphic container with backdrop blur
 */

import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string
  /** Apply hover effects */
  hoverable?: boolean
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  /** Children elements */
  children?: React.ReactNode
}

const paddingVariants = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, hoverable = false, padding = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass-panel',
          paddingVariants[padding],
          hoverable && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassPanel.displayName = 'GlassPanel'
