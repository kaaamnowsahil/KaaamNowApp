import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type FC,
  type ReactNode,
} from 'react';

import {
  DARK_COLORS,
  LIGHT_COLORS,
  type ThemeColors,
} from '@/constants/colors';
import { usePreferencesStore } from '@/services/config/usePreferencesStore';
import { setLightNavigationBar } from '@/services/system/navigationBar';

type Theme = { colors: ThemeColors; isDark: boolean };

const ThemeContext = createContext<Theme>({
  colors: LIGHT_COLORS,
  isDark: false,
});

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const preference = usePreferencesStore(s => s.theme);
  const hasHydrated = usePreferencesStore(s => s.hasHydrated);
  const isDark = preference === 'dark';
  useEffect(() => {
    if (hasHydrated) setLightNavigationBar(!isDark);
  }, [hasHydrated, isDark]);
  const value = useMemo(
    () => ({ colors: isDark ? DARK_COLORS : LIGHT_COLORS, isDark }),
    [isDark],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
