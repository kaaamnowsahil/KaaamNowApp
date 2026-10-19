import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ROUTES } from '@/constants/routes';

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
  [ROUTES.mainTabs]: undefined;
};

export type TabParamList = {
  [ROUTES.workerHome]: undefined;
  [ROUTES.workerShifts]: undefined;
  [ROUTES.workerProfile]: undefined;
  [ROUTES.businessLive]: undefined;
  [ROUTES.businessShifts]: undefined;
  [ROUTES.businessApplicants]: undefined;
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
