'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const PROMPT = 'vikranth@portfolio:~$'

type Line =
  | { kind: 'input'; text: string }
  | { kind: 'output'; text: string }
  | { kind: 'cmd'; name: string; description: string }
  | { kind: 'error'; text: string }

function getOutput(raw: string): { lines: Line[]; action?: 'clear' | 'exit' } {
  const cmd = raw.trim().toLowerCase()

  switch (cmd) {
    case 'help':
      return {
        lines: [
          { kind: 'output', text: 'Commands:' },
          { kind: 'cmd', name: 'ls', description: 'list projects' },
          { kind: 'cmd', name: 'cat about.txt', description: 'about me' },
          { kind: 'cmd', name: 'whoami', description: 'quick intro' },
          { kind: 'cmd', name: 'clear', description: 'clear terminal' },
          { kind: 'cmd', name: 'exit', description: 'close' },
          { kind: 'output', text: '' },
          { kind: 'output', text: 'Secrets:' },
          { kind: 'cmd', name: '←→←→', description: '???' },
        ] as Line[],
      }

    case 'ls':
    case 'ls projects':
    case 'ls projects/':
      return {
        lines: [
          'projects/',
          '├── pacman-ai       DQN Pac-Man simulator — 5 competing agents',
          '└── ...             more coming soon',
        ].map(text => ({ kind: 'output', text })),
      }

    case 'cat about.txt':
    case 'about':
      return {
        lines: [
          'name:     Vikranth Reddimasu',
          'role:     ML Engineer / Data Scientist / AI Engineer',
          'status:   open to work',
          'email:    vikranthreddimasu@gmail.com',
        ].map(text => ({ kind: 'output', text })),
      }

    case 'whoami':
      return {
        lines: [
          'vikranth reddimasu — building AI systems that scale.',
          'reach me: vikranthreddimasu@gmail.com',
        ].map(text => ({ kind: 'output', text })),
      }

    case 'clear':
      return { lines: [], action: 'clear' }

    case 'exit':
    case 'quit':
      return { lines: [], action: 'exit' }

    case '':
      return { lines: [] }

    default:
      return {
        lines: [{ kind: 'error', text: `command not found: ${raw.trim()}` }],
      }
  }
}

const INITIAL_LINES: Line[] = [
  { kind: 'output', text: 'Welcome. Type "help" for available commands.' },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState<Line[]>(INITIAL_LINES)
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Open on '/'
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (e.key === '/' && !open && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // Focus input when opened; sync hint visibility
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      window.dispatchEvent(new Event('palette_opened'))
    } else {
      window.dispatchEvent(new Event('palette_closed'))
    }
  }, [open])

  // Scroll to bottom on new output
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(histIdx + 1, cmdHistory.length - 1)
      setHistIdx(next)
      setInput(cmdHistory[cmdHistory.length - 1 - next] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = histIdx - 1
      setHistIdx(next)
      setInput(next < 0 ? '' : cmdHistory[cmdHistory.length - 1 - next] ?? '')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { lines: outputLines, action } = getOutput(input)

    if (action === 'exit') {
      setOpen(false)
      setInput('')
      return
    }

    if (action === 'clear') {
      setLines([])
      setInput('')
      setHistIdx(-1)
      return
    }

    if (input.trim()) {
      setCmdHistory(h => [...h, input.trim()])
    }
    setHistIdx(-1)
    setLines(prev => [
      ...prev,
      { kind: 'input', text: input },
      ...outputLines,
    ])
    setInput('')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[9997] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
          />

          <motion.div
            className="fixed z-[9998] top-1/2 left-1/2 w-full max-w-2xl px-4"
            style={{ translateX: '-50%', translateY: '-50%' }}
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl overflow-hidden shadow-2xl font-mono">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a] bg-[#0f0f0f]">
                <button
                  onClick={() => setOpen(false)}
                  className="w-3 h-3 rounded-full bg-[#ff5f57] hover:opacity-80 transition-opacity"
                  aria-label="Close"
                />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-auto text-[#333] text-xs tracking-wide">
                  portfolio — bash
                </span>
              </div>

              {/* Output */}
              <div
                className="h-72 overflow-y-auto p-4 space-y-0.5"
                onClick={() => inputRef.current?.focus()}
              >
                {lines.map((line, i) => (
                  <div key={i} className="text-[13px] leading-relaxed">
                    {line.kind === 'input' ? (
                      <p>
                        <span className="text-[#22c55e]">{PROMPT}</span>
                        <span className="text-white ml-2">{line.text}</span>
                      </p>
                    ) : line.kind === 'cmd' ? (
                      <p className="flex gap-4">
                        <span className="text-white w-36 shrink-0">{line.name}</span>
                        <span className="text-[#444]">{line.description}</span>
                      </p>
                    ) : line.kind === 'error' ? (
                      <p className="text-[#ff5f57]">{line.text}</p>
                    ) : (
                      <p className="text-[#555]">{line.text}</p>
                    )}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 px-4 py-3 border-t border-[#1a1a1a]"
              >
                <span className="text-[#22c55e] text-[13px] shrink-0">{PROMPT}</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-white text-[13px] outline-none caret-[#22c55e] placeholder-[#333]"
                  placeholder="type a command..."
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
