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
        'surface-alt': '#0a0a0a',
        'surface-raised': '#141414',
        'border-subtle': '#1a1a1a',
        'border-default': '#1f1f1f',
        'border-hover': '#333333',
        'text-primary': '#ffffff',
        'text-secondary': '#888888',
        'text-hint': '#666666',
        'text-muted': '#767676',
        'text-label': '#767676',
        'accent-green': '#22c55e',
        'accent-red': '#ff5f57',
        'accent-yellow': '#febc2e',
        'accent-green-mac': '#28c840',
        'accent-pacman': '#FACC15',
        tag: '#111111',
      },
      fontSize: {
        terminal: ['13px', { lineHeight: '1.625' }],
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
