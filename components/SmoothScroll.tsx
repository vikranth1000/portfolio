'use client'

import { ReactLenis } from 'lenis/react'
import { useEffect, useState } from 'react'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <ReactLenis
      root
      options={
        reducedMotion
          ? { smoothWheel: false }
          : {
              duration: 1.2,
              easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              smoothWheel: true,
            }
      }
    >
      {children}
    </ReactLenis>
  )
}
