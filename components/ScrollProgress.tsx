'use client'
import { motion, useScroll } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-px bg-white/30 z-[60] origin-left pointer-events-none"
      style={{ scaleX: scrollYProgress }}
    />
  )
}
