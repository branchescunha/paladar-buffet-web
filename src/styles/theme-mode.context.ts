import { createContext, useContext } from 'react';
import type { ThemeMode } from './theme';

export interface ThemeModeContextValue {
  mode: ThemeMode;
  toggleTheme(): void;
}

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function useThemeMode() {
  const value = useContext(ThemeModeContext);

  if (!value) {
    throw new Error('useThemeMode must be used inside ThemeModeProvider.');
  }

  return value;
}
