'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function KeyboardHint() {
  const [visible, setVisible] = useState(false)

  // Fade in after 2s, hide once the palette has been opened (stored in sessionStorage)
  useEffect(() => {
    if (sessionStorage.getItem('palette_opened')) return
    const t = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // Hide permanently for this session once clicked or palette opened
  useEffect(() => {
    const hide = () => {
      if (sessionStorage.getItem('palette_opened')) setVisible(false)
    }
    window.addEventListener('palette_opened', hide)
    return () => window.removeEventListener('palette_opened', hide)
  }, [])

  if (!visible) return null

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[9990] hidden md:flex items-center gap-2 pointer-events-none select-none"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      aria-hidden="true"
    >
      <kbd className="text-xs text-[#444] border border-[#2a2a2a] rounded px-1.5 py-0.5 font-mono bg-[#0f0f0f]">
        /
      </kbd>
      <span className="text-xs text-[#3a3a3a] font-mono tracking-wide">
        terminal
      </span>
    </motion.div>
  )
}
