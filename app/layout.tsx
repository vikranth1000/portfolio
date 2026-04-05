import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'
import ConsoleMessage from '@/components/ConsoleMessage'
import KonamiCode from '@/components/KonamiCode'
import CommandPalette from '@/components/CommandPalette'
import KeyboardHint from '@/components/KeyboardHint'
import ScrollProgress from '@/components/ScrollProgress'
import SmoothScroll from '@/components/SmoothScroll'
import AskMeAnything from '@/components/AskMeAnything'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'Vikranth Reddimasu — ML Engineer',
  description: 'ML Engineer building AI systems that scale. Portfolio of Vikranth Reddimasu.',
  metadataBase: new URL('https://vikranthreddimasu.xyz'),
  openGraph: {
    title: 'Vikranth Reddimasu — ML Engineer',
    description: 'ML Engineer building AI systems that scale.',
    type: 'website',
    url: 'https://vikranthreddimasu.xyz',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Vikranth Reddimasu — ML Engineer' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vikranth Reddimasu — ML Engineer',
    description: 'ML Engineer building AI systems that scale.',
    images: ['/og.png'],
  },
  alternates: {
    types: {
      'text/plain': '/llms.txt',
    },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Vikranth Reddimasu',
  jobTitle: 'ML Engineer',
  description: 'ML Engineer and Data Scientist building AI systems that scale.',
  url: 'https://vikranthreddimasu.xyz',
  email: 'vikranthreddimasu@gmail.com',
  sameAs: [
    'https://github.com/vikranthreddimasu',
    'https://linkedin.com/in/vikranthreddimasu',
  ],
  knowsAbout: [
    'Machine Learning',
    'Deep Learning',
    'Generative AI',
    'Agentic AI',
    'Large Language Models',
    'RAG',
    'Reinforcement Learning',
    'Natural Language Processing',
    'Distributed Training',
    'LangGraph',
    'PyTorch',
    'Python',
    'FastAPI',
    'Data Science',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-base text-text-primary antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll>
          <ScrollProgress />
          <CustomCursor />
          <ConsoleMessage />
          <KonamiCode />
          <CommandPalette />
          <KeyboardHint />
          <AskMeAnything />
          {children}
          <SpeedInsights />
        </SmoothScroll>
      </body>
    </html>
  )
}
