'use client'

import { motion, useMotionValue } from 'framer-motion'
import { useLenis } from 'lenis/react'

export default function ScrollProgress() {
  const scaleX = useMotionValue(0)

  useLenis((lenis) => {
    scaleX.set(lenis.progress)
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-px bg-white/30 z-[60] origin-left pointer-events-none"
      style={{ scaleX }}
    />
  )
}
