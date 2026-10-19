import { createContext, useContext, useMemo, type FC, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { DARK_COLORS, LIGHT_COLORS, type ThemeColors } from '@/constants/colors';
import { usePreferencesStore } from '@/services/config/usePreferencesStore';

type Theme = { colors: ThemeColors; isDark: boolean };

const ThemeContext = createContext<Theme>({ colors: LIGHT_COLORS, isDark: false });

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const system = useColorScheme();
  const preference = usePreferencesStore(s => s.theme);
  const isDark = preference === 'system' ? system === 'dark' : preference === 'dark';
  const value = useMemo(() => ({ colors: isDark ? DARK_COLORS : LIGHT_COLORS, isDark }), [isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
