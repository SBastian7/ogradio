/**
 * Visualizer Component
 * Audio frequency visualizer using Web Audio API
 */

'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface VisualizerProps {
  analyser: AnalyserNode | null
  isPlaying: boolean
  enabled?: boolean
  className?: string
  barCount?: number
  barColor?: 'blue' | 'purple' | 'gradient'
}

export function Visualizer({
  analyser,
  isPlaying,
  enabled = true,
  className,
  barCount = 64,
  barColor = 'gradient',
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled || !analyser || !isPlaying) {
      // Stop animation if disabled or not playing
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
        animationIdRef.current = null
      }

      // Clear canvas
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    // Frequency data array
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    // Color gradients
    const createGradient = () => {
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0)

      if (barColor === 'blue') {
        gradient.addColorStop(0, '#00d4ff')
        gradient.addColorStop(1, '#00d4ff')
      } else if (barColor === 'purple') {
        gradient.addColorStop(0, '#b794f6')
        gradient.addColorStop(1, '#b794f6')
      } else {
        gradient.addColorStop(0, '#00d4ff')
        gradient.addColorStop(0.5, '#b794f6')
        gradient.addColorStop(1, '#00d4ff')
      }

      return gradient
    }

    // Animation loop
    const draw = () => {
      if (!isPlaying || !enabled) return

      animationIdRef.current = requestAnimationFrame(draw)

      // Get frequency data
      analyser.getByteFrequencyData(dataArray)

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate bar width
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const barWidth = width / barCount
      const gap = barWidth * 0.2

      // Draw bars
      const gradient = createGradient()
      ctx.fillStyle = gradient

      for (let i = 0; i < barCount; i++) {
        // Sample frequency data (spread across available bins)
        const index = Math.floor((i / barCount) * bufferLength)
        const value = dataArray[index]

        // Normalize to 0-1
        const normalized = value / 255

        // Calculate bar height (min 4px, max canvas height)
        const barHeight = Math.max(4, normalized * height)

        // Calculate x position
        const x = i * barWidth

        // Draw rounded rectangle
        const y = height - barHeight
        const actualBarWidth = barWidth - gap

        ctx.beginPath()
        ctx.roundRect(x, y, actualBarWidth, barHeight, [2, 2, 0, 0])
        ctx.fill()
      }
    }

    // Start animation
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [analyser, isPlaying, enabled, barCount, barColor])

  return (
    <canvas
      ref={canvasRef}
      className={cn('w-full h-full', className)}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
