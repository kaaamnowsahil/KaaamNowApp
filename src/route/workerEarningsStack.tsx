import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FC } from 'react';

import { ROUTES } from '@/constants/routes';
import { EarningsHistoryPage } from '@/pages/earningsHistory/EarningsHistoryPage';
import { WorkerEarningDetailPage } from '@/pages/earningsHistory/WorkerEarningDetailPage';
import { WorkerEarningsPage } from '@/pages/workerEarnings/WorkerEarningsPage';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppStackParamList } from '@/types';

import { COMMON_SCREENS } from './commonRoutes';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Worker Earnings tab with its history pages, so the bottom tabs stay visible
 * on them (same as web). Names shared with the root stack resolve here first.
 */
export const WorkerEarningsStack: FC = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={ROUTES.workerEarningsHome} component={WorkerEarningsPage} />
      <Stack.Screen name={ROUTES.earningsHistory} component={EarningsHistoryPage} />
      <Stack.Screen name={ROUTES.workerEarningDetail} component={WorkerEarningDetailPage} />
      {COMMON_SCREENS.map(screen => (
        <Stack.Screen key={screen.name} name={screen.name} component={screen.component} />
      ))}
    </Stack.Navigator>
  );
};
