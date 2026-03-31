'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only run on pointer devices (non-touch)
    if (window.matchMedia('(hover: none)').matches) return

    const dot = dotRef.current
    if (!dot) return

    // Add class to html element to enable cursor: none now that custom cursor is ready
    document.documentElement.classList.add('custom-cursor-active')

    const onMouseMove = (e: MouseEvent) => {
      dot.style.left = `${e.clientX}px`
      dot.style.top = `${e.clientY}px`
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') !== null ||
        target.closest('button') !== null
      dot.classList.toggle('hovered', isInteractive)
    }

    const onMouseLeave = () => { dot.style.opacity = '0' }
    const onMouseEnter = () => { dot.style.opacity = '' }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    return () => {
      // Remove class when component unmounts
      document.documentElement.classList.remove('custom-cursor-active')
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
    }
  }, [])

  return <div ref={dotRef} className="cursor-dot hidden md:block" aria-hidden="true" />
}
