import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const projectsDir = path.join(process.cwd(), 'content/projects')

export interface ProjectMeta {
  slug: string
  title: string
  description: string
  techStack: string[]
  githubUrl?: string
  order: number
}

export interface ProjectWithContent extends ProjectMeta {
  content: string
}

export function getAllProjects(): ProjectMeta[] {
  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith('.mdx'))
  const projects = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '')
    const raw = fs.readFileSync(path.join(projectsDir, file), 'utf-8')
    const { data } = matter(raw)
    return { slug, ...data } as ProjectMeta
  })
  return projects.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
}

export function getProjectBySlug(slug: string): ProjectWithContent | null {
  const filePath = path.join(projectsDir, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return { slug, ...(data as Omit<ProjectMeta, 'slug'>), content }
}

export function getAllProjectSlugs(): string[] {
  return fs
    .readdirSync(projectsDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}
