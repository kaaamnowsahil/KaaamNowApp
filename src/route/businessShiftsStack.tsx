import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FC } from 'react';

import { ROUTES } from '@/constants/routes';
import { ApplyCouponPage } from '@/pages/applyCoupon/ApplyCouponPage';
import {
  BusinessShiftPostedPage,
  BusinessShiftReviewPage,
  BusinessShiftSchedulePage,
} from '@/pages/businessShiftCreate';
import { BusinessRateWorkerPage } from '@/pages/businessApplicants/BusinessRateWorkerPage';
import { BusinessRosterPage } from '@/pages/businessApplicants/BusinessRosterPage';
import { BusinessScheduledWorkerTrackingPage } from '@/pages/businessApplicants/BusinessScheduledWorkerTrackingPage';
import { BusinessShiftsPage } from '@/pages/businessShifts/BusinessShiftsPage';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppStackParamList } from '@/types';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Business Shifts tab with the roster and booking screens, so the bottom tabs stay
 * visible on them (same as web). Names shared with the root stack resolve here first.
 */
export const BusinessShiftsStack: FC = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={ROUTES.businessShiftsHome} component={BusinessShiftsPage} />
      <Stack.Screen name={ROUTES.businessRoster} component={BusinessRosterPage} />
      <Stack.Screen
        name={ROUTES.businessScheduledWorkerTracking}
        component={BusinessScheduledWorkerTrackingPage}
      />
      <Stack.Screen name={ROUTES.businessRateWorker} component={BusinessRateWorkerPage} />
      <Stack.Screen
        name={ROUTES.businessShiftSchedule}
        component={BusinessShiftSchedulePage}
      />
      <Stack.Screen
        name={ROUTES.businessShiftReview}
        component={BusinessShiftReviewPage}
      />
      <Stack.Screen
        name={ROUTES.businessShiftPosted}
        component={BusinessShiftPostedPage}
      />
      <Stack.Screen name={ROUTES.applyCoupon} component={ApplyCouponPage} />
    </Stack.Navigator>
  );
};
