'use client'
import { useEffect, useRef } from 'react'

// Clifford attractor parameters — produces a dense, flowing rose-like form
const A = -1.4, B = 1.6, C = 1.0, D = 0.7

const WARMUP        = 2000   // steps before we start drawing (gets us onto the attractor)
const SAMPLE_STEPS  = 10000  // steps used to measure the attractor's bounding box
const INITIAL_DRAW  = 160000 // points drawn synchronously on first paint — shape appears instantly
const BATCH_IDLE    = 300    // points per frame in the ongoing loop (keeps it subtly alive)
const POINT_OPACITY = 0.025  // low enough that density creates the gradation naturally

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

      // Draw all initial points synchronously — attractor fully visible on first paint
      ctx.fillStyle = `rgba(255,255,255,${POINT_OPACITY})`
      for (let i = 0; i < INITIAL_DRAW; i++) {
        ;({ x, y } = step(x, y))
        ctx.fillRect((x * scale + cx) | 0, (y * scale + cy) | 0, 1, 1)
      }

      // Idle loop — adds density to denser paths, keeps it subtly alive
      state.active = true
      function draw() {
        if (!state.active) return
        ctx.fillStyle = `rgba(255,255,255,${POINT_OPACITY})`
        for (let i = 0; i < BATCH_IDLE; i++) {
          ;({ x, y } = step(x, y))
          ctx.fillRect((x * scale + cx) | 0, (y * scale + cy) | 0, 1, 1)
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
