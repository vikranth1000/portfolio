import { getAllProjects } from '@/lib/projects'
import ProjectCard from './ProjectCard'

export default function Projects() {
  const projects = getAllProjects()

  return (
    <section id="projects" className="py-24 max-w-5xl mx-auto px-6">
      <h2 className="text-3xl font-semibold text-text-primary mb-12">Work</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} />
        ))}
      </div>
    </section>
  )
}
