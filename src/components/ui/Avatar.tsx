/**
 * Avatar Component
 * User avatar with fallback to initials
 */

import { forwardRef, type HTMLAttributes } from 'react'
import Image from 'next/image'
import { cn, getInitials } from '@/lib/utils'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** Image source URL */
  src?: string | null
  /** Alt text for image */
  alt?: string
  /** Name for fallback initials */
  name?: string
  /** Size of avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Show verified badge */
  verified?: boolean
}

const sizeStyles = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
}

const badgeSizes = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt = 'Avatar',
      name = 'User',
      size = 'md',
      verified = false,
      ...props
    },
    ref
  ) => {
    const initials = getInitials(name)

    return (
      <div ref={ref} className={cn('relative inline-block', className)} {...props}>
        <div
          className={cn(
            'rounded-full overflow-hidden',
            'bg-accent-purple/20 border-2 border-accent-purple/40',
            'flex items-center justify-center',
            'font-display font-black',
            sizeStyles[size]
          )}
        >
          {src ? (
            <Image
              src={src}
              alt={alt}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="gradient-text">{initials}</span>
          )}
        </div>

        {verified && (
          <div
            className={cn(
              'absolute bottom-0 right-0',
              'bg-accent-blue rounded-full',
              'border-2 border-background-dark',
              'flex items-center justify-center',
              badgeSizes[size]
            )}
            title="Verified User"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="w-full h-full p-0.5 text-background-dark"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'
