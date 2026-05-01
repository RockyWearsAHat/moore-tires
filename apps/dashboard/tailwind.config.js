/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          base:     'var(--surface-base)',
          sidebar:  'var(--surface-sidebar)',
          card:     'var(--surface-card)',
          elevated: 'var(--surface-elevated)',
          border:   'var(--surface-border)',
        },
        brand: {
          500: 'var(--brand)',
          400: 'var(--brand-strong)',
          300: 'var(--brand-alt)',
        },
        status: {
          scheduled: '#3B82F6',
          enRoute: '#F59E0B',
          inProgress: '#8B5CF6',
          complete: '#10B981',
          cancelled: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['"Manrope"', '"Avenir Next"', '"Segoe UI"', 'sans-serif'],
        display: ['"Space Grotesk"', '"Avenir Next"', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
