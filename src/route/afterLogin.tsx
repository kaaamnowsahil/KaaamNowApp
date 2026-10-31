import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FC } from 'react';

import { ROUTES } from '@/constants/routes';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppStackParamList } from '@/types';

import { BottomTabRoutes } from './bottomTabs';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Signed-in app. Every screen lives inside a tab's stack (see tabStacks) so the bottom tabs
 * are always visible; code outside screens opens them with `inTab`.
 */
export const AfterLoginRoutes: FC = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={ROUTES.mainTabs} component={BottomTabRoutes} />
    </Stack.Navigator>
  );
};
