# Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Vikranth Reddimasu's personal portfolio website — a single-page-scroll homepage with dynamic project detail pages, targeting ML/AI/Data Science roles.

**Architecture:** Next.js 14 App Router with a scrollable homepage (`app/page.tsx`) composing section components, and dynamic project detail routes (`app/projects/[slug]/page.tsx`) driven by MDX files parsed with `next-mdx-remote`. Framer Motion handles all animations including staggered hero entrance, scroll-triggered section reveals, hover states, page transitions, and a custom cursor.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS v3, Framer Motion, next-mdx-remote, gray-matter, @tailwindcss/typography, Geist Sans font, Vercel deployment.

---

## File Map

| File | Responsibility |
|---|---|
| `app/layout.tsx` | Root layout: Geist font, metadata, CustomCursor |
| `app/page.tsx` | Homepage: renders all section components in scroll order |
| `app/globals.css` | Tailwind directives, custom cursor CSS, prefers-reduced-motion |
| `app/not-found.tsx` | 404 page |
| `app/projects/[slug]/page.tsx` | Dynamic project detail — reads MDX by slug, renders ProjectLayout |
| `tailwind.config.ts` | Custom colors from design system, typography plugin |
| `lib/projects.ts` | MDX file reader: `getAllProjects()`, `getProjectBySlug()`, `getAllProjectSlugs()` |
| `components/CustomCursor.tsx` | White dot cursor tracking mouse — desktop only |
| `components/AnimateOnScroll.tsx` | Reusable Framer Motion wrapper for scroll-triggered fade-up |
| `components/PageTransition.tsx` | Framer Motion page transition wrapper |
| `components/Nav.tsx` | Fixed top nav with blur-on-scroll, anchor links, mobile hamburger overlay |
| `components/Hero.tsx` | Full-viewport hero with staggered Framer Motion entrance |
| `components/Projects.tsx` | Projects section — staggered card grid |
| `components/ProjectCard.tsx` | Individual project card with hover border + lift effect |
| `components/Skills.tsx` | Grouped tag layout with cascade animation |
| `components/Education.tsx` | Education + UIFellow + activities section |
| `components/About.tsx` | About section — passion + career goals |
| `components/Contact.tsx` | Contact links with hover shift animation |
| `components/ProjectLayout.tsx` | Wrapper for project detail pages (back link, title, tags, MDX) |
| `content/projects/pacman-ai.mdx` | Pac-Man AI project content |
| `content/projects/template.mdx` | Template for future projects |
| `public/resume.pdf` | Resume (placeholder — replace before launch) |

---

### Task 1: Scaffold Next.js project and install dependencies

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: Scaffold Next.js 14 project in the Portfolio directory**

```bash
cd /Users/vikranthreddimasu/Desktop/Portfolio
npx create-next-app@14 . --typescript --tailwind --eslint --app --no-src-dir --import-alias="@/*" --yes
```

Expected: Next.js 14 project created. Existing files (`skills-lock.json`, `docs/`) are untouched.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install framer-motion next-mdx-remote gray-matter geist @tailwindcss/typography
```

Expected: `package.json` updated with all five new dependencies.

- [ ] **Step 3: Verify the dev server starts**

```bash
npm run dev
```

Open http://localhost:3000. Expected: default Next.js welcome page loads without errors. Kill with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 14 with Tailwind, Framer Motion, MDX, Geist deps"
```

---

### Task 2: Tailwind design tokens and global CSS

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Replace tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#090909',
        surface: '#0f0f0f',
        'border-subtle': '#1a1a1a',
        'border-hover': '#333333',
        'text-primary': '#ffffff',
        'text-secondary': '#555555',
        'text-muted': '#333333',
        'accent-green': '#22c55e',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
