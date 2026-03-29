'use client'
import { useEffect } from 'react'

export default function ConsoleMessage() {
  useEffect(() => {
    const s = (color: string, size = 12) =>
      `font-size:${size}px;color:${color};background:#090909;font-family:monospace;padding:2px 0;`

    console.log('%c ', s('#090909'))
    console.log(
      '%c  VIKRANTH REDDIMASU ',
      `font-size:18px;font-weight:700;color:#ffffff;background:#090909;font-family:monospace;letter-spacing:4px;padding:6px 0;`,
    )
    console.log(
      '%c  ML Engineer · Data Scientist · AI Engineer ',
      `font-size:11px;color:#22c55e;background:#090909;font-family:monospace;letter-spacing:2px;padding:2px 0;`,
    )
    console.log('%c ', s('#090909'))
    console.log('%c  Hi, you found the console.', s('#888888'))
    console.log('%c  You seem curious — that\'s a good sign.', s('#888888'))
    console.log('%c ', s('#090909'))
    console.log('%c  → vikranthreddimasu@gmail.com', s('#555555'))
    console.log('%c ', s('#090909'))
    console.log('%c  Hints:', s('#333333'))
    console.log('%c  Press [ / ] to open the terminal', s('#333333'))
    console.log('%c  You know the konami code...', s('#333333'))
    console.log('%c ', s('#090909'))
  }, [])

  return null
}
