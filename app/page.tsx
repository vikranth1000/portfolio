import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Education from '@/components/Education'
import About from '@/components/About'
import Contact from '@/components/Contact'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Projects />
        <Skills />
        <Education />
        <About />
        <Contact />
        <footer className="max-w-5xl mx-auto px-6 py-8 border-t border-border-subtle mt-8">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              © {new Date().getFullYear()} Vikranth Reddimasu
            </p>
            <span
              title="AI agents find /llms.txt automatically at the site root"
              className="text-xs font-mono text-text-muted cursor-default select-none"
            >
              AI-readable
            </span>
          </div>
        </footer>
      </main>
    </>
  )
}
