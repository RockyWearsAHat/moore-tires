/** Shared design tokens for React Native */
export const colors = {
  onyx: {
    900: '#0A0A0F',
    800: '#121218',
    700: '#1C1C25',
    600: '#28283A',
    500: '#363650',
  },
  flame: {
    600: '#CC4400',
    500: '#FF5500',
    400: '#FF7733',
    300: '#FFAA88',
  },
  platinum: {
    50:  '#FFFCF8',
    100: '#F0EDE8',
    200: '#D4CFC9',
    400: '#A09890',
    600: '#6B6860',
    700: '#4A4845',
  },
  status: {
    scheduled:  '#3B82F6',
    enRoute:    '#F59E0B',
    inProgress: '#8B5CF6',
    complete:   '#10B981',
    cancelled:  '#6B7280',
  },
} as const;

export const radii = {
  xs:   3,
  sm:   6,
  md:   10,
  lg:   16,
  xl:   24,
  pill: 999,
} as const;

export const typography = {
  displayXl: { fontSize: 52, fontWeight: '900' as const, letterSpacing: -2,    lineHeight: 54 },
  displayLg: { fontSize: 38, fontWeight: '900' as const, letterSpacing: -1,    lineHeight: 42 },
  displayMd: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.5,  lineHeight: 28 },
  displaySm: { fontSize: 17, fontWeight: '700' as const, letterSpacing: -0.25, lineHeight: 22 },
  bodyLg:    { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  body:      { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  small:     { fontSize: 12, fontWeight: '400' as const, lineHeight: 17 },
  label:     { fontSize: 11, fontWeight: '700' as const, letterSpacing: 2, textTransform: 'uppercase' as const },
} as const;

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
} as const;
