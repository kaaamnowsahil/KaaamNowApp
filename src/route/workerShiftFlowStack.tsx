import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FC } from 'react';

import { ROUTES } from '@/constants/routes';
import { WorkerLiveBookingPage } from '@/pages/liveWork/WorkerLiveBookingPage';
import { WorkerLiveWorkPage } from '@/pages/liveWork/WorkerLiveWorkPage';
import { ShiftDetailsPage } from '@/pages/shiftDetails/ShiftDetailsPage';
import { ShiftSecuredPage } from '@/pages/shiftSecured/ShiftSecuredPage';
import { ShiftSelectedPage } from '@/pages/shiftSelected/ShiftSelectedPage';
import { WorkerHomePage } from '@/pages/workerHome/WorkerHomePage';
import { WorkerShiftsPage } from '@/pages/workerShifts/WorkerShiftsPage';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppStackParamList } from '@/types';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * A worker tab plus the shift details and booking screens opened from it, so the
 * bottom tabs stay visible on them (same as web). Names shared with the root
 * stack resolve here first.
 */
const workerShiftFlowStack = (
  homeName: typeof ROUTES.workerDiscoverHome | typeof ROUTES.workerShiftsHome,
  Home: FC,
): FC => {
  const WorkerShiftFlowStack: FC = () => {
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
        <Stack.Screen name={ROUTES.shiftDetails} component={ShiftDetailsPage} />
        <Stack.Screen name={ROUTES.shiftSelected} component={ShiftSelectedPage} />
        <Stack.Screen name={ROUTES.shiftSecured} component={ShiftSecuredPage} />
        <Stack.Screen
          name={ROUTES.workerLiveWork}
          component={WorkerLiveWorkPage}
        />
        <Stack.Screen
          name={ROUTES.workerLiveBooking}
          component={WorkerLiveBookingPage}
        />
      </Stack.Navigator>
    );
  };
  return WorkerShiftFlowStack;
};

export const WorkerDiscoverStack = workerShiftFlowStack(
  ROUTES.workerDiscoverHome,
  WorkerHomePage,
);
export const WorkerShiftsStack = workerShiftFlowStack(
  ROUTES.workerShiftsHome,
  WorkerShiftsPage,
);