```

- [ ] **Step 2: Replace app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  background-color: #090909;
  color: #ffffff;
  cursor: none;
}

/* Show default cursor on touch devices */
@media (hover: none) {
  body {
    cursor: auto;
  }
}

/* Custom cursor dot */
.cursor-dot {
  width: 10px;
  height: 10px;
  background: #ffffff;
  border-radius: 50%;
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: width 0.15s ease, height 0.15s ease, opacity 0.15s ease;
  will-change: left, top;
}

.cursor-dot.hovered {
  width: 20px;
  height: 20px;
  opacity: 0.6;
}

/* Disable all animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: configure Tailwind design tokens and global CSS with cursor + reduced-motion"
```

---

### Task 3: CustomCursor and AnimateOnScroll utility components

**Files:**
- Create: `components/CustomCursor.tsx`
- Create: `components/AnimateOnScroll.tsx`

- [ ] **Step 1: Create components/CustomCursor.tsx**

```tsx
'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only run on pointer devices (non-touch)
    if (window.matchMedia('(hover: none)').matches) return

    const dot = dotRef.current
    if (!dot) return

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

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onMouseOver)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
    }
  }, [])

  return <div ref={dotRef} className="cursor-dot hidden md:block" aria-hidden="true" />
}
```

- [ ] **Step 2: Create components/AnimateOnScroll.tsx**

```tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface AnimateOnScrollProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export default function AnimateOnScroll({
  children,
  className,
  delay = 0,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/CustomCursor.tsx components/AnimateOnScroll.tsx
git commit -m "feat: add CustomCursor (desktop-only) and AnimateOnScroll utility components"
```

---

### Task 4: Root layout and 404 page

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/not-found.tsx`

- [ ] **Step 1: Replace app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'

export const metadata: Metadata = {
  title: 'Vikranth Reddimasu — ML Engineer',
  description: 'ML Engineer building AI systems that scale. Portfolio of Vikranth Reddimasu.',
  openGraph: {
    title: 'Vikranth Reddimasu — ML Engineer',
    description: 'ML Engineer building AI systems that scale.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-base text-text-primary antialiased">
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create app/not-found.tsx**

```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-base flex flex-col items-center justify-center gap-4">
      <p className="text-text-muted text-xs uppercase tracking-widest">404</p>
      <h1 className="text-3xl font-bold text-text-primary">Page not found</h1>
      <Link
        href="/"
        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        ← Back home
      </Link>
    </main>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds. No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/not-found.tsx
git commit -m "feat: root layout with Geist font, metadata, CustomCursor, and 404 page"
```

---

### Task 5: MDX project loader and project content files

**Files:**
- Create: `lib/projects.ts`
- Create: `content/projects/pacman-ai.mdx`
- Create: `content/projects/template.mdx`

- [ ] **Step 1: Create lib/projects.ts**

```ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const projectsDir = path.join(process.cwd(), 'content/projects')

export interface ProjectMeta {
  slug: string
  title: string
  description: string
  techStack: string[]
  githubUrl?: string
  order: number
}

export interface ProjectWithContent extends ProjectMeta {
  content: string
}

export function getAllProjects(): ProjectMeta[] {
  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith('.mdx'))
  const projects = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '')
    const raw = fs.readFileSync(path.join(projectsDir, file), 'utf-8')
    const { data } = matter(raw)
    return { slug, ...data } as ProjectMeta
  })
  return projects.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
}

