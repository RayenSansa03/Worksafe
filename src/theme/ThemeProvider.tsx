import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useSettings } from '@/store/settings';
import { darkColors, lightColors, type ColorTokens } from './tokens';

type Theme = { colors: ColorTokens; isDark: boolean };

const ThemeContext = createContext<Theme>({ colors: darkColors, isDark: true });

/** Resolves the user's appearance choice (dark by default) into tokens. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const appearance = useSettings((s) => s.appearance);
  const system = useColorScheme();

  const value = useMemo<Theme>(() => {
    const isDark = appearance === 'system' ? system !== 'light' : appearance === 'dark';
    return { isDark, colors: isDark ? darkColors : lightColors };
  }, [appearance, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
