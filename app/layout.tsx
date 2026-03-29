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
