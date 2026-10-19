import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ROUTES } from '@/constants/routes';

export type RootStackParamList = {
  [ROUTES.splash]: undefined;
  [ROUTES.welcome]: undefined;
  /** phone is E.164, e.g. +919876543210 */
  [ROUTES.verifyPhone]: { phone: string; intent: 'signIn' | 'signUp' };
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
