const palette = {
  deepGreen: '#132415',
  darkGreen: '#101713',
  warmWhite: '#F7F5EF',
  softGreen: '#EEF1EB',
  oliveGray: '#8F958D',
  paladarOrange: '#D66A28',
  softGold: '#C5A46D',
  white: '#FFFFFF',
  neutralText: '#202020',
  danger: '#B3261E'
} as const;

export type ThemeMode = 'light' | 'dark';

type ColorToken =
  | keyof typeof palette
  | 'background'
  | 'surface'
  | 'surfaceAlt'
  | 'elevated'
  | 'text'
  | 'textStrong'
  | 'textMuted'
  | 'inverseText'
  | 'primary'
  | 'primaryHover'
  | 'accent'
  | 'accentMuted'
  | 'gold'
  | 'border'
  | 'borderStrong'
  | 'overlay'
  | 'navbar'
  | 'hero'
  | 'focus';

export type AppTheme = typeof foundations & {
  mode: ThemeMode;
  colors: Record<ColorToken, string>;
  shadows: {
    panel: string;
    soft: string;
  };
};

const foundations = {
  palette,
  breakpoints: {
    sm: '480px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
    section: 'clamp(4.5rem, 8vw, 7.5rem)'
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    pill: '999px'
  },
  typography: {
    fontFamily: "'Manrope', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    headingFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
    headingWeight: 700,
    bodyWeight: 400
  },
  transitions: {
    fast: '160ms ease',
    base: '220ms ease',
    slow: '700ms ease'
  },
  zIndex: {
    header: 30,
    sidebar: 20,
    modal: 50
  }
} as const;

export const lightTheme: AppTheme = {
  ...foundations,
  mode: 'light' as ThemeMode,
  colors: {
    ...palette,
    background: palette.warmWhite,
    surface: palette.white,
    surfaceAlt: palette.softGreen,
    elevated: '#FFFDF8',
    text: palette.neutralText,
    textStrong: palette.deepGreen,
    textMuted: '#5F685E',
    inverseText: palette.warmWhite,
    primary: palette.deepGreen,
    primaryHover: palette.darkGreen,
    accent: palette.paladarOrange,
    accentMuted: '#F0D2BD',
    gold: palette.softGold,
    border: 'rgba(19, 36, 21, 0.14)',
    borderStrong: 'rgba(19, 36, 21, 0.24)',
    overlay: 'rgba(247, 245, 239, 0.72)',
    navbar: 'rgba(247, 245, 239, 0.88)',
    hero: palette.warmWhite,
    danger: palette.danger,
    focus: palette.paladarOrange
  },
  shadows: {
    panel: '0 18px 45px rgba(16, 23, 19, 0.10)',
    soft: '0 12px 30px rgba(16, 23, 19, 0.08)'
  }
};

export const darkTheme: AppTheme = {
  ...foundations,
  mode: 'dark' as ThemeMode,
  colors: {
    ...palette,
    background: palette.darkGreen,
    surface: '#15271A',
    surfaceAlt: '#1C3020',
    elevated: '#203825',
    text: '#F3F0E8',
    textStrong: palette.warmWhite,
    textMuted: '#BAC3B6',
    inverseText: palette.deepGreen,
    primary: palette.warmWhite,
    primaryHover: palette.white,
    accent: palette.paladarOrange,
    accentMuted: 'rgba(214, 106, 40, 0.22)',
    gold: palette.softGold,
    border: 'rgba(247, 245, 239, 0.16)',
    borderStrong: 'rgba(247, 245, 239, 0.26)',
    overlay: 'rgba(16, 23, 19, 0.72)',
    navbar: 'rgba(16, 23, 19, 0.86)',
    hero: palette.darkGreen,
    danger: '#FFB4AB',
    focus: palette.softGold
  },
  shadows: {
    panel: '0 18px 45px rgba(0, 0, 0, 0.28)',
    soft: '0 12px 30px rgba(0, 0, 0, 0.22)'
  }
};
