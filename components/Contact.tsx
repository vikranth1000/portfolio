import AnimateOnScroll from './AnimateOnScroll'

const CONTACT_LINKS = [
  {
    label: 'Email',
    href: 'mailto:vikranth@example.com',
    display: 'vikranth@example.com',
    external: false,
    download: false,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/vikranthreddimasu',
    display: 'linkedin.com/in/vikranthreddimasu',
    external: true,
    download: false,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/vikranthreddimasu',
    display: 'github.com/vikranthreddimasu',
    external: true,
    download: false,
  },
  {
    label: 'Twitter / X',
    href: 'https://x.com/vikranthreddimasu',
    display: '@vikranthreddimasu',
    external: true,
    download: false,
  },
  {
    label: 'Resume',
    href: '/resume.pdf',
    display: 'Download PDF ↓',
    external: false,
    download: true,
  },
]

export default function Contact() {
  return (
    <section id="contact" className="py-24 max-w-5xl mx-auto px-6">
      <AnimateOnScroll>
        <h2 className="text-3xl font-semibold text-text-primary mb-4">Contact</h2>
        <p className="text-text-secondary text-sm mb-12 max-w-md leading-relaxed">
          Open to full-time ML Engineer, Data Scientist, and AI Engineer roles. I respond to every message.
        </p>
      </AnimateOnScroll>

      <div className="flex flex-col">
        {CONTACT_LINKS.map((link, i) => (
          <AnimateOnScroll key={link.label} delay={i * 0.06}>
            <a
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              download={link.download ? true : undefined}
              className="group flex items-center justify-between border-b border-border-subtle py-4 hover:border-border-hover transition-colors"
            >
              <span className="text-xs text-text-muted uppercase tracking-widest">
                {link.label}
              </span>
              <span className="text-sm text-text-secondary group-hover:text-text-primary group-hover:translate-x-1 transition-all duration-200">
                {link.display}
              </span>
            </a>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  )
}
