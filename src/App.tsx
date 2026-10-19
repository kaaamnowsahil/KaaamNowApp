import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FC } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppRoutes } from '@/route';
import { ThemeProvider } from '@/theme/ThemeProvider';

const queryClient = new QueryClient();

export const App: FC = () => (
  <QueryClientProvider client={queryClient}>
    <SafeAreaProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </SafeAreaProvider>
  </QueryClientProvider>
);
