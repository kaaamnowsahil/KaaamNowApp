import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState, type FC } from 'react';
import { StatusBar } from 'react-native';

import { SplashPage } from '@/pages/splash/SplashPage';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { useTheme } from '@/theme/ThemeProvider';

import { AfterLoginRoutes } from './afterLogin';
import { BeforeLoginRoutes } from './beforeLogin';

const SPLASH_DURATION_MS = 1500;

/** Root: splash, then the login stack or the app stack depending on isAuth. */
export const AppRoutes: FC = () => {
  const { isDark } = useTheme();
  const isAuth = useAuthStore(s => s.isAuth);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {isBooting ? (
        <SplashPage />
      ) : (
        <NavigationContainer>
          {isAuth ? <AfterLoginRoutes /> : <BeforeLoginRoutes />}
        </NavigationContainer>
      )}
    </>
  );
};
