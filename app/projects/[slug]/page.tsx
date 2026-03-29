import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getProjectBySlug, getAllProjectSlugs } from '@/lib/projects'
import ProjectLayout from '@/components/ProjectLayout'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProjectBySlug(params.slug)
  if (!project) return { title: 'Project — Vikranth Reddimasu' }
  return {
    title: `${project.title} — Vikranth Reddimasu`,
    description: project.description,
  }
}

export default function ProjectPage({ params }: Props) {
  const project = getProjectBySlug(params.slug)
  if (!project) notFound()

  return (
    <ProjectLayout meta={project}>
      <MDXRemote source={project.content} />
    </ProjectLayout>
  )
}
