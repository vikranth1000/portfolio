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
      <div className="relative z-10 flex flex-col justify-center min-h-screen max-w-5xl mx-auto px-6 pt-14">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* Availability badge */}
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 bg-surface border border-border-subtle rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green inline-block" />
              <span className="text-xs text-text-secondary tracking-widest uppercase">
                Open to work
              </span>
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

      {/* Clifford attractor annotation — dim always, expands on hover */}
      <div className="absolute bottom-8 right-8 z-10 text-right group cursor-default select-none">
        <p className="text-[11px] font-mono tracking-wider text-white/15 group-hover:text-white/50 transition-colors duration-300">
          Clifford Attractor
        </p>
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500">
          <div className="overflow-hidden">
            <div className="pt-2 text-[10px] font-mono leading-relaxed space-y-0.5">
              <p className="text-white/35">x = sin(Ay) + C·cos(Ax)</p>
              <p className="text-white/35">y = sin(Bx) + D·cos(By)</p>
              <p className="pt-1 text-white/20">A=−1.4  B=1.6  C=1.0  D=0.7</p>
              <p className="text-white/20">160,000 iterations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
