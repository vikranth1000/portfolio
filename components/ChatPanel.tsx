'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useAttractor } from './AttractorProvider'
import type { EngineState } from '@/lib/attractor-engine'

type Message = { role: 'user' | 'assistant'; content: string }

const MD_BREAKPOINT = '(max-width: 767px)'

const WELCOME: Message = {
  role: 'assistant',
  content: "Hey! I'm an AI trained on Vikranth's background. Ask me about his projects, skills, or experience.",
}

// ── Atmosphere canvas: living attractor background inside the panel ──

function AtmosphereCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engine = useAttractor()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    let x = 0.1, y = 0.1

    // Warmup
    const state = engine.getState()
    for (let i = 0; i < 100; i++) {
      const nx = Math.sin(state.a * y) + state.c * Math.cos(state.a * x)
      const ny = Math.sin(state.b * x) + state.d * Math.cos(state.b * y)
      x = nx; y = ny
    }

    const onFrame = (s: EngineState) => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (!w || !h) return

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
      }

      const ctx = canvas.getContext('2d')!
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Fade
      ctx.globalCompositeOperation = 'destination-in'
      ctx.globalAlpha = 0.75
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1

      const batch = Math.round(150 + s.energy * 250)
      const alpha = 0.06 + s.energy * 0.08

      ctx.fillStyle = `rgba(34, 197, 94, ${Math.min(0.25, alpha)})`

      for (let i = 0; i < batch; i++) {
        const nx = Math.sin(s.a * y) + s.c * Math.cos(s.a * x)
        const ny = Math.sin(s.b * x) + s.d * Math.cos(s.b * y)
        x = nx; y = ny

        if (Math.abs(x) > 10 || Math.abs(y) > 10) { x = 0.1; y = 0.1; continue }

        const px = w / 2 + x * (w / 4.5)
        const py = h / 2 + y * (h / 4.5)
        ctx.fillRect(px, py, 1.2, 1.2)
      }

      // Background fill
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
    }

    engine.subscribe(onFrame)
    return () => engine.unsubscribe(onFrame)
  }, [engine, prefersReducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}

// ── Rate limiting (client-side) ──

function getRateLimit(): { count: number; date: string } {
  try {
    const stored = localStorage.getItem('ama_rl')
    if (!stored) return { count: 0, date: '' }
    return JSON.parse(stored)
  } catch { return { count: 0, date: '' } }
}

function checkAndIncrement(): boolean {
  const today = new Date().toDateString()
  const rl = getRateLimit()
  if (rl.date !== today) {
    localStorage.setItem('ama_rl', JSON.stringify({ count: 1, date: today }))
    return true
  }
  if (rl.count >= 15) return false
  localStorage.setItem('ama_rl', JSON.stringify({ count: rl.count + 1, date: today }))
  return true
}

// ── ChatPanel ──

interface ChatPanelProps {
  onClose: () => void
}

export default function ChatPanel({ onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const engine = useAttractor()

  const handleMessagesScroll = () => {
    const el = messagesRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    setScrollProgress(max > 0 ? el.scrollTop / max : 0)
  }

  // Track mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia(MD_BREAKPOINT)
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Prevent body scroll on mobile
  useEffect(() => {
    if (!isMobile) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isMobile])

  // Focus input on mount; sync hint visibility
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80)
    window.dispatchEvent(new Event('palette_opened'))
    return () => { window.dispatchEvent(new Event('palette_closed')) }
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    // Inject energy on keystroke
    engine.injectEnergy(0.05)

    if (!checkAndIncrement()) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "You've reached today's message limit. Feel free to reach out directly at vikranthreddimasu@gmail.com!",
      }])
      setInput('')
      return
    }

    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Sustained energy while AI is thinking
    const thinkingInterval = setInterval(() => {
      engine.injectEnergy(0.02)
    }, 16)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data?.content || "Something went wrong. Try reaching out at vikranthreddimasu@gmail.com",
        }])
        return
      }
      const data = await res.json()

      // Energy burst on response arrival
      engine.injectEnergy(0.3)

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content || "Something went wrong. Try reaching out at vikranthreddimasu@gmail.com",
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Couldn't connect. Reach out at vikranthreddimasu@gmail.com!",
      }])
    } finally {
      clearInterval(thinkingInterval)
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    engine.injectEnergy(0.03)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <motion.div
          className="fixed inset-0 z-[9970] bg-black/60 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <motion.div
        initial={prefersReducedMotion ? false : isMobile ? { opacity: 1, y: '100%' } : { opacity: 0, y: 8, scale: 0.97 }}
        animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
        exit={prefersReducedMotion ? { opacity: 0 } : isMobile ? { opacity: 1, y: '100%' } : { opacity: 0, y: 8, scale: 0.97 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-0 left-0 right-0 md:bottom-20 md:left-6 md:right-auto md:w-[320px] z-[9980] flex flex-col border border-border-default rounded-t-2xl md:rounded-xl shadow-2xl overflow-hidden h-[85dvh] md:h-auto"
        role="dialog"
        aria-modal="true"
        aria-label="AI Chat"
      >
        {/* Living atmosphere background */}
        <AtmosphereCanvas />

        {/* Content overlay — everything on top of the canvas */}
        <div className="relative z-10 flex flex-col h-full md:h-auto">
          {/* Drag handle — mobile only */}
          <div className="flex justify-center pt-2.5 pb-1 md:hidden">
            <div className="w-9 h-1 rounded-full bg-border-hover" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green inline-block" />
              <span className="text-xs font-mono text-text-hint tracking-wide">ask me anything</span>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-hint transition-colors"
              aria-label="Close chat"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l10 10M11 1L1 11"/>
              </svg>
            </button>
          </div>

          {/* Scroll progress bar */}
          <motion.div
            className="h-px bg-white/30 origin-left pointer-events-none"
            style={{ scaleX: scrollProgress }}
          />

          {/* Messages */}
          <div
            ref={messagesRef}
            onScroll={handleMessagesScroll}
            data-lenis-prevent
            className="flex flex-col gap-3 p-4 flex-1 md:flex-none md:h-72 overflow-y-auto"
            role="log"
            aria-live="polite"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p
                  className={`text-terminal leading-relaxed max-w-[85%] px-3 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-white/10 text-white rounded-br-sm'
                      : 'bg-surface-raised/80 text-text-secondary border border-border-default rounded-bl-sm backdrop-blur-sm'
                  }`}
                >
                  {msg.content}
                </p>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-raised/80 border border-border-default rounded-lg rounded-bl-sm px-3 py-2.5 flex gap-1 items-center backdrop-blur-sm">
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      className="w-1 h-1 rounded-full bg-accent-green inline-block"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="flex items-center gap-2 px-3 pt-3 border-t border-border-subtle bg-surface/60 backdrop-blur-sm"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Ask something..."
              className="flex-1 bg-transparent text-white text-terminal outline-none placeholder-text-muted disabled:opacity-50 caret-accent-green"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="text-text-muted hover:text-white transition-colors disabled:opacity-30"
              aria-label="Send"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 7H2M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      </motion.div>
    </>
  )
}
