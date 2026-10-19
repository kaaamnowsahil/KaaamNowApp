import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FC } from 'react';
import { StatusBar } from 'react-native';

import { ROUTES } from '@/constants/routes';
import { SplashPage } from '@/pages/splash/SplashPage';
import { VerifyPhonePage } from '@/pages/verifyPhone/VerifyPhonePage';
import { WelcomePage } from '@/pages/welcome/WelcomePage';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootStackParamList } from '@/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppRoutes: FC = () => {
  const { isDark, colors } = useTheme();
  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
        >
          <Stack.Screen name={ROUTES.splash} component={SplashPage} />
          <Stack.Screen name={ROUTES.welcome} component={WelcomePage} />
          <Stack.Screen name={ROUTES.verifyPhone} component={VerifyPhonePage} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};
