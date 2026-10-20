import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type {
  NavigationProp,
  NavigatorScreenParams,
} from '@react-navigation/native';

import type { ROUTES } from '@/constants/routes';

import type { BookingStatus } from './booking';
import type { Shift } from './shift';
import type { WithdrawalReceipt } from './booking';
import type { BusinessShiftDraft } from './businessShift';
import type { WorkerEarningDetails } from './booking';

export type BusinessPaymentMethod =
  | 'googlePay'
  | 'paytm'
  | 'applePay'
  | 'upiQr'
  | 'cards';

export type BusinessPaymentRecord = {
  id: string;
  role: string;
  business: string;
  date: string;
  amount: number;
  method: BusinessPaymentMethod;
  status: 'paid' | 'pending';
  workerName?: string;
  workerId?: string;
};

export type BusinessPaymentDetails = {
  role: string;
  business: string;
  amount: number;
  date?: string;
  workerId?: string;
  workerName?: string;
  workerIds?: string[];
};

/** Screens reachable both before and after login. */
export type CommonStackParamList = {
  [ROUTES.terms]: undefined;
  [ROUTES.faq]: undefined;
};

export type AuthStackParamList = CommonStackParamList & {
  [ROUTES.welcome]: undefined;
  /** phone is E.164, e.g. +919876543210 */
  [ROUTES.verifyPhone]: { phone: string; intent: 'signIn' | 'signUp' };
  [ROUTES.roleSelect]: undefined;
  [ROUTES.workerSignup]: undefined;
  [ROUTES.businessSignup]: undefined;
};

export type AppStackParamList = CommonStackParamList & {
  [ROUTES.mainTabs]: NavigatorScreenParams<TabParamList> | undefined;
  [ROUTES.shiftList]: undefined;
  [ROUTES.notifications]: undefined;
  [ROUTES.editProfile]: undefined;
  [ROUTES.businessEditProfile]: undefined;
  [ROUTES.businessShiftSchedule]: { draft?: BusinessShiftDraft } | undefined;
  [ROUTES.businessShiftReview]: { draft: BusinessShiftDraft };
  [ROUTES.businessShiftPosted]: { draft: BusinessShiftDraft };
  [ROUTES.businessLiveCreate]: undefined;
  [ROUTES.businessLiveReview]: undefined;
  [ROUTES.businessLiveFinding]: undefined;
  [ROUTES.businessLiveStaffing]: undefined;
  [ROUTES.businessLiveAccepted]: undefined;
  [ROUTES.businessLiveTracking]: { applicantId?: string } | undefined;
  [ROUTES.businessLivePayment]: undefined;
  [ROUTES.businessPaymentMethod]: { payment?: BusinessPaymentDetails } | undefined;
  [ROUTES.businessPaymentScan]: {
    method: BusinessPaymentMethod;
    payment?: BusinessPaymentDetails;
  };
  [ROUTES.businessPaymentSuccess]: {
    method: BusinessPaymentMethod;
    reference: string;
    payment?: BusinessPaymentDetails;
  };
  [ROUTES.businessPaymentHistory]: undefined;
  [ROUTES.businessPaymentDetail]: { payment: BusinessPaymentRecord };
  [ROUTES.businessScheduledWorkerTracking]: {
    applicantId: string;
    role: string;
    business: string;
    hourlyRate: number;
    hours: number;
    date: string;
  };
  [ROUTES.businessRateWorker]: {
    workerId: string;
    role: string;
    business: string;
    workerIds?: string[];
  };
  [ROUTES.businessApplicantProfile]: { applicantId: string };
  [ROUTES.businessRoster]: undefined;
  [ROUTES.language]: undefined;
  [ROUTES.appearance]: undefined;
  [ROUTES.offline]: undefined;
  [ROUTES.payoutAccount]: undefined;
  [ROUTES.earningsHistory]: undefined;
  [ROUTES.workerEarningDetail]: { earning: WorkerEarningDetails };
  [ROUTES.withdraw]: undefined;
  [ROUTES.withdrawSuccess]: WithdrawalReceipt;
  [ROUTES.shiftRequest]: { shift: Shift };
  /** bookingStatus is set when opened from My shifts or an offer. */
  [ROUTES.shiftDetails]: { shift: Shift; bookingStatus?: BookingStatus };
  [ROUTES.applicationSubmitted]: { shift: Shift };
  [ROUTES.shiftSelected]: { shift: Shift };
  [ROUTES.shiftSecured]: { shift: Shift };
  [ROUTES.shiftTravel]: { shift: Shift };
  [ROUTES.shiftCheckIn]: { shift: Shift };
  [ROUTES.activeShift]: { shift: Shift };
  [ROUTES.finishShift]: { shift: Shift };
  [ROUTES.shiftComplete]: { shift: Shift };
  [ROUTES.rateBusiness]: { shift: Shift };
};

/** Navigation from a tab screen: its own tabs plus app-stack screens. */
export type TabAppNavigation = NavigationProp<AppStackParamList & TabParamList>;

export type TabParamList = {
  [ROUTES.workerHome]: undefined;
  [ROUTES.workerShifts]: undefined;
  [ROUTES.workerEarnings]: undefined;
  [ROUTES.workerProfile]: undefined;
  [ROUTES.businessLive]: undefined;
  [ROUTES.businessShifts]: undefined;
  [ROUTES.businessApplicants]:
    | { status?: 'applied' | 'selected' | 'confirmed' }
    | undefined;
  [ROUTES.businessProfile]: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type AppScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = BottomTabScreenProps<
  TabParamList,
  T
>;
