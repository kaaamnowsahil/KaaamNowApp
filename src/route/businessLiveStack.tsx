import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FC } from 'react';

import { ROUTES } from '@/constants/routes';
import { ApplyCouponPage } from '@/pages/applyCoupon/ApplyCouponPage';
import { BusinessRosterPage } from '@/pages/businessApplicants/BusinessRosterPage';
import { BusinessLivePage } from '@/pages/businessLive/BusinessLivePage';
import {
  BusinessShiftPostedPage,
  BusinessShiftReviewPage,
  BusinessShiftSchedulePage,
} from '@/pages/businessShiftCreate';
import { BusinessLiveWorkPage } from '@/pages/liveWork/BusinessLiveWorkPage';
import { BusinessLiveWorkPostPage } from '@/pages/liveWork/BusinessLiveWorkPostPage';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppStackParamList } from '@/types';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Business Dashboard tab with the post, pay and tracking screens, so the bottom tabs stay
 * visible on them (same as web). Names shared with the root stack resolve here first.
 */
export const BusinessLiveStack: FC = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name={ROUTES.businessLiveHome}
        component={BusinessLivePage}
      />
      <Stack.Screen
        name={ROUTES.businessLiveWorkPost}
        component={BusinessLiveWorkPostPage}
      />
      <Stack.Screen
        name={ROUTES.businessLiveWork}
        component={BusinessLiveWorkPage}
      />
      <Stack.Screen name={ROUTES.applyCoupon} component={ApplyCouponPage} />
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
      <Stack.Screen
        name={ROUTES.businessRoster}
        component={BusinessRosterPage}
      />
    </Stack.Navigator>
  );
};
