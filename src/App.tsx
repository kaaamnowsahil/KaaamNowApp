import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FC } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Bootstrap i18n before anything renders
import '@/services/i18n/i18n';

import { AppRoutes } from '@/route';
import { useLanguageSync } from '@/services/i18n';
import { ThemeProvider } from '@/theme/ThemeProvider';

const queryClient = new QueryClient();

/** Inner wrapper so hooks (useLanguageSync) can run inside providers. */
const AppInner: FC = () => {
  useLanguageSync();
  return <AppRoutes />;
};

export const App: FC = () => (
  <QueryClientProvider client={queryClient}>
    <SafeAreaProvider>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </SafeAreaProvider>
  </QueryClientProvider>
);