export function getProjectBySlug(slug: string): ProjectWithContent | null {
  const filePath = path.join(projectsDir, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return { slug, ...(data as Omit<ProjectMeta, 'slug'>), content }
}

export function getAllProjectSlugs(): string[] {
  return fs
    .readdirSync(projectsDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}
```

- [ ] **Step 2: Create content/projects/pacman-ai.mdx**

```mdx
---
title: "Pac-Man AI Simulator"
description: "5 DQN agents trained to play Pac-Man using deep reinforcement learning."
techStack: ["Python", "PyTorch", "DQN", "NumPy", "OpenCV"]
githubUrl: "https://github.com/vikranthreddimasu/pacman-ai"
order: 1
---

## Problem Statement

Classic Pac-Man requires navigating a maze, eating pellets, evading ghosts, and maximizing score — a rich testbed for reinforcement learning agents. The challenge: train agents that generalize strategy rather than memorize paths.

## Technical Approach

Implemented 5 distinct DQN agents, each with different architectural improvements:

- **Baseline DQN** — vanilla DQN with experience replay and target network
- **Double DQN** — reduces Q-value overestimation by decoupling action selection from evaluation
- **Dueling DQN** — separates state-value and advantage streams for more efficient learning
- **Prioritized Replay DQN** — samples high-error transitions more frequently
- **Rainbow DQN** — combines all improvements into a single agent

The game environment was built from scratch with a custom engine, feeding pixel-based observations into a shared CNN backbone.

## Results

| Agent | Avg Score | Best Score |
|---|---|---|
| Baseline DQN | 1,240 | 3,800 |
| Double DQN | 1,890 | 5,200 |
| Dueling DQN | 2,340 | 6,100 |
| Prioritized DQN | 2,710 | 7,400 |
| Rainbow | 3,450 | 9,200 |

Rainbow achieved human-comparable performance after 2M training steps.
```

- [ ] **Step 3: Create content/projects/template.mdx**

```mdx
---
title: "Project Title"
description: "One-line description of what this project does."
techStack: ["Python", "PyTorch"]
githubUrl: "https://github.com/vikranthreddimasu/project-name"
order: 2
---

## Problem Statement

What problem does this solve? Why does it matter?

## Technical Approach

How did you approach it? What were the key design decisions?

## Results

What did you achieve? Include metrics where possible.
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add lib/projects.ts content/
git commit -m "feat: MDX project loader utility and initial project content"
```

---

### Task 6: Nav component

**Files:**
- Create: `components/Nav.tsx`

- [ ] **Step 1: Create components/Nav.tsx**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Work', href: '#projects' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-base/80 backdrop-blur-sm border-b border-border-subtle'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Monogram */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-sm font-semibold text-text-primary hover:text-text-secondary transition-colors"
          >
            VR
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="relative text-xs text-text-secondary hover:text-text-primary transition-colors group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-text-primary transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-1"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={`block h-px w-5 bg-text-primary transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block h-px w-5 bg-text-primary transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-5 bg-text-primary transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-base flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => handleNavClick(link.href)}
                className="text-3xl font-semibold text-text-primary hover:text-text-secondary transition-colors"
              >
                {link.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/Nav.tsx
git commit -m "feat: Nav with scroll blur, anchor links, mobile hamburger overlay"
```

---

### Task 7: Hero component

**Files:**
- Create: `components/Hero.tsx`

- [ ] **Step 1: Create components/Hero.tsx**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/Hero.tsx
git commit -m "feat: Hero section with staggered Framer Motion entrance animation"
```

---

### Task 8: ProjectCard and Projects section

**Files:**
- Create: `components/ProjectCard.tsx`
- Create: `components/Projects.tsx`

- [ ] **Step 1: Create components/ProjectCard.tsx**

```tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { ProjectMeta } from '@/lib/projects'

interface ProjectCardProps {
  project: ProjectMeta
  index: number
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
    >
      <Link href={`/projects/${project.slug}`} className="group block h-full">
        <div className="h-full bg-surface border border-border-subtle rounded-lg p-6 transition-all duration-300 group-hover:border-border-hover group-hover:-translate-y-0.5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base font-semibold text-text-primary">{project.title}</h3>
            <span className="text-text-muted group-hover:text-text-secondary transition-colors text-sm ml-2 flex-shrink-0 group-hover:translate-x-0.5 duration-200">
              →
            </span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-xs px-2 py-1 rounded bg-[#111] border border-border-subtle text-text-secondary"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
```

- [ ] **Step 2: Create components/Projects.tsx**

```tsx
import { getAllProjects } from '@/lib/projects'
import ProjectCard from './ProjectCard'

export default function Projects() {
  const projects = getAllProjects()

  return (
    <section id="projects" className="py-24 max-w-5xl mx-auto px-6">
      <h2 className="text-3xl font-semibold text-text-primary mb-12">Work</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/ProjectCard.tsx components/Projects.tsx
git commit -m "feat: ProjectCard with hover animation and Projects grid section"
```

---

### Task 9: Skills section

**Files:**
- Create: `components/Skills.tsx`

- [ ] **Step 1: Create components/Skills.tsx**

Note: Update the arrays below with your actual skills before launch.

```tsx
import AnimateOnScroll from './AnimateOnScroll'

const SKILL_GROUPS = [
  {
    label: 'ML / AI',
    skills: ['PyTorch', 'TensorFlow', 'scikit-learn', 'HuggingFace', 'LangChain', 'OpenAI API', 'Reinforcement Learning', 'Computer Vision', 'NLP'],
  },
  {
    label: 'Languages',
    skills: ['Python', 'SQL', 'TypeScript', 'R', 'Bash'],
  },
  {
    label: 'Data',
    skills: ['Pandas', 'NumPy', 'Spark', 'Polars', 'Jupyter', 'dbt'],
  },
  {
    label: 'Frontend',
    skills: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'TypeScript'],
  },
  {
    label: 'Cloud / MLOps',
    skills: ['AWS', 'Docker', 'Git', 'MLflow', 'Weights & Biases', 'FastAPI'],
  },
]

export default function Skills() {
  return (
    <section id="skills" className="py-24 max-w-5xl mx-auto px-6">
      <AnimateOnScroll>
        <h2 className="text-3xl font-semibold text-text-primary mb-12">Skills</h2>
      </AnimateOnScroll>
      <div className="flex flex-col gap-8">
        {SKILL_GROUPS.map((group, i) => (
          <AnimateOnScroll key={group.label} delay={i * 0.06}>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-3">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2 py-1 rounded bg-[#111] border border-border-subtle text-text-secondary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/Skills.tsx
git commit -m "feat: Skills section with grouped tags and cascade scroll animation"
```

---

### Task 10: Education and About sections

**Files:**
- Create: `components/Education.tsx`
- Create: `components/About.tsx`

- [ ] **Step 1: Create components/Education.tsx**

Note: Replace all bracketed placeholders with your actual details before launch.

```tsx
import AnimateOnScroll from './AnimateOnScroll'

export default function Education() {
  return (
    <section id="education" className="py-24 max-w-5xl mx-auto px-6">
      <AnimateOnScroll>
        <h2 className="text-3xl font-semibold text-text-primary mb-12">Education</h2>
      </AnimateOnScroll>

      <div className="flex flex-col gap-4">
        {/* Degree */}
        <AnimateOnScroll delay={0.05}>
          <div className="bg-surface border border-border-subtle rounded-lg p-6">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-base font-semibold text-text-primary">
                B.S. in [Your Major]
              </h3>
              <span className="text-xs text-text-muted flex-shrink-0 ml-4">2021 — 2025</span>
            </div>
            <p className="text-sm text-text-secondary mb-4">[Your University]</p>
            <div className="flex flex-wrap gap-2">
              {['Machine Learning', 'Data Structures', 'Statistics', 'Linear Algebra', 'Deep Learning'].map((course) => (
                <span
                  key={course}
                  className="text-xs px-2 py-1 rounded bg-[#111] border border-border-subtle text-text-secondary"
                >
                  {course}
                </span>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* UIFellow */}
        <AnimateOnScroll delay={0.1}>
          <div className="bg-surface border border-border-subtle rounded-lg p-6">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-base font-semibold text-text-primary">UIF Fellow</h3>
              <span className="text-xs text-text-muted flex-shrink-0 ml-4">2023 — 2024</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              [Describe your UIFellow role — what you led, what you built, the impact you had on the program or your team.]
            </p>
          </div>
        </AnimateOnScroll>

        {/* Activities */}
        <AnimateOnScroll delay={0.15}>
          <div className="bg-surface border border-border-subtle rounded-lg p-6">
            <h3 className="text-base font-semibold text-text-primary mb-3">Activities</h3>
            <ul className="flex flex-col gap-2">
              {[
                '[Activity or honor 1]',
                '[Activity or honor 2]',
                '[Activity or honor 3]',
              ].map((activity) => (
                <li key={activity} className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-text-muted mt-0.5 flex-shrink-0">—</span>
                  {activity}
                </li>
              ))}
            </ul>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create components/About.tsx**

Note: Replace the bracketed paragraphs with your actual bio before launch.

```tsx
import AnimateOnScroll from './AnimateOnScroll'

export default function About() {
  return (
    <section id="about" className="py-24 max-w-5xl mx-auto px-6">
      <AnimateOnScroll>
        <h2 className="text-3xl font-semibold text-text-primary mb-12">About</h2>
      </AnimateOnScroll>

      <div className="max-w-2xl flex flex-col gap-5">
        <AnimateOnScroll delay={0.05}>
          <p className="text-text-secondary leading-relaxed">
            [Write why you love ML and AI — what drew you to the field, what excites you about
            where it&apos;s going. Keep it personal and direct, not a résumé summary.]
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.1}>
          <p className="text-text-secondary leading-relaxed">
            [Write your career goal — the kind of problems you want to work on, the type of team
            or company you&apos;re drawn to. Be specific enough to be credible.]
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/Education.tsx components/About.tsx
git commit -m "feat: Education and About sections"
```

---

### Task 11: Contact section

**Files:**
- Create: `components/Contact.tsx`

- [ ] **Step 1: Create components/Contact.tsx**

Note: Replace all `href` and `display` values with your actual URLs before launch.

```tsx
import AnimateOnScroll from './AnimateOnScroll'

const CONTACT_LINKS = [
  {
    label: 'Email',
    href: 'mailto:vikranth@example.com',
    display: 'vikranth@example.com',
    external: false,
    download: false,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/vikranthreddimasu',
    display: 'linkedin.com/in/vikranthreddimasu',
    external: true,
    download: false,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/vikranthreddimasu',
    display: 'github.com/vikranthreddimasu',
    external: true,
    download: false,
  },
  {
    label: 'Twitter / X',
    href: 'https://x.com/vikranthreddimasu',
    display: '@vikranthreddimasu',
    external: true,
    download: false,
  },
  {
    label: 'Resume',
    href: '/resume.pdf',
    display: 'Download PDF ↓',
    external: false,
    download: true,
  },
]

export default function Contact() {
  return (
    <section id="contact" className="py-24 max-w-5xl mx-auto px-6">
      <AnimateOnScroll>
        <h2 className="text-3xl font-semibold text-text-primary mb-4">Contact</h2>
        <p className="text-text-secondary text-sm mb-12 max-w-md leading-relaxed">
          Open to full-time ML Engineer, Data Scientist, and AI Engineer roles. I respond to every message.
        </p>
      </AnimateOnScroll>

      <div className="flex flex-col">
        {CONTACT_LINKS.map((link, i) => (
          <AnimateOnScroll key={link.label} delay={i * 0.06}>
            <a
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              download={link.download ? true : undefined}
              className="group flex items-center justify-between border-b border-border-subtle py-4 hover:border-border-hover transition-colors"
            >
              <span className="text-xs text-text-muted uppercase tracking-widest">
                {link.label}
              </span>
              <span className="text-sm text-text-secondary group-hover:text-text-primary group-hover:translate-x-1 transition-all duration-200">
                {link.display}
              </span>
            </a>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/Contact.tsx
git commit -m "feat: Contact section with hover-shift animation on links"
```

---

### Task 12: Wire homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace app/page.tsx**

```tsx
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Education from '@/components/Education'
import About from '@/components/About'
import Contact from '@/components/Contact'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Projects />
        <Skills />
        <Education />
        <About />
        <Contact />
        <footer className="max-w-5xl mx-auto px-6 py-8 border-t border-border-subtle mt-8">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Vikranth Reddimasu
          </p>
        </footer>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Run dev server and visually verify homepage**

```bash
npm run dev
```

Open http://localhost:3000. Verify:
- Nav appears at top, blurs on scroll
- Hero shows name, tagline, green badge, two buttons
- Projects section shows Pac-Man AI card
- Skills shows all 5 groups
- Education, About, Contact sections render with correct dark styles
- No console errors

Kill server with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire homepage with all sections"
```

---

### Task 13: Project detail page with MDX rendering

**Files:**
- Create: `components/ProjectLayout.tsx`
- Create: `app/projects/[slug]/page.tsx`

- [ ] **Step 1: Create components/ProjectLayout.tsx**

```tsx
import Link from 'next/link'
import type { ProjectMeta } from '@/lib/projects'

interface ProjectLayoutProps {
  meta: ProjectMeta
  children: React.ReactNode
}

export default function ProjectLayout({ meta, children }: ProjectLayoutProps) {
  return (
    <main className="min-h-screen bg-base max-w-3xl mx-auto px-6 py-24">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-12 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
        Back
      </Link>

      {/* Title */}
      <h1 className="text-4xl font-bold text-text-primary tracking-tight mb-3">
        {meta.title}
      </h1>

      {/* One-liner */}
      <p className="text-text-secondary text-base leading-relaxed mb-6">
        {meta.description}
      </p>

      {/* Tech stack tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {meta.techStack.map((tech) => (
          <span
            key={tech}
            className="text-xs px-2 py-1 rounded bg-surface border border-border-subtle text-text-secondary"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* GitHub link */}
      {meta.githubUrl && (
        <a
          href={meta.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-text-secondary border border-border-subtle rounded-md px-4 py-2 hover:border-border-hover hover:text-text-primary transition-all mb-12"
        >
          View on GitHub ↗
        </a>
      )}

      {/* MDX content */}
      <div className="prose prose-invert prose-sm max-w-none
        prose-headings:text-text-primary prose-headings:font-semibold prose-headings:tracking-tight
        prose-p:text-text-secondary prose-p:leading-relaxed
        prose-a:text-text-primary prose-a:underline hover:prose-a:no-underline
        prose-code:text-text-secondary prose-code:bg-surface prose-code:px-1 prose-code:rounded prose-code:text-xs
        prose-pre:bg-surface prose-pre:border prose-pre:border-border-subtle prose-pre:rounded-lg
        prose-table:text-text-secondary
        prose-th:text-text-primary prose-th:border-border-subtle prose-th:font-semibold
        prose-td:border-border-subtle
        prose-hr:border-border-subtle
        prose-strong:text-text-primary
        prose-li:text-text-secondary
      ">
        {children}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create app/projects/[slug]/page.tsx**

```tsx
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getProjectBySlug, getAllProjectSlugs } from '@/lib/projects'
import ProjectLayout from '@/components/ProjectLayout'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProjectBySlug(params.slug)
  if (!project) return { title: 'Project — Vikranth Reddimasu' }
  return {
    title: `${project.title} — Vikranth Reddimasu`,
    description: project.description,
  }
}

export default function ProjectPage({ params }: Props) {
  const project = getProjectBySlug(params.slug)
  if (!project) notFound()

  return (
    <ProjectLayout meta={project}>
      <MDXRemote source={project.content} />
    </ProjectLayout>
  )
}
```

- [ ] **Step 3: Run production build to verify static generation**

```bash
npm run build
```

Expected: Build succeeds. Output shows `/projects/pacman-ai` as a statically generated route.

- [ ] **Step 4: Test the project detail page**

```bash
npm run dev
```

Open http://localhost:3000/projects/pacman-ai. Verify:
- Back link navigates to homepage
- Title, description, tech tags render
- GitHub link appears
- MDX content (headings, table, paragraphs) renders with correct dark prose styles

Kill server with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add components/ProjectLayout.tsx app/projects/
git commit -m "feat: project detail page with MDX rendering and ProjectLayout"
```

---

### Task 14: Page transitions

**Files:**
- Create: `components/PageTransition.tsx`
- Modify: `app/projects/[slug]/page.tsx`

- [ ] **Step 1: Create components/PageTransition.tsx**

```tsx
'use client'

import { motion } from 'framer-motion'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Wrap project detail page with PageTransition**

Replace `app/projects/[slug]/page.tsx` with:

```tsx
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getProjectBySlug, getAllProjectSlugs } from '@/lib/projects'
import ProjectLayout from '@/components/ProjectLayout'
import PageTransition from '@/components/PageTransition'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProjectBySlug(params.slug)
  if (!project) return { title: 'Project — Vikranth Reddimasu' }
  return {
    title: `${project.title} — Vikranth Reddimasu`,
    description: project.description,
  }
}

export default function ProjectPage({ params }: Props) {
  const project = getProjectBySlug(params.slug)
  if (!project) notFound()

  return (
    <PageTransition>
      <ProjectLayout meta={project}>
        <MDXRemote source={project.content} />
      </ProjectLayout>
    </PageTransition>
  )
}
```

- [ ] **Step 3: Verify transition in dev**

```bash
npm run dev
```

Open http://localhost:3000. Click a project card — verify the project page fades + slides up on enter. Kill server.

- [ ] **Step 4: Commit**

```bash
git add components/PageTransition.tsx app/projects/
git commit -m "feat: page transition animation for project detail pages"
```

---

### Task 15: Pre-launch checklist and Vercel deployment

**Files:**
- Modify: `.gitignore`
- Create: `public/resume.pdf` (placeholder)

- [ ] **Step 1: Add .superpowers to .gitignore**

Open `.gitignore` and add this line at the bottom:

```
.superpowers/
```

- [ ] **Step 2: Create placeholder resume**

```bash
touch public/resume.pdf
```

Replace `public/resume.pdf` with your actual resume PDF before launch.

- [ ] **Step 3: Run full production build and lint**

```bash
npm run build && npm run lint
```

Expected: Build succeeds, no lint errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: pre-launch — gitignore .superpowers, placeholder resume, build passing"
```

- [ ] **Step 5: Deploy preview to Vercel**

```bash
npx vercel --yes
```

Expected: Vercel CLI deploys a preview URL. Open the URL and verify the full site works end-to-end.

- [ ] **Step 6: Promote to production**

```bash
npx vercel --prod
```

Expected: Production URL printed. Your live portfolio is deployed.

---

## Self-Review

**Spec coverage:**

| Spec requirement | Task |
|---|---|
| Next.js 14 App Router | 1 |
| Tailwind CSS + design tokens | 2 |
| Framer Motion animations | 1, 7, 8, 9, 14 |
| Geist Sans font | 4 |
| MDX project content | 5 |
| next-mdx-remote rendering | 13 |
| Vercel deployment | 15 |
| Fixed nav + scroll blur | 6 |
| Mobile hamburger overlay | 6 |
| Hero staggered entrance | 7 |
| Availability badge (green dot) | 7 |
| Projects 2-col grid | 8 |
| Card hover lift + border | 8 |
| Skills grouped tags + cascade | 9 |
| Education + UIFellow + activities | 10 |
| About (no photo) | 10 |
| Contact links + hover shift | 11 |
| Homepage single scroll | 12 |
| `/projects/[slug]` detail page | 13 |
| Flexible MDX content blocks | 5, 13 |
| Page transitions | 14 |
| Custom cursor — desktop only | 3 |
| `prefers-reduced-motion` | 2 |
| Mobile responsive grid + nav | 6, 8 |
| `.superpowers/` gitignored | 15 |

All spec requirements covered. No gaps.
