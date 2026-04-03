'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useAttractor } from './AttractorProvider'
import type { EngineState } from '@/lib/attractor-engine'

const ORB_SIZE      = 48
const CANVAS_SCALE  = 2  // retina
const BASE_POINTS   = 300
const ENERGY_POINTS = 400
const WARMUP        = 200
const FADE          = 0.30
const BASE_ALPHA    = 0.40
const PROXIMITY_RANGE = 150 // px — energy injection range

interface AttractorOrbProps {
  open: boolean
  onToggle: () => void
}

export default function AttractorOrb({ open, onToggle }: AttractorOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const engine = useAttractor()
  const prefersReducedMotion = useReducedMotion()

  // Track mouse proximity and inject energy
  const handleWindowMouseMove = useCallback((e: MouseEvent) => {
    if (open) return
    const btn = buttonRef.current
    if (!btn) return

    const rect = btn.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < PROXIMITY_RANGE) {
      const proximity = 1 - dist / PROXIMITY_RANGE
      engine.injectEnergy(0.15 * proximity * 0.016) // per-frame amount (~60fps)
      engine.setMouseInfluence(
        dx / PROXIMITY_RANGE,
        dy / PROXIMITY_RANGE,
        proximity,
      )
    } else {
      engine.setMouseInfluence(0, 0, 0)
    }
  }, [engine, open])

  useEffect(() => {
    window.addEventListener('mousemove', handleWindowMouseMove)
    return () => window.removeEventListener('mousemove', handleWindowMouseMove)
  }, [handleWindowMouseMove])

  // Canvas rendering — subscribes to the shared engine
  useEffect(() => {
    if (open || prefersReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const size = ORB_SIZE * CANVAS_SCALE
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    // Local iteration state
    const initState = engine.getState()
    let x = 0.1, y = 0.1
    for (let i = 0; i < WARMUP; i++) {
      const nx = Math.sin(initState.a * y) + initState.c * Math.cos(initState.a * x)
      const ny = Math.sin(initState.b * x) + initState.d * Math.cos(initState.b * y)
      x = nx; y = ny
    }

    const onFrame = (state: EngineState) => {
      const { a, b, c, d, energy } = state
      const batch = Math.round(BASE_POINTS + energy * ENERGY_POINTS)
      const r = size / 2

      // Fade
      ctx.globalCompositeOperation = 'destination-in'
      ctx.globalAlpha = 1 - FADE
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, size, size)
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1

      // Circular clip
      ctx.save()
      ctx.beginPath()
      ctx.arc(r, r, r - 1, 0, Math.PI * 2)
      ctx.clip()

      // Render points
      const alpha = BASE_ALPHA * (1 + energy * 0.5)
      ctx.fillStyle = `rgba(34, 197, 94, ${Math.min(1, alpha)})`

      for (let i = 0; i < batch; i++) {
        const nx = Math.sin(a * y) + c * Math.cos(a * x)
        const ny = Math.sin(b * x) + d * Math.cos(b * y)
        x = nx; y = ny

        if (Math.abs(x) > 10 || Math.abs(y) > 10) { x = 0.1; y = 0.1; continue }

        // Map attractor coords to canvas (centered, scaled to fit)
        const px = r + x * (r * 0.7)
        const py = r + y * (r * 0.7)
        ctx.fillRect(px, py, CANVAS_SCALE, CANVAS_SCALE)
      }

      ctx.restore()

      // Background fill (inside circle only via composite)
      ctx.globalCompositeOperation = 'destination-over'
      ctx.beginPath()
      ctx.arc(r, r, r - 1, 0, Math.PI * 2)
      ctx.fillStyle = '#0f0f0f'
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
    }

    engine.subscribe(onFrame)
    return () => engine.unsubscribe(onFrame)
  }, [engine, open, prefersReducedMotion])

  // Reduced motion: render single static frame
  useEffect(() => {
    if (!prefersReducedMotion || open) return
    const canvas = canvasRef.current
    if (!canvas) return

    const size = ORB_SIZE * CANVAS_SCALE
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const r = size / 2

    const state = engine.getState()
    let x = 0.1, y = 0.1
    for (let i = 0; i < WARMUP; i++) {
      const nx = Math.sin(state.a * y) + state.c * Math.cos(state.a * x)
      const ny = Math.sin(state.b * x) + state.d * Math.cos(state.b * y)
      x = nx; y = ny
    }

    ctx.beginPath()
    ctx.arc(r, r, r - 1, 0, Math.PI * 2)
    ctx.fillStyle = '#0f0f0f'
    ctx.fill()

    ctx.save()
    ctx.beginPath()
    ctx.arc(r, r, r - 1, 0, Math.PI * 2)
    ctx.clip()
    ctx.fillStyle = 'rgba(34, 197, 94, 0.35)'
    for (let i = 0; i < 500; i++) {
      const nx = Math.sin(state.a * y) + state.c * Math.cos(state.a * x)
      const ny = Math.sin(state.b * x) + state.d * Math.cos(state.b * y)
      x = nx; y = ny
      ctx.fillRect(r + x * r * 0.7, r + y * r * 0.7, CANVAS_SCALE, CANVAS_SCALE)
    }
    ctx.restore()
  }, [engine, prefersReducedMotion, open])

  return (
    <motion.button
      ref={buttonRef}
      onClick={onToggle}
      aria-label={open ? 'Close chat' : 'Open AI chat'}
      className="fixed bottom-6 left-6 z-[9980] flex items-center justify-center rounded-full border border-border-default hover:border-border-hover transition-colors overflow-hidden"
      style={{ width: ORB_SIZE, height: ORB_SIZE }}
      animate={prefersReducedMotion ? {} : { y: [0, -3, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.05 }}
    >
      {open ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary">
          <path d="M1 1l10 10M11 1L1 11"/>
        </svg>
      ) : (
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: ORB_SIZE, height: ORB_SIZE }}
        />
      )}
    </motion.button>
  )
}
