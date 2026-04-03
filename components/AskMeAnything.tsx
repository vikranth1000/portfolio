'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import AttractorOrb from './AttractorOrb'
import ChatPanel from './ChatPanel'

export default function AskMeAnything() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {open && <ChatPanel onClose={() => setOpen(false)} />}
      </AnimatePresence>

      <AttractorOrb open={open} onToggle={() => setOpen(o => !o)} />
    </>
  )
}
