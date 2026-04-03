'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const SEQUENCE = ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight']
const DOT_COUNT = 8
const DURATION = 3 // seconds for Pac-Man to cross the screen

function PacMan() {
  const [open, setOpen] = useState(true)
  useEffect(() => {
    const id = setInterval(() => setOpen(p => !p), 180)
    return () => clearInterval(id)
  }, [])

  const r = 20, cx = 24, cy = 24
  const angle = open ? 30 : 5
  const rad = (angle * Math.PI) / 180
  const tx = cx + r * Math.cos(rad)
  const ty = cy - r * Math.sin(rad)
  const bx = cx + r * Math.cos(rad)
  const by = cy + r * Math.sin(rad)

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} className="fill-accent-pacman" />
      <path d={`M${cx},${cy} L${tx},${ty} A${r},${r},0,0,1,${bx},${by} Z`} className="fill-base" />
      <circle cx={cx - 4} cy={cy - 8} r={3} className="fill-base" />
    </svg>
  )
}

export default function KonamiCode() {
  const prefersReducedMotion = useReducedMotion()
  const [active, setActive] = useState(false)
  const [runId, setRunId] = useState(0)
  const [dotDelays, setDotDelays] = useState<number[]>([])
  const [progress, setProgress] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const expected = SEQUENCE[progress]
      if (e.key === expected) {
        e.preventDefault()
        const next = progress + 1
        if (next === SEQUENCE.length) {
          setProgress(0)

          // Calculate when Pac-Man's mouth reaches each dot's fixed screen position.
          // Pac-Man starts at left:-60px, mouth is at x = -60 + 48 = -12px.
          // It travels (vw + 120)px over DURATION seconds.
          // Dot i is fixed at (i+1)*10vw from the left.
          const vw = window.innerWidth
          const totalDist = vw + 120
          const delays = Array.from({ length: DOT_COUNT }, (_, i) => {
            const dotX = vw * 0.1 * (i + 1)
            return ((dotX + 12) * DURATION) / totalDist
          })
          setDotDelays(delays)

          // Cancel previous timeout and force a fresh animation via runId key
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          setRunId(id => id + 1)
          setActive(true)
          timeoutRef.current = setTimeout(() => setActive(false), (DURATION + 0.6) * 1000)
        } else {
          setProgress(next)
        }
      } else {
        setProgress(e.key === SEQUENCE[0] ? 1 : 0)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [progress])

  // Skip animation entirely when user prefers reduced motion
  if (prefersReducedMotion) return null

  return (
    <>
      {/* Dots: fixed on screen — Pac-Man travels through them */}
      <AnimatePresence>
        {active && dotDelays.map((delay, i) => (
          <motion.div
            key={`dot-${runId}-${i}`}
            className="fixed z-[9995] pointer-events-none w-2 h-2 rounded-full bg-accent-pacman"
            style={{
              left: `${(i + 1) * 10}vw`,
              top: '48%',
              translate: '-50% -50%',
            }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay, duration: 0.12 }}
            aria-hidden="true"
          />
        ))}
      </AnimatePresence>

      {/* Pac-Man: moves independently across the screen */}
      <AnimatePresence>
        {active && (
          <motion.div
            key={`pacman-${runId}`}
            className="fixed z-[9996] pointer-events-none"
            style={{ top: 'calc(48% - 24px)', left: -60 }}
            initial={{ x: 0 }}
            animate={{ x: 'calc(100vw + 120px)' }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: DURATION, ease: 'linear' }}
            aria-hidden="true"
          >
            <PacMan />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
