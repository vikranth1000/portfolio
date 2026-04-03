'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import { getAttractorEngine, destroyAttractorEngine, type AttractorEngine } from '@/lib/attractor-engine'

const AttractorContext = createContext<AttractorEngine | null>(null)

export function useAttractor(): AttractorEngine {
  const engine = useContext(AttractorContext)
  if (!engine) throw new Error('useAttractor must be used within AttractorProvider')
  return engine
}

export default function AttractorProvider({ children }: { children: React.ReactNode }) {
  const engineRef = useRef<AttractorEngine | null>(null)

  if (!engineRef.current) {
    engineRef.current = getAttractorEngine()
  }

  useEffect(() => {
    return () => {
      destroyAttractorEngine()
      engineRef.current = null
    }
  }, [])

  return (
    <AttractorContext.Provider value={engineRef.current!}>
      {children}
    </AttractorContext.Provider>
  )
}
