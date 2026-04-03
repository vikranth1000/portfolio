'use client'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const PROMPT = 'vikranth@portfolio:~$'

type Line =
  | { kind: 'input'; text: string }
  | { kind: 'output'; text: string }
  | { kind: 'cmd'; name: string; description: string }
  | { kind: 'error'; text: string }
  | { kind: 'neofetch' }

const MATRIX_CHARS = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789'
const rand = () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
const makeRow = (cols: number) => Array.from({ length: cols }, rand).join('')

function MatrixRain() {
  const COLS = 44
  const ROWS = 10
  const [rows, setRows] = useState(() => Array.from({ length: ROWS }, () => makeRow(COLS)))
  useEffect(() => {
    const id = setInterval(() => setRows(Array.from({ length: ROWS }, () => makeRow(COLS))), 70)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="text-accent-green text-[11px] leading-snug select-none">
      {rows.map((row, i) => (
        <p key={i} style={{ opacity: 0.15 + (i / ROWS) * 0.85 }}>{row}</p>
      ))}
    </div>
  )
}

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
          { kind: 'cmd', name: 'neofetch', description: 'system info' },
          { kind: 'cmd', name: 'cat llms.txt', description: 'AI-readable profile' },
          { kind: 'cmd', name: 'clear', description: 'clear terminal' },
          { kind: 'cmd', name: 'exit', description: 'close' },
          { kind: 'output', text: '' },
          { kind: 'output', text: 'Secrets:' },
          { kind: 'cmd', name: '←→←→', description: '???' },
          { kind: 'cmd', name: 'matrix', description: '???' },
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

    case 'neofetch':
      return { lines: [{ kind: 'neofetch' }] }

    case 'cat llms.txt':
      return {
        lines: [
          { kind: 'output', text: '# Vikranth Reddimasu' },
          { kind: 'output', text: '> ML Engineer building AI systems that scale.' },
          { kind: 'output', text: '' },
          { kind: 'output', text: 'Full profile available at /llms.txt' },
          { kind: 'output', text: 'Extended: /llms-full.txt' },
        ],
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
  const [matrixActive, setMatrixActive] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const matrixTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const prefersReducedMotion = useReducedMotion()

  const handleOutputScroll = () => {
    const el = outputRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    setScrollProgress(max > 0 ? el.scrollTop / max : 0)
  }

  // Cleanup matrix timer on unmount
  useEffect(() => {
    return () => { if (matrixTimerRef.current) clearTimeout(matrixTimerRef.current) }
  }, [])

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

  // Focus input when opened; sync hint visibility; scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => inputRef.current?.focus(), 50)
      window.dispatchEvent(new Event('palette_opened'))
    } else {
      document.body.style.overflow = ''
      // Cancel any pending matrix animation on close
      if (matrixTimerRef.current) {
        clearTimeout(matrixTimerRef.current)
        matrixTimerRef.current = undefined
      }
      setMatrixActive(false)
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

    // Special case: matrix animation
    if (input.trim().toLowerCase() === 'matrix') {
      if (input.trim()) setCmdHistory(h => [...h, input.trim()])
      setHistIdx(-1)
      setLines(prev => [...prev, { kind: 'input', text: input }])
      setInput('')
      setMatrixActive(true)
      matrixTimerRef.current = setTimeout(() => {
        setMatrixActive(false)
        setLines([{ kind: 'output', text: '// Wake up, Neo...' }])
      }, 2500)
      return
    }

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
            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
            onClick={() => setOpen(false)}
          />

          <motion.div
            className="fixed z-[9998] top-1/2 left-1/2 w-full max-w-2xl px-4"
            style={{ translateX: '-50%', translateY: '-50%' }}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Terminal"
          >
            <div className="bg-surface-alt border border-border-default rounded-xl overflow-hidden shadow-2xl font-mono">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-surface">
                <button
                  onClick={() => setOpen(false)}
                  className="w-3 h-3 rounded-full bg-accent-red hover:opacity-80 transition-opacity"
                  aria-label="Close"
                />
                <div className="w-3 h-3 rounded-full bg-accent-yellow" />
                <div className="w-3 h-3 rounded-full bg-accent-green-mac" />
                <span className="ml-auto text-text-muted text-xs tracking-wide">
                  portfolio — bash
                </span>
              </div>

              {/* Scroll progress bar */}
              <motion.div
                className="h-px bg-white/30 origin-left pointer-events-none"
                style={{ scaleX: scrollProgress }}
              />

              {/* Output */}
              <div
                ref={outputRef}
                onScroll={handleOutputScroll}
                data-lenis-prevent
                className="h-72 overflow-y-auto p-4 space-y-0.5"
                role="log"
                aria-live="polite"
                onClick={() => inputRef.current?.focus()}
              >
                {matrixActive ? (
                  <MatrixRain />
                ) : (
                  <>
                    {lines.map((line, i) => (
                      <div key={i} className="text-terminal leading-relaxed">
                        {line.kind === 'input' ? (
                          <p>
                            <span className="text-accent-green">{PROMPT}</span>
                            <span className="text-white ml-2">{line.text}</span>
                          </p>
                        ) : line.kind === 'cmd' ? (
                          <p className="flex gap-4">
                            <span className="text-white w-36 shrink-0">{line.name}</span>
                            <span className="text-text-label">{line.description}</span>
                          </p>
                        ) : line.kind === 'error' ? (
                          <p className="text-accent-red">{line.text}</p>
                        ) : line.kind === 'neofetch' ? (
                          <div className="py-1 space-y-0.5">
                            <p>
                              <span className="text-accent-green">vikranth</span>
                              <span className="text-text-secondary">@</span>
                              <span className="text-accent-green">portfolio</span>
                            </p>
                            <p className="text-text-muted">{'─'.repeat(26)}</p>
                            {([
                              ['OS',     'Portfolio v2.0',          false],
                              ['Shell',  'Next.js 14 · App Router', false],
                              ['WM',     'Framer Motion',           false],
                              ['Langs',  'Python · TypeScript · R', false],
                              ['Role',   'ML Engineer',             false],
                              ['GPU',    'PyTorch · CUDA',          false],
                              ['Status', 'open to work ●',          true ],
                            ] as [string, string, boolean][]).map(([k, v, accent]) => (
                              <p key={k} className="flex">
                                <span className="text-text-secondary w-16 shrink-0">{k}</span>
                                <span className="text-text-muted mr-2">:</span>
                                <span className={accent ? 'text-accent-green' : 'text-text-secondary'}>{v}</span>
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-text-secondary">{line.text}</p>
                        )}
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 px-4 py-3 border-t border-border-subtle"
              >
                <span className="text-accent-green text-terminal shrink-0">{PROMPT}</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={matrixActive}
                  className="flex-1 bg-transparent text-white text-terminal outline-none caret-accent-green placeholder-text-muted disabled:opacity-30"
                  placeholder={matrixActive ? '' : 'type a command...'}
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
