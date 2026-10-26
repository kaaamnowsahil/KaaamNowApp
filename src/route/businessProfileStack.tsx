import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FC } from 'react';

import { ROUTES } from '@/constants/routes';
import { AppearancePage } from '@/pages/appearance/AppearancePage';
import { BusinessEditProfilePage } from '@/pages/businessEditProfile/BusinessEditProfilePage';
import { BusinessPaymentDetailPage } from '@/pages/businessPayments/BusinessPaymentDetailPage';
import { BusinessPaymentHistoryPage } from '@/pages/businessPayments/BusinessPaymentHistoryPage';
import { BusinessProfilePage } from '@/pages/businessProfile/BusinessProfilePage';
import { LanguagePage } from '@/pages/language/LanguagePage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppStackParamList } from '@/types';

import { COMMON_SCREENS } from './commonRoutes';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Business Profile tab with its sub-pages, so the bottom tabs stay visible on
 * them (same as web). Names shared with the root stack resolve here first.
 */
export const BusinessProfileStack: FC = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={ROUTES.businessProfileHome} component={BusinessProfilePage} />
      <Stack.Screen name={ROUTES.businessEditProfile} component={BusinessEditProfilePage} />
      <Stack.Screen name={ROUTES.businessPaymentHistory} component={BusinessPaymentHistoryPage} />
      <Stack.Screen name={ROUTES.businessPaymentDetail} component={BusinessPaymentDetailPage} />
      <Stack.Screen name={ROUTES.language} component={LanguagePage} />
      <Stack.Screen name={ROUTES.appearance} component={AppearancePage} />
      <Stack.Screen name={ROUTES.notifications} component={NotificationsPage} />
      {COMMON_SCREENS.map(screen => (
        <Stack.Screen key={screen.name} name={screen.name} component={screen.component} />
      ))}
    </Stack.Navigator>
  );
};
