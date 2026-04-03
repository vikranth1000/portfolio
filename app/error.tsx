'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-base flex flex-col items-center justify-center gap-4 px-6">
      <p className="text-text-muted text-xs uppercase tracking-widest">Error</p>
      <h1 className="text-2xl font-bold text-text-primary">Something went wrong</h1>
      <p className="text-sm text-text-secondary max-w-md text-center">
        An unexpected error occurred. Try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="text-sm text-text-secondary border border-border-subtle rounded-md px-4 py-2 hover:border-border-hover hover:text-text-primary transition-all"
      >
        Try again
      </button>
    </main>
  )
}
