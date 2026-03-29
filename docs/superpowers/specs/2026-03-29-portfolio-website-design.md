# Portfolio Website — Design Specification

**Author:** Vikranth Reddimasu
**Date:** 2026-03-29
**Status:** Approved

---

## Overview

A personal portfolio website for Vikranth Reddimasu, targeting ML Engineer / Data Scientist / AI Engineer roles. The site doubles as a demonstration of UI/UX skill — the design itself is part of the portfolio. The visual aesthetic is premium dark (Vercel/Linear-inspired): true black, white text, subtle borders, zero gradients, zero color except a single green availability dot.

**Primary goal:** Convert recruiter/hiring manager visits into interview conversations.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Content | MDX files (per project) |
| Font | Geist Sans |
| Deployment | Vercel (free tier) |
| Domain | `*.vercel.app` (free subdomain) |

---

## Site Architecture

### Routing

- `/` — single-page scroll homepage containing all main sections
- `/projects/[slug]` — individual project detail pages, each driven by an MDX file

### File Structure

```
app/
  page.tsx                  ← homepage (all sections)
  projects/
    [slug]/
      page.tsx              ← dynamic project detail
  layout.tsx                ← root layout, font, metadata
content/
  projects/
    *.mdx                   ← one file per project
components/
  Nav.tsx
  Hero.tsx
  Projects.tsx
  ProjectCard.tsx
  Skills.tsx
  Education.tsx
  About.tsx
  Contact.tsx
lib/
  projects.ts               ← MDX loader utility
public/
  resume.pdf
```

---

## Sections

### 1. Navigation

- Fixed top bar, full width
- Backdrop blur activates on scroll (`backdrop-blur-sm` + slight bg opacity)
- Left: `VR` monogram in `font-semibold`
- Right: `Work · About · Contact` — scroll-to-anchor links
- Mobile: hamburger menu collapsing to a full-screen overlay nav

### 2. Hero

Full viewport height (`min-h-screen`). Content vertically centered or upper-third aligned.

**Content:**
- Availability badge: green dot (`#22c55e`) + "Open to work" — the only color on the page
- Name: `Vikranth Reddimasu` — large, bold, tight tracking
- Tagline: *"ML Engineer building AI systems that scale."*
- Two CTAs: `View Work` (solid white button) / `Resume ↗` (ghost button)

**Animation:** Staggered entrance — badge → name → tagline → CTAs, each offset by ~100ms.

### 3. Projects

Grid of 4–6 project cards (2-column on desktop, 1-column on mobile).

**Project card content:**
- Project name
- One-line description
- Tech stack tags (pill style, `bg-[#111] border-[#1f1f1f]`)
- Arrow link → `/projects/[slug]`

**Hover:** Border brightens (`#1a1a1a` → `#333333`) + subtle `translateY(-2px)` lift.

**Animation:** Cards stagger in on scroll entry.

### 4. Skills / Tech Stack

Grouped tag layout. Categories:

- **ML / AI** — PyTorch, TensorFlow, scikit-learn, HuggingFace, LangChain, etc.
- **Languages** — Python, SQL, TypeScript, R, etc.
- **Data** — Pandas, NumPy, Spark, dbt, etc.
- **Frontend** — React, Next.js, Tailwind CSS, Framer Motion
- **Cloud / MLOps** — AWS, Docker, Git, MLflow, etc.

Each tag: `bg-[#111] border border-[#1f1f1f] text-[#888] text-xs px-2 py-1 rounded`.

No proficiency bars — honest and uncluttered.

**Animation:** Tag rows cascade in on scroll.

### 5. Education

- Degree, university name, graduation year
- UIFellow role highlighted as a leadership distinction
- Notable activities from bachelor's (relevant extracurriculars, honors, etc.)

### 6. About

2–3 short paragraphs (no photo). Content:
- Why ML and AI — personal motivation, what draws Vikranth to the field
- Career goal — the kind of role and impact he's seeking

Tone: direct and authentic, not a résumé restatement.

### 7. Contact

Simple layout — no contact form. Links only:

- Email
- LinkedIn
- GitHub
- Twitter / X
- Resume (PDF download)

**Hover animation:** Icon + text shift right by 4px on hover.

---

## Project Detail Pages (`/projects/[slug]`)

Each page is rendered from an MDX file. Content is **flexible per project** — not every project uses every block. Available content blocks:

| Block | When to use |
|---|---|
| Problem statement / motivation | All projects |
| Technical approach & architecture | All projects |
| Tech stack tags | All projects |
| GitHub repo link | Most projects |
| GIF / demo recording | Interactive or visual projects |
| Screenshots | Visual projects |
| Results / metrics | ML models, data projects |

**Page layout:**
- Back link → `/`
- Title + one-liner
- Tech stack tag row
- Flexible MDX content below

**Page transition:** Fade + slight upward slide on navigate in; reverse on back.

---

## Visual System

### Colors

| Token | Value | Usage |
|---|---|---|
| `bg-base` | `#090909` | Page background |
| `bg-surface` | `#0f0f0f` | Cards, surfaces |
| `border-subtle` | `#1a1a1a` | Default borders |
| `border-hover` | `#333333` | Hovered borders |
| `text-primary` | `#ffffff` | Headings, names |
| `text-secondary` | `#555555` | Body, descriptions |
| `text-muted` | `#333333` | Labels, captions |
| `accent-green` | `#22c55e` | Availability dot only |

### Typography (Geist Sans)

| Element | Class |
|---|---|
| Hero name | `text-6xl font-bold tracking-tight` |
| Section headings | `text-3xl font-semibold` |
| Card titles | `text-lg font-semibold` |
| Body text | `text-sm leading-relaxed` |
| Tags / labels | `text-xs uppercase tracking-widest` |

### Spacing

- Section padding: `py-24` (96px top/bottom)
- Content max-width: `max-w-5xl mx-auto px-6`
- Card gap: `gap-4` or `gap-6`

---

## Animations

All animations use Framer Motion. All respect `prefers-reduced-motion`.

| Interaction | Behavior |
|---|---|
| Hero entrance | Staggered fade-up, 100ms offsets per element |
| Section entry | Fade-up on scroll (`useInView`) |
| Project cards | Stagger in as grid enters viewport |
| Skills tags | Row-by-row cascade on scroll entry |
| Card hover | `translateY(-2px)` + border brighten |
| Nav links | Underline slides in from left |
| CTA buttons | Background/border invert on hover |
| Contact links | Icon + text shift right 4px |
| Page transition | Fade + upward slide, reversed on back |
| Custom cursor | Small white dot, scales up on hover targets — **desktop only**, hidden on touch devices |

Framer Motion is lazy-loaded to keep it out of the critical bundle.

MDX rendering uses `next-mdx-remote` (the standard for App Router MDX).

---

## Mobile Responsiveness

- Nav: hamburger → full-screen overlay
- Hero: font scales down (`text-4xl` on mobile)
- Projects grid: 2-col → 1-col
- Skills: wrapping flex — no layout change needed
- All section padding reduces on mobile (`py-16`)

---

## Out of Scope

- Contact form (links only)
- Blog / writing section
- CMS / admin interface
- Analytics (can be added post-launch with Vercel Analytics)
- Dark/light mode toggle (dark only)
- Kaggle profile link
