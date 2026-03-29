'use client'

import { motion } from 'framer-motion'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center max-w-5xl mx-auto px-6 pt-14">
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
          className="text-text-secondary text-base md:text-lg max-w-md leading-relaxed"
        >
          ML Engineer building AI systems that scale.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-text-primary text-base px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-white/90 transition-colors"
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
    </section>
  )
}
