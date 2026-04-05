'use client'
import { useEffect, useRef } from 'react'

/* ── Keyframes: 6 curated (a,b,c,d) configs → visually distinct shapes ── */
const KEYFRAMES: [number, number, number, number][] = [
  [-1.4,   1.6,   1.0,   0.7 ],  // rose / flower
  [-1.7,   1.3,  -0.1,  -1.2 ],  // butterfly
  [-1.8,  -2.0,  -0.5,  -0.9 ],  // spiral nebula
  [ 1.5,  -1.8,   1.6,   0.9 ],  // figure-8
  [-1.2,  -1.9,   1.8,  -1.6 ],  // organic tendrils
  [ 1.1,  -1.3,  -1.6,   1.5 ],  // compact core
]

const BATCH          = 6000    // points per frame
const WARMUP         = 500
const FADE           = 0.35    // very aggressive: stray dots gone in ~8 frames (0.13s)
const POINT_OPACITY  = 0.40    // bright — dense paths glow white, equilibrium = opacity/fade
const HOLD_S         = 12      // seconds at each keyframe
const MORPH_S        = 8       // seconds transitioning between keyframes
const BOUND_LERP     = 0.008   // smooth bounding-box adaptation rate
const NOISE_AMP      = 0.05    // organic drift layered on params
const SAMPLE         = 5000    // initial bounding-box sampling iterations

/* ── Utilities ── */

function noise1D(t: number): number {
  return Math.sin(t * 1.17 + 0.3) * 0.5
       + Math.sin(t * 2.31 + 1.7) * 0.25
       + Math.sin(t * 4.63 + 3.1) * 0.125
}

function ease(t: number): number { return t * t * (3 - 2 * t) }
function mix(a: number, b: number, t: number): number { return a + (b - a) * t }

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current!
    const state = { raf: 0, active: false }

    function start() {
      state.active = false
      cancelAnimationFrame(state.raf)

      const dpr = window.devicePixelRatio || 1
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (!w || !h) return
      canvas.width = w * dpr
      canvas.height = h * dpr

      const ctx = canvas.getContext('2d')!
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, w, h)

      // Init with first keyframe
      const kf = KEYFRAMES[0]
      let a = kf[0], b = kf[1], c = kf[2], d = kf[3]

      // Warmup — converge onto attractor
      let x = 0.1, y = 0.1
      for (let i = 0; i < WARMUP; i++) {
        const nx = Math.sin(a * y) + c * Math.cos(a * x)
        const ny = Math.sin(b * x) + d * Math.cos(b * y)
        x = nx; y = ny
      }

      // Initial bounding box
      let bMinX = Infinity, bMaxX = -Infinity
      let bMinY = Infinity, bMaxY = -Infinity
      let sx = x, sy = y
      for (let i = 0; i < SAMPLE; i++) {
        const nx = Math.sin(a * sy) + c * Math.cos(a * sx)
        const ny = Math.sin(b * sx) + d * Math.cos(b * sy)
        sx = nx; sy = ny
        if (sx < bMinX) bMinX = sx; if (sx > bMaxX) bMaxX = sx
        if (sy < bMinY) bMinY = sy; if (sy > bMaxY) bMaxY = sy
      }

      const t0 = performance.now()
      state.active = true

      function draw(ts: number) {
        if (!state.active) return

        const elapsed = (ts - t0) / 1000
        const cycle = HOLD_S + MORPH_S
        const pos = elapsed % (cycle * KEYFRAMES.length)
        const idx = Math.floor(pos / cycle)
        const phase = pos % cycle

        // Interpolation factor
        let t = 0
        if (phase >= HOLD_S) {
          t = ease((phase - HOLD_S) / MORPH_S)
        }

        // Interpolate params + organic noise
        const from = KEYFRAMES[idx]
        const to = KEYFRAMES[(idx + 1) % KEYFRAMES.length]
        a = mix(from[0], to[0], t) + noise1D(elapsed * 0.3) * NOISE_AMP
        b = mix(from[1], to[1], t) + noise1D(elapsed * 0.3 + 10) * NOISE_AMP
        c = mix(from[2], to[2], t) + noise1D(elapsed * 0.3 + 20) * NOISE_AMP
        d = mix(from[3], to[3], t) + noise1D(elapsed * 0.3 + 30) * NOISE_AMP

        // Fade: multiply all pixel alphas toward zero — no ghosts
        ctx.globalCompositeOperation = 'destination-in'
        ctx.globalAlpha = 1 - FADE
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

        // Draw batch + track frame bounds
        // Skip dots in the left text zone (no gradient needed — no banding possible)
        const fadeStart = w * 0.30   // dots begin to appear here
        const fadeFull  = w * 0.55   // dots at full opacity here
        const fadeRange = fadeFull - fadeStart

        ctx.fillStyle = `rgba(255,255,255,${POINT_OPACITY})`
        let fMinX = Infinity, fMaxX = -Infinity
        let fMinY = Infinity, fMaxY = -Infinity

        for (let i = 0; i < BATCH; i++) {
          const nx = Math.sin(a * y) + c * Math.cos(a * x)
          const ny = Math.sin(b * x) + d * Math.cos(b * y)
          x = nx; y = ny

          if (Math.abs(x) > 10 || Math.abs(y) > 10) { x = 0.1; y = 0.1; continue }

          if (x < fMinX) fMinX = x; if (x > fMaxX) fMaxX = x
          if (y < fMinY) fMinY = y; if (y > fMaxY) fMaxY = y

          const sx = (x * scale + cx) | 0
          const sy = (y * scale + cy) | 0

          // Skip dots in text zone, fade in transition zone
          if (sx < fadeStart) continue
          if (sx < fadeFull) {
            ctx.globalAlpha = (sx - fadeStart) / fadeRange
          }
          ctx.fillRect(sx, sy, 1, 1)
          if (sx < fadeFull) {
            ctx.globalAlpha = 1
          }
        }

        // Smooth bounds for next frame
        if (fMinX < fMaxX) {
          bMinX = mix(bMinX, fMinX, BOUND_LERP)
          bMaxX = mix(bMaxX, fMaxX, BOUND_LERP)
          bMinY = mix(bMinY, fMinY, BOUND_LERP)
          bMaxY = mix(bMaxY, fMaxY, BOUND_LERP)
        }

        // Opaque background behind everything — uniform #090909, no artifacts
        ctx.globalCompositeOperation = 'destination-over'
        ctx.fillStyle = '#090909'
        ctx.fillRect(0, 0, w, h)
        ctx.globalCompositeOperation = 'source-over'

        state.raf = requestAnimationFrame(draw)
      }

      state.raf = requestAnimationFrame(draw)
    }

    // Defer to next frame so the browser has completed layout (canvas has dimensions)
    requestAnimationFrame(start)
    const ro = new ResizeObserver(start)
    ro.observe(canvas)

    return () => {
      state.active = false
      cancelAnimationFrame(state.raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
