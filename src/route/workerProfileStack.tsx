import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FC } from 'react';

import { ROUTES } from '@/constants/routes';
import { AppearancePage } from '@/pages/appearance/AppearancePage';
import { EditProfilePage } from '@/pages/editProfile/EditProfilePage';
import { LanguagePage } from '@/pages/language/LanguagePage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { PayoutAccountPage } from '@/pages/payoutAccount/PayoutAccountPage';
import { WorkerProfilePage } from '@/pages/workerProfile/WorkerProfilePage';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppStackParamList } from '@/types';

import { COMMON_SCREENS } from './commonRoutes';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Worker Profile tab with its sub-pages, so the bottom tabs stay visible on
 * them (same as web). Names shared with the root stack resolve here first.
 */
export const WorkerProfileStack: FC = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={ROUTES.workerProfileHome} component={WorkerProfilePage} />
      <Stack.Screen name={ROUTES.editProfile} component={EditProfilePage} />
      <Stack.Screen name={ROUTES.payoutAccount} component={PayoutAccountPage} />
      <Stack.Screen name={ROUTES.language} component={LanguagePage} />
      <Stack.Screen name={ROUTES.appearance} component={AppearancePage} />
      <Stack.Screen name={ROUTES.notifications} component={NotificationsPage} />
      {COMMON_SCREENS.map(screen => (
        <Stack.Screen key={screen.name} name={screen.name} component={screen.component} />
      ))}
    </Stack.Navigator>
  );
};
