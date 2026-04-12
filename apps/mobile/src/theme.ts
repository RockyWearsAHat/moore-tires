/** Shared design tokens for React Native */
export const colors = {
  onyx: {
    900: '#0C0C12',
    800: '#131318',
    700: '#1D1D26',
    600: '#2A2A36',
  },
  flame: {
    500: '#FF5500',
    400: '#FF7733',
    300: '#FF9966',
  },
  platinum: {
    50:  '#FFFCF8',
    100: '#F0EDE8',
    400: '#C4BDB4',
    600: '#6B6860',
  },
} as const;

export const typography = {
  displayXl: { fontSize: 48, fontWeight: '900' as const, letterSpacing: -1, lineHeight: 52 },
  displayLg: { fontSize: 36, fontWeight: '900' as const, letterSpacing: -0.5, lineHeight: 40 },
  displayMd: { fontSize: 24, fontWeight: '800' as const, lineHeight: 28 },
  bodyLg: { fontSize: 17, fontWeight: '400' as const, lineHeight: 26 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 2.5, textTransform: 'uppercase' as const },
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
