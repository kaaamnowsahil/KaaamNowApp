import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FC } from 'react';

import { ROUTES } from '@/constants/routes';
import { ActiveShiftPage } from '@/pages/activeShift/ActiveShiftPage';
import { AddRolePage } from '@/pages/addRole/AddRolePage';
import { AppearancePage } from '@/pages/appearance/AppearancePage';
import { ApplicationSubmittedPage } from '@/pages/applicationSubmitted/ApplicationSubmittedPage';
import { ApplyCouponPage } from '@/pages/applyCoupon/ApplyCouponPage';
import { BusinessApplicantProfilePage } from '@/pages/businessApplicants/BusinessApplicantProfilePage';
import { BusinessApplicantsPage } from '@/pages/businessApplicants/BusinessApplicantsPage';
import { BusinessRateWorkerPage } from '@/pages/businessApplicants/BusinessRateWorkerPage';
import { BusinessRosterPage } from '@/pages/businessApplicants/BusinessRosterPage';
import { BusinessScheduledWorkerTrackingPage } from '@/pages/businessApplicants/BusinessScheduledWorkerTrackingPage';
import { BusinessWorkerProfilePage } from '@/pages/businessApplicants/BusinessWorkerProfilePage';
import { BusinessEditProfilePage } from '@/pages/businessEditProfile/BusinessEditProfilePage';
import { BusinessLivePage } from '@/pages/businessLive/BusinessLivePage';
import { BusinessPaymentDetailPage } from '@/pages/businessPayments/BusinessPaymentDetailPage';
import { BusinessPaymentHistoryPage } from '@/pages/businessPayments/BusinessPaymentHistoryPage';
import { BusinessProfilePage } from '@/pages/businessProfile/BusinessProfilePage';
import {
  BusinessShiftPostedPage,
  BusinessShiftReviewPage,
  BusinessShiftSchedulePage,
} from '@/pages/businessShiftCreate';
import { BusinessShiftsPage } from '@/pages/businessShifts/BusinessShiftsPage';
import { EarningsHistoryPage } from '@/pages/earningsHistory/EarningsHistoryPage';
import { WorkerEarningDetailPage } from '@/pages/earningsHistory/WorkerEarningDetailPage';
import { EditProfilePage } from '@/pages/editProfile/EditProfilePage';
import { FinishShiftPage } from '@/pages/finishShift/FinishShiftPage';
import { LanguagePage } from '@/pages/language/LanguagePage';
import { BusinessLiveWorkPage } from '@/pages/liveWork/BusinessLiveWorkPage';
import { BusinessLiveWorkPostPage } from '@/pages/liveWork/BusinessLiveWorkPostPage';
import { WorkerLiveBookingPage } from '@/pages/liveWork/WorkerLiveBookingPage';
import { WorkerLiveWorkPage } from '@/pages/liveWork/WorkerLiveWorkPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { PayoutAccountPage } from '@/pages/payoutAccount/PayoutAccountPage';
import { RateBusinessPage } from '@/pages/rateBusiness/RateBusinessPage';
import { ShiftCheckInPage } from '@/pages/shiftCheckIn/ShiftCheckInPage';
import { ShiftCompletePage } from '@/pages/shiftComplete/ShiftCompletePage';
import { ShiftDetailsPage } from '@/pages/shiftDetails/ShiftDetailsPage';
import { ShiftListPage } from '@/pages/shiftList/ShiftListPage';
import { ShiftSecuredPage } from '@/pages/shiftSecured/ShiftSecuredPage';
import { ShiftSelectedPage } from '@/pages/shiftSelected/ShiftSelectedPage';
import { ShiftTravelPage } from '@/pages/shiftTravel/ShiftTravelPage';
import { WithdrawPage } from '@/pages/withdraw/WithdrawPage';
import { WithdrawSuccessPage } from '@/pages/withdrawSuccess/WithdrawSuccessPage';
import { WorkerEarningsPage } from '@/pages/workerEarnings/WorkerEarningsPage';
import { WorkerHomePage } from '@/pages/workerHome/WorkerHomePage';
import { WorkerProfilePage } from '@/pages/workerProfile/WorkerProfilePage';
import { WorkerShiftsPage } from '@/pages/workerShifts/WorkerShiftsPage';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppStackParamList } from '@/types';

import { COMMON_SCREENS } from './commonRoutes';

const Stack = createNativeStackNavigator<AppStackParamList>();

const NO_SWIPE_BACK = { gestureEnabled: false };

/**
 * Every signed-in screen, mounted in each tab's stack so it opens inside the current tab and
 * the bottom tabs stay visible everywhere (same as web).
 */
