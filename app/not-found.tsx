import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-base flex flex-col items-center justify-center gap-6 px-6">
      <div className="font-mono text-sm text-text-muted space-y-1 text-center">
        <p className="text-text-secondary">$ cd /this-page</p>
        <p className="text-accent-red">bash: cd: /this-page: No such file or directory</p>
      </div>
      <div className="text-center">
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">404</p>
        <h1 className="text-3xl font-bold text-text-primary">Page not found</h1>
      </div>
      <Link
        href="/"
        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        ← Back home
      </Link>
    </main>
  )
}
