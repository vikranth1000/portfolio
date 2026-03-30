'use client'
import { useEffect, useRef } from 'react'

// Clifford attractor parameters — produces a dense, flowing rose-like form
const A = -1.4, B = 1.6, C = 1.0, D = 0.7

const WARMUP        = 2000   // steps before we start drawing (gets us onto the attractor)
const SAMPLE_STEPS  = 10000  // steps used to measure the attractor's bounding box
const BATCH_REVEAL  = 8000   // points per frame during reveal — full form emerges in ~330ms
const BATCH_IDLE    = 2000   // points per frame in idle — enough to see the flow clearly
const REVEAL_COUNT  = 160000 // total points in the reveal phase
const POINT_OPACITY = 0.025  // low enough that density creates the gradation naturally
const FADE_ALPHA    = 0.012  // per-frame fade — dense paths glow, sparse paths flicker out over ~5s

// Idle phase: slowly oscillate parameters so the shape morphs and breathes
// Amplitudes ~10–15% of base; non-commensurate periods so it never exactly repeats
const A_AMP = 0.15, A_FREQ = 0.007  // base A = −1.4, cycle ≈ 15s
const B_AMP = 0.12, B_FREQ = 0.005  // base B =  1.6, cycle ≈ 21s
const C_AMP = 0.10, C_FREQ = 0.003  // base C =  1.0, cycle ≈ 35s
const D_AMP = 0.08, D_FREQ = 0.004  // base D =  0.7, cycle ≈ 26s

function step(x: number, y: number) {
  return {
    x: Math.sin(A * y) + C * Math.cos(A * x),
    y: Math.sin(B * x) + D * Math.cos(B * y),
  }
}

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current!
    const state = { raf: 0, active: false }

    function start() {
      state.active = false
      cancelAnimationFrame(state.raf)

      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (!w || !h) return

      canvas.width = w
      canvas.height = h

      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, w, h)

      // Warm up — get onto the attractor before drawing
      let x = 0.1, y = 0.1
      for (let i = 0; i < WARMUP; i++) ({ x, y } = step(x, y))

      // Sample the attractor to find its natural bounding box
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      let sx = x, sy = y
      for (let i = 0; i < SAMPLE_STEPS; i++) {
        ;({ x: sx, y: sy } = step(sx, sy))
        if (sx < minX) minX = sx
        if (sx > maxX) maxX = sx
        if (sy < minY) minY = sy
        if (sy > maxY) maxY = sy
      }

      // Scale to fill roughly the right 65% of the canvas height-wise
      const attrW = maxX - minX
      const attrH = maxY - minY
      const scale = Math.min(w * 0.6, h * 0.88) / Math.max(attrW, attrH)

      // Center the attractor in the right portion — right of the hero text
      const cx = w * 0.65 - ((minX + maxX) / 2) * scale
      const cy = h * 0.50 - ((minY + maxY) / 2) * scale

      let drawn = 0
      let frame = 0
      state.active = true

      function draw() {
        if (!state.active) return

        if (drawn < REVEAL_COUNT) {
          // Reveal phase: accumulate with fixed params — shape snaps in fast and clean
          ctx.fillStyle = `rgba(255,255,255,${POINT_OPACITY})`
          for (let i = 0; i < BATCH_REVEAL; i++) {
            ;({ x, y } = step(x, y))
            ctx.fillRect((x * scale + cx) | 0, (y * scale + cy) | 0, 1, 1)
          }
          drawn += BATCH_REVEAL
        } else {
          // Idle phase: morph parameters each frame + fade trail
          // The attractor shape drifts slowly → paths form, shift, and dissolve
          frame++
          const a = A + A_AMP * Math.sin(frame * A_FREQ)
          const b = B + B_AMP * Math.sin(frame * B_FREQ + 1.2)
          const c = C + C_AMP * Math.sin(frame * C_FREQ + 2.4)
          const d = D + D_AMP * Math.sin(frame * D_FREQ + 3.6)

          ctx.fillStyle = `rgba(9,9,9,${FADE_ALPHA})`
          ctx.fillRect(0, 0, w, h)
          ctx.fillStyle = `rgba(255,255,255,${POINT_OPACITY})`
          for (let i = 0; i < BATCH_IDLE; i++) {
            const nx = Math.sin(a * y) + c * Math.cos(a * x)
            const ny = Math.sin(b * x) + d * Math.cos(b * y)
            x = nx; y = ny
            ctx.fillRect((x * scale + cx) | 0, (y * scale + cy) | 0, 1, 1)
          }
        }

        state.raf = requestAnimationFrame(draw)
      }

      draw()
    }

    start()

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
