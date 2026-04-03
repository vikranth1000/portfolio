'use client'
import { useEffect, useRef } from 'react'
import { useAttractor } from './AttractorProvider'
import { mix, type EngineState } from '@/lib/attractor-engine'

const WARMUP      = 500
const BASE_BATCH  = 4000
const ENERGY_BATCH = 3000
const FADE        = 0.35
const POINT_OPACITY = 0.40
const BOUND_LERP  = 0.008
const SAMPLE      = 5000
const GRAVITY_FALLOFF = 200 // px — radius of gravitational influence

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engine = useAttractor()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current!
    const lifecycle = { active: false }

    function start() {
      lifecycle.active = false

      const dpr = window.devicePixelRatio || 1
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (!w || !h) return
      canvas.width = w * dpr
      canvas.height = h * dpr

      const ctx = canvas.getContext('2d')!
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, w, h)

      // Init iteration state from current engine params
      const initState = engine.getState()
      let x = 0.1, y = 0.1

      // Warmup — converge onto attractor
      for (let i = 0; i < WARMUP; i++) {
        const nx = Math.sin(initState.a * y) + initState.c * Math.cos(initState.a * x)
        const ny = Math.sin(initState.b * x) + initState.d * Math.cos(initState.b * y)
        x = nx; y = ny
      }

      // Initial bounding box
      let bMinX = Infinity, bMaxX = -Infinity
      let bMinY = Infinity, bMaxY = -Infinity
      let sx = x, sy = y
      for (let i = 0; i < SAMPLE; i++) {
        const nx = Math.sin(initState.a * sy) + initState.c * Math.cos(initState.a * sx)
        const ny = Math.sin(initState.b * sx) + initState.d * Math.cos(initState.b * sy)
        sx = nx; sy = ny
        if (sx < bMinX) bMinX = sx; if (sx > bMaxX) bMaxX = sx
        if (sy < bMinY) bMinY = sy; if (sy > bMaxY) bMaxY = sy
      }

      lifecycle.active = true

      // Update orb's gravitational attractor point in normalized screen coords
      // The orb is at bottom-6 left-6 (24px from edges), center of 48px button
      engine.setAttractorPoint(48 / w, (h - 48) / h)

      // ── Frame callback — called by the engine on every rAF ──
      const onFrame = (state: EngineState) => {
        if (!lifecycle.active) return

        const { a, b, c, d, energy } = state
        const batch = Math.round(BASE_BATCH + energy * ENERGY_BATCH)

        // Gravitational bias target in screen pixels
        const grav = engine.attractorPoint
        const gravX = grav.x * w
        const gravY = grav.y * h
        const gravStrength = 1.0 + energy * 0.5

        // Fade existing pixels
        ctx.globalCompositeOperation = 'destination-in'
        const fadeFactor = FADE - energy * 0.15
        ctx.globalAlpha = 1 - Math.max(0.05, fadeFactor)
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, w, h)
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1

        // Scale & center from smooth bounds
        const attrW = bMaxX - bMinX || 1
        const attrH = bMaxY - bMinY || 1
        const scale = Math.min(w * 0.55, h * 0.80) / Math.max(attrW, attrH)
        const acx = (bMinX + bMaxX) / 2
        const acy = (bMinY + bMaxY) / 2
        const cx = w * 0.65 - acx * scale
        const cy = h * 0.50 - acy * scale

        // Left text zone fade
        const fadeStart = w * 0.30
        const fadeFull  = w * 0.55
        const fadeRange = fadeFull - fadeStart

        // Track frame bounds
        let fMinX = Infinity, fMaxX = -Infinity
        let fMinY = Infinity, fMaxY = -Infinity

        for (let i = 0; i < batch; i++) {
          const nx = Math.sin(a * y) + c * Math.cos(a * x)
          const ny = Math.sin(b * x) + d * Math.cos(b * y)
          x = nx; y = ny

          if (Math.abs(x) > 10 || Math.abs(y) > 10) { x = 0.1; y = 0.1; continue }

          if (x < fMinX) fMinX = x; if (x > fMaxX) fMaxX = x
          if (y < fMinY) fMinY = y; if (y > fMaxY) fMaxY = y

          const px = (x * scale + cx) | 0
          const py = (y * scale + cy) | 0

          // Skip dots in text zone
          if (px < fadeStart) continue

          // Gravitational brightness bias — particles near the orb glow brighter
          const gdx = px - gravX
          const gdy = py - gravY
          const gDist = Math.sqrt(gdx * gdx + gdy * gdy)
          const gravBoost = 1 + gravStrength * 0.5 / (1 + (gDist / GRAVITY_FALLOFF) * (gDist / GRAVITY_FALLOFF))

          const baseAlpha = POINT_OPACITY * (1 + energy * 0.5)
          let alpha = baseAlpha * gravBoost

          // Left zone fade
          if (px < fadeFull) {
            alpha *= (px - fadeStart) / fadeRange
          }

          ctx.globalAlpha = Math.min(1, alpha)
          ctx.fillStyle = '#fff'
          // Particles near the orb render slightly larger
          const size = gravBoost > 1.15 ? 1.5 : 1
          ctx.fillRect(px, py, size, size)
        }

        ctx.globalAlpha = 1

        // Smooth bounds for next frame
        if (fMinX < fMaxX) {
          bMinX = mix(bMinX, fMinX, BOUND_LERP)
          bMaxX = mix(bMaxX, fMaxX, BOUND_LERP)
          bMinY = mix(bMinY, fMinY, BOUND_LERP)
          bMaxY = mix(bMaxY, fMaxY, BOUND_LERP)
        }

        // Opaque background behind everything
        ctx.globalCompositeOperation = 'destination-over'
        ctx.fillStyle = '#090909'
        ctx.fillRect(0, 0, w, h)
        ctx.globalCompositeOperation = 'source-over'
      }

      engine.subscribe(onFrame)

      return () => {
        lifecycle.active = false
        engine.unsubscribe(onFrame)
      }
    }

    const cleanup = start()
    const ro = new ResizeObserver(() => {
      cleanup?.()
      start()
    })
    ro.observe(canvas)

    return () => {
      lifecycle.active = false
      cleanup?.()
      ro.disconnect()
    }
  }, [engine])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
