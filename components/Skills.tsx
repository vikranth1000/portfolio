import AnimateOnScroll from './AnimateOnScroll'

const SKILL_GROUPS = [
  {
    label: 'ML / AI',
    skills: ['PyTorch', 'TensorFlow', 'scikit-learn', 'HuggingFace', 'LangChain', 'OpenAI API', 'Reinforcement Learning', 'Computer Vision', 'NLP'],
  },
  {
    label: 'Languages',
    skills: ['Python', 'SQL', 'TypeScript', 'R', 'Bash'],
  },
  {
    label: 'Data',
    skills: ['Pandas', 'NumPy', 'Spark', 'Polars', 'Jupyter', 'dbt'],
  },
  {
    label: 'Frontend',
    skills: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'TypeScript'],
  },
  {
    label: 'Cloud / MLOps',
    skills: ['AWS', 'Docker', 'Git', 'MLflow', 'Weights & Biases', 'FastAPI'],
  },
]

export default function Skills() {
  return (
    <section id="skills" className="py-24 max-w-5xl mx-auto px-6">
      <AnimateOnScroll>
        <h2 className="text-3xl font-semibold text-text-primary mb-12">Skills</h2>
      </AnimateOnScroll>
      <div className="flex flex-col gap-8">
        {SKILL_GROUPS.map((group, i) => (
          <AnimateOnScroll key={group.label} delay={i * 0.06}>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-3">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2 py-1 rounded bg-tag border border-border-subtle text-text-secondary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  )
}
