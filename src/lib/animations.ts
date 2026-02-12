/**
 * Framer Motion Animation Variants
 * Reusable animation configurations
 */

import type { Variants, Transition } from 'framer-motion'

/**
 * Default transition settings
 */
export const transitions = {
  spring: {
    type: 'spring',
    stiffness: 260,
    damping: 20,
  } as Transition,

  smooth: {
    type: 'tween',
    duration: 0.3,
    ease: 'easeInOut',
  } as Transition,

  fast: {
    type: 'tween',
    duration: 0.15,
    ease: 'easeOut',
  } as Transition,

  slow: {
    type: 'tween',
    duration: 0.6,
    ease: 'easeInOut',
  } as Transition,
}

/**
 * Fade animations
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export const fadeInVariants: Variants = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: 'easeOut' },
  },
}

/**
 * Slide animations
 */
export const slideUpVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: { y: -20, opacity: 0 },
}

export const slideDownVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: { y: 20, opacity: 0 },
}

export const slideLeftVariants: Variants = {
  hidden: { x: 20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: { x: -20, opacity: 0 },
}

export const slideRightVariants: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: { x: 20, opacity: 0 },
}

/**
 * Scale animations
 */
export const scaleVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: transitions.spring,
  },
  exit: { scale: 0.8, opacity: 0 },
}

// Alias for modal animations
export const scaleInVariants = scaleVariants

export const popVariants: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: transitions.spring,
  },
  exit: { scale: 0 },
}

/**
 * Stagger animations for lists
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.smooth,
  },
}

/**
 * Chat message animations
 */
export const messageVariants: Variants = {
  hidden: { y: 10, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
}

/**
 * Button press animation
 */
export const buttonPressVariants: Variants = {
  rest: { scale: 1 },
  pressed: { scale: 0.95 },
  hover: { scale: 1.05 },
}

/**
 * Modal/Dialog animations
 */
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export const modalContentVariants: Variants = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: { scale: 0.95, opacity: 0, y: 20 },
}

/**
 * Upvote animation
 */
export const upvoteVariants: Variants = {
  rest: { scale: 1 },
  liked: {
    scale: [1, 1.3, 1],
    transition: { duration: 0.3 },
  },
  hover: { scale: 1.1 },
}

/**
 * Number flip animation (for vote counts)
 */
export const numberFlipVariants: Variants = {
  enter: {
    y: -20,
    opacity: 0,
  },
  center: {
    y: 0,
    opacity: 1,
  },
  exit: {
    y: 20,
    opacity: 0,
  },
}

/**
 * Layout animations (for reordering lists)
 */
export const layoutTransition: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 25,
}

/**
 * Typing indicator animation
 */
export const typingDotVariants: Variants = {
  start: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

/**
 * Rotation animations
 */
export const rotateVariants: Variants = {
  start: {
    rotate: 360,
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

/**
 * Glow pulse animation
 */
export const glowPulseVariants: Variants = {
  start: {
    boxShadow: [
      '0 0 20px rgba(0, 212, 255, 0.3)',
      '0 0 40px rgba(0, 212, 255, 0.6)',
      '0 0 20px rgba(0, 212, 255, 0.3)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}
