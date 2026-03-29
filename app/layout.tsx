import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'
import ConsoleMessage from '@/components/ConsoleMessage'
import KonamiCode from '@/components/KonamiCode'
import CommandPalette from '@/components/CommandPalette'

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
        <ConsoleMessage />
        <KonamiCode />
        <CommandPalette />
        {children}
      </body>
    </html>
  )
}
