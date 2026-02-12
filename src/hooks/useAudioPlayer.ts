/**
 * useAudioPlayer Hook
 * Manages HTML5 audio streaming and Web Audio API
 */

'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { toast } from '@/components/ui'

export interface AudioPlayerState {
  isPlaying: boolean
  volume: number
  isMuted: boolean
  isLoading: boolean
  error: string | null
  audioElement: HTMLAudioElement | null
  audioContext: AudioContext | null
  analyser: AnalyserNode | null
}

export function useAudioPlayer(streamUrl: string) {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    volume: 0.7,
    isMuted: false,
    isLoading: false,
    error: null,
    audioElement: null,
    audioContext: null,
    analyser: null,
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)

  // Initialize audio element and Web Audio API
  useEffect(() => {
    // Create audio element
    const audio = new Audio(streamUrl)
    audio.crossOrigin = 'anonymous'
    audio.preload = 'none'
    audioRef.current = audio

    // Load saved volume from localStorage
    const savedVolume = localStorage.getItem('radio_volume')
    if (savedVolume) {
      const vol = parseFloat(savedVolume)
      audio.volume = vol
      setState(prev => ({ ...prev, volume: vol }))
    } else {
      audio.volume = 0.7
    }

    // Create Web Audio API context and analyser
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 128 // 64 frequency bars
      analyser.smoothingTimeConstant = 0.8

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      setState(prev => ({
        ...prev,
        audioElement: audio,
        audioContext,
        analyser,
      }))
    } catch (error) {
      console.error('Web Audio API initialization failed:', error)
      setState(prev => ({
        ...prev,
        audioElement: audio,
      }))
    }

    // Audio event listeners
    const handleCanPlay = () => {
      setState(prev => ({ ...prev, isLoading: false, error: null }))
      reconnectAttempts.current = 0
    }

    const handlePlaying = () => {
      setState(prev => ({ ...prev, isPlaying: true, isLoading: false }))
    }

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }))
    }

    const handleWaiting = () => {
      setState(prev => ({ ...prev, isLoading: true }))
    }

    const handleError = (e: ErrorEvent | Event) => {
      console.error('Audio stream error:', e)
      const errorMessage = 'Stream connection failed'
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false, isPlaying: false }))

      // Auto-reconnect with exponential backoff
      if (reconnectAttempts.current < 5) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++
          if (audioRef.current) {
            audioRef.current.load()
            audioRef.current.play().catch(console.error)
          }
        }, delay)
      } else {
        toast.error('Unable to connect to stream. Please try again later.')
      }
    }

    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('error', handleError as any)

    return () => {
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('error', handleError as any)

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      audio.pause()
      audio.src = ''

      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close()
      }
    }
  }, [streamUrl])

  // Play
  const play = useCallback(async () => {
    if (!audioRef.current) return

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // Resume audio context if suspended (required after user interaction)
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      // Connect audio source to analyser (only once)
      if (
        audioContextRef.current &&
        analyserRef.current &&
        !sourceRef.current
      ) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)
        sourceRef.current.connect(analyserRef.current)
        analyserRef.current.connect(audioContextRef.current.destination)
      }

      await audioRef.current.play()
      toast.success('Connected to OG Club Radio! 🎵')
    } catch (error) {
      console.error('Play error:', error)
      setState(prev => ({ ...prev, error: 'Failed to start playback', isLoading: false }))
      toast.error('Failed to start playback. Please try again.')
    }
  }, [])

  // Pause
  const pause = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
  }, [])

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause()
    } else {
      play()
    }
  }, [state.isPlaying, play, pause])

  // Set volume
  const setVolume = useCallback((vol: number) => {
    const clampedVol = Math.max(0, Math.min(1, vol))
    if (audioRef.current) {
      audioRef.current.volume = clampedVol
      setState(prev => ({ ...prev, volume: clampedVol, isMuted: clampedVol === 0 }))
      localStorage.setItem('radio_volume', clampedVol.toString())
    }
  }, [])

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!audioRef.current) return

    if (state.isMuted) {
      audioRef.current.volume = state.volume
      setState(prev => ({ ...prev, isMuted: false }))
    } else {
      audioRef.current.volume = 0
      setState(prev => ({ ...prev, isMuted: true }))
    }
  }, [state.isMuted, state.volume])

  // Retry connection
  const retry = useCallback(() => {
    if (!audioRef.current) return

    reconnectAttempts.current = 0
    setState(prev => ({ ...prev, error: null, isLoading: true }))
    audioRef.current.load()
    play()
  }, [play])

  return {
    ...state,
    play,
    pause,
    togglePlay,
    setVolume,
    toggleMute,
    retry,
  }
}
