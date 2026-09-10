import { type PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { darkTheme, lightTheme, type ThemeMode } from './theme';
import { ThemeModeContext, type ThemeModeContextValue } from './theme-mode.context';

const storageKey = 'paladar-theme';

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light';
}

export function ThemeModeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>(readStoredMode);
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    window.localStorage.setItem(storageKey, mode);
  }, [mode]);

  const value = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      toggleTheme: () => setMode((current) => (current === 'light' ? 'dark' : 'light'))
    }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
