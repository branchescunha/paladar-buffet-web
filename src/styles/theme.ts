export const theme = {
  colors: {
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
  },
  breakpoints: {
    sm: '480px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  },
  shadows: {
    panel: '0 18px 45px rgba(16, 23, 19, 0.12)'
  },
  typography: {
    fontFamily: "'Manrope', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    headingFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
    headingWeight: 700,
    bodyWeight: 400
  },
  zIndex: {
    header: 10,
    sidebar: 20,
    modal: 50
  }
} as const;

export type AppTheme = typeof theme;
