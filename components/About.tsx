import AnimateOnScroll from './AnimateOnScroll'

export default function About() {
  return (
    <section id="about" className="py-24 max-w-5xl mx-auto px-6">
      <AnimateOnScroll>
        <h2 className="text-3xl font-semibold text-text-primary mb-12">About</h2>
      </AnimateOnScroll>

      <div className="max-w-2xl flex flex-col gap-5">
        <AnimateOnScroll delay={0.05}>
          <p className="text-text-secondary leading-relaxed">
            I&apos;m an AI/ML Engineer and full-stack developer pursuing an M.S. in Data Science at the University of Maryland. I build production-grade agentic AI systems, generative AI applications, and data-driven platforms — from multi-agent architectures and conversational AI to end-to-end applications using Python, LangGraph, FastAPI, and React.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.1}>
          <p className="text-text-secondary leading-relaxed">
            I&apos;m passionate about applying emerging AI technologies to solve real-world problems — particularly in wealth management and financial services. I&apos;m drawn to teams building innovative, client-centric solutions where I can design and deploy systems that actually ship to production.
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
