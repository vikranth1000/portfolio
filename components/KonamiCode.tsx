'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown']

function PacMan() {
  const [open, setOpen] = useState(true)
  useEffect(() => {
    const id = setInterval(() => setOpen(p => !p), 180)
    return () => clearInterval(id)
  }, [])

  const r = 20
  const cx = 24
  const cy = 24
  const angle = open ? 30 : 5
  const rad = (angle * Math.PI) / 180
  const tx = cx + r * Math.cos(rad)
  const ty = cy - r * Math.sin(rad)
  const bx = cx + r * Math.cos(rad)
  const by = cy + r * Math.sin(rad)

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="#FACC15" />
      <path d={`M${cx},${cy} L${tx},${ty} A${r},${r},0,0,1,${bx},${by} Z`} fill="#090909" />
      <circle cx={cx - 4} cy={cy - 8} r={3} fill="#090909" />
    </svg>
  )
}

export default function KonamiCode() {
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const expected = SEQUENCE[progress]
      if (e.key === expected) {
        const next = progress + 1
        if (next === SEQUENCE.length) {
          setActive(true)
          setProgress(0)
          setTimeout(() => setActive(false), 3500)
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

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed z-[9998] pointer-events-none"
          style={{ top: '48%', left: -60 }}
          initial={{ x: 0 }}
          animate={{ x: 'calc(100vw + 120px)' }}
          transition={{ duration: 3, ease: 'linear' }}
          aria-hidden="true"
        >
          <div className="flex items-center gap-3">
            <PacMan />
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#FACC15]"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 0 }}
                transition={{ delay: i * 0.35, duration: 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
