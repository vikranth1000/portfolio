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
