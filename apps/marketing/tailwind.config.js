/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        onyx: {
          950: '#060608',
          900: '#0C0C12',
          800: '#111118',
          700: '#1A1A24',
          600: '#252530',
        },
        flame: {
          400: '#FF8C42',
          500: '#FF5500',
          600: '#E04800',
          700: '#C23E00',
        },
        platinum: {
          50: '#FFFCF8',
          100: '#F5F2EE',
          200: '#E8E4DC',
          400: '#C4BEAF',
          600: '#8C8678',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"Outfit"', 'sans-serif'],
      },
      backgroundImage: {
        'tread-pattern': "url('/tread-pattern.svg')",
      },
      animation: {
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'line-grow': 'lineGrow 0.8s ease-out forwards',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        lineGrow: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
    },
  },
  plugins: [],
};
