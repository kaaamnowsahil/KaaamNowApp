import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FC } from 'react';

import { ROUTES } from '@/constants/routes';
import { EarningsHistoryPage } from '@/pages/earningsHistory/EarningsHistoryPage';
import { WithdrawPage } from '@/pages/withdraw/WithdrawPage';
import { WithdrawSuccessPage } from '@/pages/withdrawSuccess/WithdrawSuccessPage';
import { EditProfilePage } from '@/pages/editProfile/EditProfilePage';
import { LanguagePage } from '@/pages/language/LanguagePage';
import { AppearancePage } from '@/pages/appearance/AppearancePage';
import { OfflinePage } from '@/pages/offline/OfflinePage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { PayoutAccountPage } from '@/pages/payoutAccount/PayoutAccountPage';
import { ShiftListPage } from '@/pages/shiftList/ShiftListPage';
import { ShiftRequestPage } from '@/pages/shiftRequest/ShiftRequestPage';
import { ShiftDetailsPage } from '@/pages/shiftDetails/ShiftDetailsPage';
import { ApplicationSubmittedPage } from '@/pages/applicationSubmitted/ApplicationSubmittedPage';
import { ShiftSelectedPage } from '@/pages/shiftSelected/ShiftSelectedPage';
import { ShiftSecuredPage } from '@/pages/shiftSecured/ShiftSecuredPage';
import { ShiftTravelPage } from '@/pages/shiftTravel/ShiftTravelPage';
import { ShiftCheckInPage } from '@/pages/shiftCheckIn/ShiftCheckInPage';
import { ActiveShiftPage } from '@/pages/activeShift/ActiveShiftPage';
import { FinishShiftPage } from '@/pages/finishShift/FinishShiftPage';
import { ShiftCompletePage } from '@/pages/shiftComplete/ShiftCompletePage';
import { RateBusinessPage } from '@/pages/rateBusiness/RateBusinessPage';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppStackParamList } from '@/types';

import { BottomTabRoutes } from './bottomTabs';
import { COMMON_SCREENS } from './commonRoutes';

const Stack = createNativeStackNavigator<AppStackParamList>();

/** Signed-in app, shown while isAuth is true. Tabs first; detail screens push on top. */
export const AfterLoginRoutes: FC = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={ROUTES.mainTabs} component={BottomTabRoutes} />
      <Stack.Screen name={ROUTES.shiftList} component={ShiftListPage} />
      <Stack.Screen
        name={ROUTES.notifications}
        component={NotificationsPage}
      />
      <Stack.Screen name={ROUTES.editProfile} component={EditProfilePage} />
      <Stack.Screen name={ROUTES.language} component={LanguagePage} />
      <Stack.Screen name={ROUTES.appearance} component={AppearancePage} />
      <Stack.Screen name={ROUTES.offline} component={OfflinePage} />
      <Stack.Screen
        name={ROUTES.payoutAccount}
        component={PayoutAccountPage}
      />
      <Stack.Screen
        name={ROUTES.earningsHistory}
        component={EarningsHistoryPage}
      />
      <Stack.Screen name={ROUTES.withdraw} component={WithdrawPage} />
      <Stack.Screen
        name={ROUTES.withdrawSuccess}
        component={WithdrawSuccessPage}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name={ROUTES.shiftRequest} component={ShiftRequestPage} />
      <Stack.Screen name={ROUTES.shiftDetails} component={ShiftDetailsPage} />
      <Stack.Screen
        name={ROUTES.applicationSubmitted}
        component={ApplicationSubmittedPage}
      />
      <Stack.Screen name={ROUTES.shiftSelected} component={ShiftSelectedPage} />
      <Stack.Screen name={ROUTES.shiftSecured} component={ShiftSecuredPage} />
      <Stack.Screen name={ROUTES.shiftTravel} component={ShiftTravelPage} />
      <Stack.Screen name={ROUTES.shiftCheckIn} component={ShiftCheckInPage} />
      <Stack.Group screenOptions={{ gestureEnabled: false }}>
        <Stack.Screen name={ROUTES.activeShift} component={ActiveShiftPage} />
        <Stack.Screen name={ROUTES.finishShift} component={FinishShiftPage} />
        <Stack.Screen name={ROUTES.shiftComplete} component={ShiftCompletePage} />
        <Stack.Screen name={ROUTES.rateBusiness} component={RateBusinessPage} />
      </Stack.Group>
      <Stack.Group>
        {COMMON_SCREENS.map(screen => (
          <Stack.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
          />
        ))}
      </Stack.Group>
    </Stack.Navigator>
  );
};
