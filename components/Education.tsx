import AnimateOnScroll from './AnimateOnScroll'

export default function Education() {
  return (
    <section id="education" className="py-24 max-w-5xl mx-auto px-6">
      <AnimateOnScroll>
        <h2 className="text-3xl font-semibold text-text-primary mb-12">Education</h2>
      </AnimateOnScroll>

      <div className="flex flex-col gap-4">
        {/* Degree */}
        <AnimateOnScroll delay={0.05}>
          <div className="bg-surface border border-border-subtle rounded-lg p-6">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-base font-semibold text-text-primary">
                B.S. in [Your Major]
              </h3>
              <span className="text-xs text-text-muted flex-shrink-0 ml-4">2021 — 2025</span>
            </div>
            <p className="text-sm text-text-secondary mb-4">[Your University]</p>
            <div className="flex flex-wrap gap-2">
              {['Machine Learning', 'Data Structures', 'Statistics', 'Linear Algebra', 'Deep Learning'].map((course) => (
                <span
                  key={course}
                  className="text-xs px-2 py-1 rounded bg-[#111] border border-border-subtle text-text-secondary"
                >
                  {course}
                </span>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* UIFellow */}
        <AnimateOnScroll delay={0.1}>
          <div className="bg-surface border border-border-subtle rounded-lg p-6">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-base font-semibold text-text-primary">UIF Fellow</h3>
              <span className="text-xs text-text-muted flex-shrink-0 ml-4">2023 — 2024</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              [Describe your UIFellow role — what you led, what you built, the impact you had on the program or your team.]
            </p>
          </div>
        </AnimateOnScroll>

        {/* Activities */}
        <AnimateOnScroll delay={0.15}>
          <div className="bg-surface border border-border-subtle rounded-lg p-6">
            <h3 className="text-base font-semibold text-text-primary mb-3">Activities</h3>
            <ul className="flex flex-col gap-2">
              {[
                '[Activity or honor 1]',
                '[Activity or honor 2]',
                '[Activity or honor 3]',
              ].map((activity) => (
                <li key={activity} className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-text-muted mt-0.5 flex-shrink-0">—</span>
                  {activity}
                </li>
              ))}
            </ul>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