const DETAIL_SCREENS = (
  <>
    <Stack.Screen name={ROUTES.shiftList} component={ShiftListPage} />
    <Stack.Screen name={ROUTES.notifications} component={NotificationsPage} />
    <Stack.Screen name={ROUTES.editProfile} component={EditProfilePage} />
    <Stack.Screen name={ROUTES.addRole} component={AddRolePage} />
    <Stack.Screen name={ROUTES.language} component={LanguagePage} />
    <Stack.Screen name={ROUTES.appearance} component={AppearancePage} />
    <Stack.Screen name={ROUTES.payoutAccount} component={PayoutAccountPage} />
    <Stack.Screen
      name={ROUTES.earningsHistory}
      component={EarningsHistoryPage}
    />
    <Stack.Screen
      name={ROUTES.workerEarningDetail}
      component={WorkerEarningDetailPage}
    />
    <Stack.Screen name={ROUTES.withdraw} component={WithdrawPage} />
    <Stack.Screen
      name={ROUTES.withdrawSuccess}
      component={WithdrawSuccessPage}
      options={NO_SWIPE_BACK}
    />
    <Stack.Screen name={ROUTES.shiftDetails} component={ShiftDetailsPage} />
    <Stack.Screen
      name={ROUTES.applicationSubmitted}
      component={ApplicationSubmittedPage}
    />
    <Stack.Screen name={ROUTES.shiftSelected} component={ShiftSelectedPage} />
    <Stack.Screen name={ROUTES.shiftSecured} component={ShiftSecuredPage} />
    <Stack.Screen name={ROUTES.shiftTravel} component={ShiftTravelPage} />
    <Stack.Screen name={ROUTES.shiftCheckIn} component={ShiftCheckInPage} />
    <Stack.Group screenOptions={NO_SWIPE_BACK}>
      <Stack.Screen name={ROUTES.activeShift} component={ActiveShiftPage} />
      <Stack.Screen name={ROUTES.finishShift} component={FinishShiftPage} />
      <Stack.Screen name={ROUTES.shiftComplete} component={ShiftCompletePage} />
      <Stack.Screen name={ROUTES.rateBusiness} component={RateBusinessPage} />
    </Stack.Group>
    <Stack.Screen name={ROUTES.workerLiveWork} component={WorkerLiveWorkPage} />
    <Stack.Screen
      name={ROUTES.workerLiveBooking}
      component={WorkerLiveBookingPage}
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
    <Stack.Screen name={ROUTES.businessRoster} component={BusinessRosterPage} />
    <Stack.Screen
      name={ROUTES.businessScheduledWorkerTracking}
      component={BusinessScheduledWorkerTrackingPage}
    />
    <Stack.Screen
      name={ROUTES.businessRateWorker}
      component={BusinessRateWorkerPage}
    />
    <Stack.Screen
      name={ROUTES.businessApplicantProfile}
      component={BusinessApplicantProfilePage}
    />
    <Stack.Screen
      name={ROUTES.businessWorkerProfile}
      component={BusinessWorkerProfilePage}
    />
    <Stack.Screen
      name={ROUTES.businessEditProfile}
      component={BusinessEditProfilePage}
    />
    <Stack.Screen
      name={ROUTES.businessPaymentHistory}
      component={BusinessPaymentHistoryPage}
    />
    <Stack.Screen
      name={ROUTES.businessPaymentDetail}
      component={BusinessPaymentDetailPage}
    />
    {COMMON_SCREENS.map(screen => (
      <Stack.Screen
        key={screen.name}
        name={screen.name}
        component={screen.component}
      />
    ))}
  </>
);

const tabStack = (homeName: keyof AppStackParamList, Home: FC): FC => {
  const TabStack: FC = () => {
    const { colors } = useTheme();
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name={homeName} component={Home} />
        {DETAIL_SCREENS}
      </Stack.Navigator>
    );
  };
  return TabStack;
};

export const WorkerDiscoverStack = tabStack(
  ROUTES.workerDiscoverHome,
  WorkerHomePage,
);
export const WorkerShiftsStack = tabStack(
  ROUTES.workerShiftsHome,
  WorkerShiftsPage,
);
export const WorkerEarningsStack = tabStack(
  ROUTES.workerEarningsHome,
  WorkerEarningsPage,
);
export const WorkerProfileStack = tabStack(
  ROUTES.workerProfileHome,
  WorkerProfilePage,
);
export const BusinessLiveStack = tabStack(
  ROUTES.businessLiveHome,
  BusinessLivePage,
);
export const BusinessShiftsStack = tabStack(
  ROUTES.businessShiftsHome,
  BusinessShiftsPage,
);
export const BusinessApplicantsStack = tabStack(
  ROUTES.businessApplicantsHome,
  BusinessApplicantsPage,
);
export const BusinessProfileStack = tabStack(
  ROUTES.businessProfileHome,
  BusinessProfilePage,
);
