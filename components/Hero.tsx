'use client'

import { motion } from 'framer-motion'
import HeroBackground from './HeroBackground'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function Hero() {
  return (
    <section className="relative min-h-screen">
      <HeroBackground />
      {/* Left-fade gradient — darkens text zone, lets attractor breathe on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#090909] via-[#090909]/50 to-transparent pointer-events-none z-[1]" />
      <div className="relative z-10 flex flex-col justify-center min-h-screen max-w-5xl mx-auto px-6 pt-14">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* Availability + AI-readable badges */}
          <motion.div variants={item} className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-2 bg-surface border border-border-subtle rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green inline-block" />
              <span className="text-xs text-text-secondary tracking-widest uppercase">
                Open to work
              </span>
            </span>
            <span
              title="This portfolio includes structured data for AI assistants at /llms.txt"
              className="inline-flex items-center gap-1.5 bg-surface border border-border-subtle rounded-full px-3 py-1.5 cursor-default"
            >
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className="text-text-secondary" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <circle cx="5" cy="5" r="4"/>
                <path d="M2.5 5h5M5 2.5v5"/>
              </svg>
              <span className="text-xs text-text-secondary tracking-widest uppercase">AI-readable</span>
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            variants={item}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none text-text-primary"
          >
            Vikranth
            <br />
            Reddimasu
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={item}
            className="text-text-secondary text-lg md:text-xl max-w-md leading-relaxed"
          >
            ML Engineer building AI systems that scale.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-text-primary text-[#090909] px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              View Work
            </button>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-border-subtle text-text-secondary px-5 py-2.5 rounded-md text-sm hover:border-border-hover hover:text-text-primary transition-all"
            >
              Resume ↗
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Clifford attractor annotation — trigger always visible, card on hover */}
      <div className="absolute bottom-16 right-6 z-10 group cursor-default select-none">
        {/* Info card — floats above the trigger */}
        <div className="absolute bottom-full right-0 mb-3 w-72 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-4">
            <p className="text-sm font-semibold text-white/80 mb-2">Clifford Strange Attractor</p>
            <p className="text-xs text-white/50 leading-relaxed mb-3">
              A chaotic dynamical system — parameters shift slowly over time, paths form and dissolve as the shape breathes and morphs. It never repeats.
            </p>
            <div className="border-t border-white/5 pt-3 font-mono text-xs text-white/30 space-y-0.5">
              <p>x = sin(a·y) + c·cos(a·x)</p>
              <p>y = sin(b·x) + d·cos(b·y)</p>
              <p className="pt-1 text-white/20">a, b, c, d shift slowly over time</p>
            </div>
          </div>
        </div>

        {/* Trigger label */}
        <p className="text-xs font-mono tracking-wider text-white/25 group-hover:text-white/60 transition-colors duration-300 text-right">
          Clifford Attractor
        </p>
      </div>
    </section>
  )
}
