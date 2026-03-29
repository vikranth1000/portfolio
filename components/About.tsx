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
            [Write why you love ML and AI — what drew you to the field, what excites you about
            where it&apos;s going. Keep it personal and direct, not a résumé summary.]
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.1}>
          <p className="text-text-secondary leading-relaxed">
            [Write your career goal — the kind of problems you want to work on, the type of team
            or company you&apos;re drawn to. Be specific enough to be credible.]
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
