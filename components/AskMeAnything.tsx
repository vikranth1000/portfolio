'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { FormEvent, useEffect, useRef, useState } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

function MascotIcon() {
  return (
    <motion.svg
      width="26" height="26" viewBox="0 0 26 26"
      fill="none" stroke="currentColor" strokeLinecap="round"
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* V-arms */}
      <line x1="4" y1="4" x2="13" y2="22" strokeWidth="1.5" />
      <line x1="22" y1="4" x2="13" y2="22" strokeWidth="1.5" />
      {/* Top-left node — pulses first */}
      <motion.circle cx="4" cy="4" r="2.5" fill="currentColor" stroke="none"
        animate={{ scale: [1, 1.7, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
      {/* Bottom apex — pulses second */}
      <motion.circle cx="13" cy="22" r="3" fill="currentColor" stroke="none"
        animate={{ scale: [1, 1.6, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
      {/* Top-right node — pulses third */}
      <motion.circle cx="22" cy="4" r="2.5" fill="currentColor" stroke="none"
        animate={{ scale: [1, 1.7, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
    </motion.svg>
  )
}

const WELCOME: Message = {
  role: 'assistant',
  content: "Hey! I'm an AI trained on Vikranth's background. Ask me about his projects, skills, or experience.",
}

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

export default function AskMeAnything() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Seed welcome message on first open
  useEffect(() => {
    if (open && messages.length === 0) setMessages([WELCOME])
    if (open) setTimeout(() => inputRef.current?.focus(), 80)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

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

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content || data.error || "Something went wrong. Try reaching out at vikranthreddimasu@gmail.com",
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Couldn't connect. Reach out at vikranthreddimasu@gmail.com!",
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-20 left-6 z-[9980] w-[320px] hidden md:flex flex-col bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] bg-[#0f0f0f]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green inline-block" />
                <span className="text-xs font-mono text-[#666] tracking-wide">ask me anything</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[#333] hover:text-[#666] transition-colors"
                aria-label="Close chat"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 1l10 10M11 1L1 11"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-3 p-4 h-72 overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p
                    className={`text-[13px] leading-relaxed max-w-[85%] px-3 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-white/10 text-white rounded-br-sm'
                        : 'bg-[#141414] text-[#aaa] border border-[#1f1f1f] rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </p>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg rounded-bl-sm px-3 py-2.5 flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        className="w-1 h-1 rounded-full bg-[#444] inline-block"
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
            <form onSubmit={sendMessage} className="flex items-center gap-2 px-3 py-3 border-t border-[#1a1a1a]">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                placeholder="Ask something..."
                className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder-[#333] disabled:opacity-50"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="text-[#333] hover:text-white transition-colors disabled:opacity-30"
                aria-label="Send"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 7H2M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Ask me anything'}
        className="fixed bottom-6 left-6 z-[9980] hidden md:flex w-10 h-10 rounded-full bg-[#0f0f0f] border border-[#1f1f1f] items-center justify-center text-[#555] hover:text-text-primary hover:border-border-hover transition-all"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg key="x" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
              initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
              <path d="M1 1l10 10M11 1L1 11"/>
            </motion.svg>
          ) : (
            <motion.div key="mascot"
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}>
              <MascotIcon />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </>
  )
}
