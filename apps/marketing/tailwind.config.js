/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surface/background scale — light blue-whites
        onyx: {
          950: '#f0f6ff',  // deepest surface (footer bg)
          900: '#e8f1ff',  // page background
          800: '#dce8ff',  // hover / slightly elevated surface
          700: '#c4d6f0',  // borders / dividers
          600: '#a4bde0',  // stronger borders
        },
        // Accent — professional blue (replaced orange)
        flame: {
          400: '#5aadff',  // light blue (hover accent)
          500: '#2a7fda',  // primary blue (CTAs, labels)
          600: '#1e64be',  // CTA hover
          700: '#1850a0',  // CTA active
        },
        // Text scale — dark navy on light backgrounds
        platinum: {
          50:  '#0b1e38',  // headings (was near-white, now dark navy)
          100: '#18304e',  // primary body text
          200: '#274a6e',  // secondary body text
          400: '#5070a0',  // muted / label text
          600: '#7a96c0',  // faint / placeholder text
        },
        // Navy dark surfaces (sidebar, callout sections)
        navy: {
          900: '#032760',
          800: '#0b1d40',
          700: '#142c55',
        },
      },
      fontFamily: {
        display: ['"Manrope"', '"Inter"', '"Avenir Next"', 'sans-serif'],
        body: ['"Inter"', '"Manrope"', '"Avenir Next"', 'sans-serif'],
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
