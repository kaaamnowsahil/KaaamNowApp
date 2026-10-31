import type { NavigatorScreenParams } from '@react-navigation/native';

import { ROUTES } from '@/constants/routes';
import type { AppStackParamList, TabParamList } from '@/types';

const TAB_HOMES = {
  [ROUTES.workerHome]: ROUTES.workerDiscoverHome,
  [ROUTES.workerShifts]: ROUTES.workerShiftsHome,
  [ROUTES.workerEarnings]: ROUTES.workerEarningsHome,
  [ROUTES.workerProfile]: ROUTES.workerProfileHome,
  [ROUTES.businessLive]: ROUTES.businessLiveHome,
  [ROUTES.businessShifts]: ROUTES.businessShiftsHome,
  [ROUTES.businessApplicants]: ROUTES.businessApplicantsHome,
  [ROUTES.businessProfile]: ROUTES.businessProfileHome,
} as const;

/**
 * MainTabs params that switch to `tab` at its first screen. Without `pop`, finishing a flow
 * inside the same tab would leave the finished screen on top.
 */
export const tabHome = (
  tab: keyof TabParamList,
): NavigatorScreenParams<TabParamList> =>
  ({
    screen: tab,
    params: { screen: TAB_HOMES[tab], pop: true },
  } as NavigatorScreenParams<TabParamList>);

/** MainTabs params that open `screen` inside `tab`, for navigation from outside a screen. */
export const inTab = <S extends keyof AppStackParamList>(
  tab: keyof TabParamList,
  screen: S,
  params?: AppStackParamList[S],
): NavigatorScreenParams<TabParamList> =>
  ({
    screen: tab,
    params: { screen, params },
  } as NavigatorScreenParams<TabParamList>);
