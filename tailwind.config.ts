import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#090909',
        surface: '#0f0f0f',
        'border-subtle': '#1a1a1a',
        'border-hover': '#333333',
        'text-primary': '#ffffff',
        'text-secondary': '#555555',
        'text-muted': '#333333',
        'accent-green': '#22c55e',
        tag: '#111111',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
