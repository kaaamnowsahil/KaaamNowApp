import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FC } from 'react';

import { ROUTES } from '@/constants/routes';
import { BusinessApplicantsPage } from '@/pages/businessApplicants/BusinessApplicantsPage';
import { BusinessWorkerProfilePage } from '@/pages/businessApplicants/BusinessWorkerProfilePage';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppStackParamList } from '@/types';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Business Applicants tab with the worker profile, so the bottom tabs stay
 * visible on it (same as web). Names shared with the root stack resolve here first.
 */
export const BusinessApplicantsStack: FC = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={ROUTES.businessApplicantsHome} component={BusinessApplicantsPage} />
      <Stack.Screen name={ROUTES.businessWorkerProfile} component={BusinessWorkerProfilePage} />
    </Stack.Navigator>
  );
};
