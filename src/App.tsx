import type { FC } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppRoutes } from '@/route';
import { ThemeProvider } from '@/theme/ThemeProvider';

export const App: FC = () => (
  <SafeAreaProvider>
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  </SafeAreaProvider>
);
