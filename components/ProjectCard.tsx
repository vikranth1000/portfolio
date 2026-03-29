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
                className="text-xs px-2 py-1 rounded bg-tag border border-border-subtle text-text-secondary"
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
