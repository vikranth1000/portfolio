'use client'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import ChatPanel from './ChatPanel'

// ─── Types & constants ────────────────────────────────────────────────────────

type Section = 'hero' | 'projects' | 'skills' | 'education' | 'about' | 'contact'
const SECTION_IDS = ['projects', 'skills', 'education', 'about', 'contact'] as const

// Left-arm paths per section: upper arm + lower arm + hand endpoint
// All paths share identical command structure (M … Q … / M … Q …) so Framer Motion
// can morph them smoothly.
const ARM: Record<Section, { u: string; l: string; hx: number; hy: number }> = {
  hero:      { u: 'M82,95 Q70,115 65,140', l: 'M65,140 Q62,158 62,170', hx: 62, hy: 173 },
  projects:  { u: 'M82,95 Q88,72 86,52',   l: 'M86,52 Q84,38 80,28',   hx: 80, hy: 26  },
  skills:    { u: 'M82,95 Q78,82 74,68',    l: 'M74,68 Q72,55 70,44',   hx: 70, hy: 42  },
  education: { u: 'M82,95 Q70,115 65,140',  l: 'M65,140 Q62,158 62,170', hx: 62, hy: 173 },
  about:     { u: 'M82,95 Q70,115 65,140',  l: 'M65,140 Q62,158 62,170', hx: 62, hy: 173 },
  contact:   { u: 'M82,95 Q78,82 74,68',    l: 'M74,68 Q72,55 70,44',   hx: 70, hy: 42  },
}

const ARM_T  = { type: 'tween' as const, ease: [0.34, 1.56, 0.64, 1] as [number,number,number,number], duration: 0.55 }
const BLINK_ANIM = { scaleY: [1, 1, 0.08, 1] as number[] }
const BLINK_T    = { duration: 4, repeat: Infinity, repeatDelay: 2.5, times: [0, 0.75, 0.82, 0.9], ease: 'easeInOut' as const }

// ─── Floating ML icon sub-components ─────────────────────────────────────────

function NeuralNetIcon() {
  const pulse = { opacity: [0.35, 1, 0.35] as number[] }
  return (
    <svg width="42" height="34" viewBox="0 0 42 34" fill="none" stroke="currentColor" strokeLinecap="round">
      <line x1="8" y1="26" x2="21" y2="6"  strokeWidth="1.4"/>
      <line x1="8" y1="26" x2="34" y2="26" strokeWidth="1.4"/>
      <line x1="21" y1="6" x2="34" y2="26" strokeWidth="1.4"/>
      <motion.circle cx="8"  cy="26" r="4" fill="currentColor" stroke="none" animate={pulse} transition={{ duration: 1.6, repeat: Infinity, delay: 0 }}/>
      <motion.circle cx="21" cy="6"  r="4" fill="currentColor" stroke="none" animate={pulse} transition={{ duration: 1.6, repeat: Infinity, delay: 0.45 }}/>
      <motion.circle cx="34" cy="26" r="4" fill="currentColor" stroke="none" animate={pulse} transition={{ duration: 1.6, repeat: Infinity, delay: 0.9 }}/>
    </svg>
  )
}

function CodeTagIcon() {
  return (
    <svg width="52" height="30" viewBox="0 0 52 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12,4 L4,15 L12,26"/>
      <line x1="22" y1="4" x2="18" y2="26"/>
      <path d="M28,4 L36,15 L28,26"/>
    </svg>
  )
}

function LossCurveIcon() {
  return (
    <svg width="42" height="34" viewBox="0 0 42 34" fill="none" stroke="currentColor" strokeLinecap="round">
      <line x1="4" y1="4"  x2="4"  y2="30" strokeWidth="1.5"/>
      <line x1="4" y1="30" x2="38" y2="30" strokeWidth="1.5"/>
      <path d="M6,8 C10,8 14,24 38,28" strokeWidth="2"/>
      <motion.circle
        cx={6} cy={8} r="3" fill="currentColor" stroke="none"
        animate={{ cx: [6, 22, 38], cy: [8, 18, 28] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  )
}

function BrainIcon() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20,7 Q8,5 6,15 Q4,23 12,27 L20,29"/>
      <path d="M20,7 Q32,5 34,15 Q36,23 28,27 L20,29"/>
      <line x1="20" y1="7" x2="20" y2="29" strokeWidth="1" opacity="0.4"/>
      <path d="M16,29 Q20,35 24,29"/>
    </svg>
  )
}

