import { useEffect, type FC } from 'react';

import { ROUTES } from '@/constants/routes';
import type { AppScreenProps } from '@/types';

/**
 * Root-stack entries for the worker Live Work screens. Screens outside the tabs (and restored
 * navigation state) can still reach these names, so forward them into a tab stack to keep the
 * bottom tabs visible.
 */
export const WorkerLiveBookingRedirect: FC<
  AppScreenProps<typeof ROUTES.workerLiveBooking>
> = ({ navigation, route }) => {
  useEffect(() => {
    navigation.popTo(ROUTES.mainTabs, {
      screen: ROUTES.workerShifts,
      params: { screen: ROUTES.workerLiveBooking, params: route.params },
    } as never);
  }, [navigation, route.params]);
  return null;
};

export const WorkerLiveWorkRedirect: FC<
  AppScreenProps<typeof ROUTES.workerLiveWork>
> = ({ navigation }) => {
  useEffect(() => {
    navigation.popTo(ROUTES.mainTabs, {
      screen: ROUTES.workerHome,
      params: { screen: ROUTES.workerLiveWork },
    } as never);
  }, [navigation]);
  return null;
};
