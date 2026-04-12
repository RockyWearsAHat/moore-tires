/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#0B0D11',
          card: '#111318',
          elevated: '#181B22',
          border: '#1F2330',
        },
        brand: {
          500: '#FF5500',
          400: '#FF7733',
          300: '#FF9966',
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
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
