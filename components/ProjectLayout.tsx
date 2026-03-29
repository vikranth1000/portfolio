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
