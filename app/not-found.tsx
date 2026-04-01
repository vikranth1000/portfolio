'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Nav from '@/components/Nav'

export default function NotFound() {
  const pathname = usePathname()

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-base flex flex-col items-center justify-center gap-6 px-6">
        {/* Terminal-style error */}
        <div className="font-mono text-sm text-accent-green mb-2">
          <p className="text-text-muted">vikranth@portfolio:~$</p>
          <p className="mt-1">
            <span className="text-text-muted">bash: cd: </span>
            <span className="text-text-secondary">{pathname}</span>
            <span className="text-text-muted">: No such file or directory</span>
          </p>
        </div>

        <p className="text-text-muted text-xs uppercase tracking-widest">404</p>
        <h1 className="text-3xl font-bold text-text-primary">Page not found</h1>

        <p className="text-sm text-text-secondary max-w-md text-center">
          The page you&apos;re looking for doesn&apos;t exist. Try one of these instead:
        </p>

        {/* Quick navigation links */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <Link
            href="/#projects"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 border border-border-subtle rounded hover:border-border-hover"
          >
            View Work
          </Link>
          <Link
            href="/#about"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 border border-border-subtle rounded hover:border-border-hover"
          >
            About Me
          </Link>
          <Link
            href="/#contact"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 border border-border-subtle rounded hover:border-border-hover"
          >
            Contact
          </Link>
        </div>

        {/* Back home link */}
        <Link
          href="/"
          className="text-sm text-text-muted hover:text-text-primary transition-colors mt-4"
        >
          ← Back home
        </Link>
      </main>
    </>
  )
}
