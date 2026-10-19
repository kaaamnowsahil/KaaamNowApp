import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FC } from 'react';

import { ROUTES } from '@/constants/routes';
import { BusinessSignupPage } from '@/pages/businessSignup/BusinessSignupPage';
import { RoleSelectPage } from '@/pages/roleSelect/RoleSelectPage';
import { VerifyPhonePage } from '@/pages/verifyPhone/VerifyPhonePage';
import { WelcomePage } from '@/pages/welcome/WelcomePage';
import { WorkerSignupPage } from '@/pages/workerSignup/WorkerSignupPage';
import { useTheme } from '@/theme/ThemeProvider';
import type { AuthStackParamList } from '@/types';

import { COMMON_SCREENS } from './commonRoutes';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** Login / sign-up flow, shown while isAuth is false. */
export const BeforeLoginRoutes: FC = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={ROUTES.welcome} component={WelcomePage} />
      <Stack.Screen name={ROUTES.verifyPhone} component={VerifyPhonePage} />
      <Stack.Screen name={ROUTES.roleSelect} component={RoleSelectPage} />
      <Stack.Screen name={ROUTES.workerSignup} component={WorkerSignupPage} />
      <Stack.Screen
        name={ROUTES.businessSignup}
        component={BusinessSignupPage}
      />
      <Stack.Group>
        {COMMON_SCREENS.map(screen => (
          <Stack.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
          />
        ))}
      </Stack.Group>
    </Stack.Navigator>
  );
};