function SignalRingsIcon() {
  const ring = { opacity: [0.25, 1, 0.25] as number[] }
  const ringT = (delay: number) => ({ duration: 1.6, repeat: Infinity, delay, ease: 'easeInOut' as const })
  return (
    <svg width="38" height="30" viewBox="0 0 38 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="6" cy="26" r="2.5" fill="currentColor" stroke="none"/>
      <motion.path d="M11,26 Q11,18 6,15" animate={ring} transition={ringT(0)}/>
      <motion.path d="M16,26 Q16,13 6,10" animate={ring} transition={ringT(0.25)}/>
      <motion.path d="M21,26 Q21,8  6,5"  animate={ring} transition={ringT(0.5)}/>
    </svg>
  )
}

function FloatingIcon({ section }: { section: Section }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={section}
        initial={{ scale: 0, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: 8 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="absolute -top-14 right-2 text-white/55 pointer-events-none"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {section === 'hero'                                && <NeuralNetIcon />}
          {section === 'projects'                            && <CodeTagIcon />}
          {(section === 'skills' || section === 'education') && <LossCurveIcon />}
          {section === 'about'                               && <BrainIcon />}
          {section === 'contact'                             && <SignalRingsIcon />}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Cat companion ────────────────────────────────────────────────────────────

function CatCompanion() {
  return (
    <div className="fixed bottom-0 left-4 z-20 hidden xl:block pointer-events-none select-none" aria-hidden="true">
      <svg width="62" height="72" viewBox="0 0 62 72" className="text-white/65">
        {/* Body */}
        <ellipse cx="31" cy="50" rx="18" ry="16" fill="currentColor"/>
        {/* Head */}
        <circle  cx="31" cy="29" r="14" fill="currentColor"/>
        {/* Left ear */}
        <polygon points="15,20 11,6 24,15" fill="currentColor"/>
        {/* Right ear */}
        <polygon points="47,20 51,6 38,15" fill="currentColor"/>
        {/* Eyes */}
        <motion.circle
          cx="26" cy="28" r="2.2" fill="#0a0a0a"
          animate={BLINK_ANIM}
          transition={{ ...BLINK_T, repeatDelay: 3 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
        <motion.circle
          cx="36" cy="28" r="2.2" fill="#0a0a0a"
          animate={BLINK_ANIM}
          transition={{ ...BLINK_T, repeatDelay: 3 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
        {/* Nose */}
        <circle cx="31" cy="33" r="1.2" fill="#0a0a0a"/>
        {/* Whiskers */}
        <line x1="17" y1="32" x2="27" y2="31" stroke="#444" strokeWidth="0.9" strokeLinecap="round"/>
        <line x1="17" y1="35" x2="27" y2="34" stroke="#444" strokeWidth="0.9" strokeLinecap="round"/>
        <line x1="45" y1="32" x2="35" y2="31" stroke="#444" strokeWidth="0.9" strokeLinecap="round"/>
        <line x1="45" y1="35" x2="35" y2="34" stroke="#444" strokeWidth="0.9" strokeLinecap="round"/>
        {/* Tail */}
        <motion.path
          d="M48,52 Q60,46 58,34 Q56,26 50,28"
          fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"
          animate={{ rotate: [-14, 14, -14] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '48px 52px', transformBox: 'view-box' as React.CSSProperties['transformBox'] }}
        />
      </svg>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SideCharacter() {
  const [section, setSection] = useState<Section>('hero')
  const [open, setOpen]       = useState(false)
  const [clicked, setClicked] = useState(false)

  // Page-wide cursor tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Head rotation: ±12° based on cursor X across full page width
  const headRotate = useSpring(
    useTransform(mouseX, v => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1440
      return (v / w) * 24 - 12
    }),
    { stiffness: 80, damping: 20 }
  )

  // Eye offset: pupils shift up to ±3px H, ±2px V
  const eyeOffsetX = useSpring(
    useTransform(mouseX, v => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1440
      return (v / w) * 6 - 3
    }),
    { stiffness: 200, damping: 30 }
  )
  const eyeOffsetY = useSpring(
    useTransform(mouseY, v => {
      const h = typeof window !== 'undefined' ? window.innerHeight : 900
      return (v / h) * 4 - 2
    }),
    { stiffness: 200, damping: 30 }
  )

  // Cursor tracking across entire page
  useEffect(() => {
    const handler = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [mouseX, mouseY])

  // Section detection via IntersectionObserver
  useEffect(() => {
    const observers = SECTION_IDS.map(id => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setSection(id) },
        { threshold: 0.3 }
      )
      obs.observe(el)
      return obs
    })
    const onScroll = () => { if (window.scrollY < 200) setSection('hero') }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observers.forEach(o => o?.disconnect())
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Click-punch reset
  useEffect(() => {
    if (!clicked) return
    const t = setTimeout(() => setClicked(false), 350)
    return () => clearTimeout(t)
  }, [clicked])

  return (
    <>
      <CatCompanion />
      <ChatPanel open={open} onClose={() => setOpen(false)} />

      {/* Character container — fixed bottom-right */}
      <div className="fixed bottom-0 right-4 z-20 hidden xl:block select-none">
        <div className="relative">
          <FloatingIcon section={section} />

          <motion.div
            onClick={() => { setOpen(o => !o); setClicked(true) }}
            animate={clicked ? { scale: [1, 1.03, 0.99, 1] } : {}}
            transition={{ duration: 0.3 }}
            className="cursor-pointer"
            role="button"
            aria-label={open ? 'Close chat' : 'Ask me anything'}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') { setOpen(o => !o); setClicked(true) }
            }}
          >
            <svg
              width="180" height="270"
              viewBox="0 0 180 270"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/80 hover:text-white transition-colors duration-300"
              aria-hidden="true"
            >
              {/* ── Bench ── */}
              <rect x="55" y="205" width="105" height="8"  rx="2" fill="#1a1a1a" strokeWidth="2"/>
              <rect x="60" y="218" width="95"  height="7"  rx="2" fill="#1a1a1a" strokeWidth="2"/>
              <line x1="68"  y1="225" x2="64"  y2="258" strokeWidth="2.5"/>
              <line x1="152" y1="225" x2="156" y2="258" strokeWidth="2.5"/>

              {/* ── Breathing group: body + laptop + legs ── */}
              <motion.g
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Torso */}
                <path d="M76,92 L146,92 L138,160 L84,160 Z" strokeWidth="2.5"/>
                {/* Neck */}
                <rect x="104" y="79" width="14" height="16" rx="2" strokeWidth="1.5"/>
                {/* Shirt crease */}
                <line x1="84" y1="120" x2="138" y2="120" strokeWidth="1" opacity="0.35"/>

                {/* Laptop base */}
                <rect x="80" y="162" width="62" height="13" rx="2" fill="#111111" strokeWidth="2"/>
                {/* Laptop screen */}
                <path d="M84,162 L80,122 L120,122 L124,162 Z" fill="#0d1117" strokeWidth="2"/>
                {/* Screen glow */}
                <rect x="84" y="126" width="32" height="30" rx="1" fill="#162032" stroke="none" opacity="0.7"/>
                {/* Code lines inside screen (projects only) */}
                {section === 'projects' && (
                  <>
                    <line x1="86" y1="132" x2="108" y2="132" strokeWidth="1.2" stroke="#4ade80" opacity="0.7"/>
                    <line x1="86" y1="138" x2="102" y2="138" strokeWidth="1.2" stroke="#4ade80" opacity="0.5"/>
                    <line x1="86" y1="144" x2="110" y2="144" strokeWidth="1.2" stroke="#4ade80" opacity="0.6"/>
                    <line x1="86" y1="150" x2="97"  y2="150" strokeWidth="1.2" stroke="#4ade80" opacity="0.4"/>
                  </>
                )}

                {/* Left leg */}
                <path d="M84,160 Q90,178 92,192 Q90,212 82,232" strokeWidth="2.5"/>
                <ellipse cx="80" cy="234" rx="11" ry="4.5" fill="#111" strokeWidth="1.5"/>
                {/* Right leg */}
                <path d="M130,160 Q132,180 132,192 Q134,212 150,232" strokeWidth="2.5"/>
                <ellipse cx="152" cy="234" rx="11" ry="4.5" fill="#111" strokeWidth="1.5"/>
              </motion.g>

              {/* ── Right arm (static — holds laptop) ── */}
              <path d="M140,96 Q152,118 154,142" strokeWidth="2.5"/>
              <path d="M154,142 Q150,158 142,164" strokeWidth="2.5"/>
              <ellipse cx="138" cy="166" rx="6" ry="4" strokeWidth="1.5"/>

              {/* ── Left arm (idea arm — section-driven) ── */}
              <motion.path
                animate={{ d: ARM[section].u }}
                transition={ARM_T}
                strokeWidth="2.5"
              />
              <motion.path
                animate={{ d: ARM[section].l }}
                transition={ARM_T}
                strokeWidth="2.5"
              />
              <motion.circle
                animate={{ cx: ARM[section].hx, cy: ARM[section].hy }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                r="5" strokeWidth="1.5"
              />
              {/* Pointing finger — only in projects */}
              <AnimatePresence>
                {section === 'projects' && (
                  <motion.line
                    key="finger"
                    x1={80} y1={26} x2={80} y2={10}
                    strokeWidth="2.2"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    style={{ transformOrigin: '80px 26px', transformBox: 'view-box' as React.CSSProperties['transformBox'] }}
                  />
                )}
              </AnimatePresence>

              {/* ── Head (cursor-tracking rotation) ── */}
              <motion.g
                style={{
                  rotate: headRotate,
                  transformOrigin: '111px 52px',
                  transformBox: 'view-box' as React.CSSProperties['transformBox'],
                }}
              >
                {/* Hair — rendered FIRST so it sits behind the face circle */}
                <path
                  d="M85,52 Q85,22 111,20 Q137,22 137,52 Q137,42 129,36 Q111,26 93,36 Q85,42 85,52 Z"
                  fill="currentColor" stroke="none" opacity="0.9"
                />
                {/* Head circle */}
                <circle cx="111" cy="52" r="28" strokeWidth="2.5"/>
                {/* Ear */}
                <path d="M84,48 Q79,53 84,60" strokeWidth="1.5"/>
                {/* Round glasses */}
                <circle cx="102" cy="54" r="9.5" strokeWidth="1.6"/>
                <circle cx="120" cy="54" r="9.5" strokeWidth="1.6"/>
                <line x1="111" y1="54" x2="112" y2="54" strokeWidth="1.5"/>
                <line x1="93"  y1="54" x2="85"  y2="52" strokeWidth="1.5"/>
                <line x1="130" y1="54" x2="138" y2="52" strokeWidth="1.5"/>
                {/* Nose */}
                <path d="M110,60 L108,65 L114,65" strokeWidth="1" opacity="0.55"/>
                {/* Mouth */}
                <path d="M106,70 Q111,73 116,70" strokeWidth="1.5" opacity="0.7"/>

                {/* Eyes (pupils) — cursor tracking */}
                <motion.g style={{ x: eyeOffsetX, y: eyeOffsetY }}>
                  <motion.circle
                    cx="102" cy="54" r="3.8"
                    fill="currentColor" stroke="none"
                    animate={BLINK_ANIM}
                    transition={BLINK_T}
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  />
                  <motion.circle
                    cx="120" cy="54" r="3.8"
                    fill="currentColor" stroke="none"
                    animate={BLINK_ANIM}
                    transition={BLINK_T}
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  />
                </motion.g>
              </motion.g>
            </svg>
          </motion.div>
        </div>
      </div>
    </>
  )
}

// React import needed for CSSProperties type reference
import React from 'react'
