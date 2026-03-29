'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function KeyboardHint() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 500)
    const hide = () => setVisible(false)
    const show = () => setVisible(true)
    window.addEventListener('palette_opened', hide)
    window.addEventListener('palette_closed', show)
    return () => {
      clearTimeout(t)
      window.removeEventListener('palette_opened', hide)
      window.removeEventListener('palette_closed', show)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 right-6 z-[9990] hidden md:flex items-center gap-2 pointer-events-none select-none"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          aria-hidden="true"
        >
          <kbd className="text-xs text-[#444] border border-[#2a2a2a] rounded px-1.5 py-0.5 font-mono bg-[#0f0f0f]">
            /
          </kbd>
          <span className="text-xs text-[#3a3a3a] font-mono tracking-wide">
            terminal
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
