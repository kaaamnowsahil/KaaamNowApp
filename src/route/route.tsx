import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState, type FC } from 'react';
import { StatusBar } from 'react-native';

import { SPLASH_DURATION_MS, SplashPage } from '@/pages/splash/SplashPage';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { useTheme } from '@/theme/ThemeProvider';

import { AfterLoginRoutes } from './afterLogin';
import { BeforeLoginRoutes } from './beforeLogin';

/** Root: splash, then the login stack or the app stack depending on isAuth. */
export const AppRoutes: FC = () => {
  const { isDark } = useTheme();
  const isAuth = useAuthStore(s => s.isAuth);
  const hasHydrated = useAuthStore(s => s.hasHydrated);
  const [isBooting, setIsBooting] = useState(true);
  const hydrateAuth = useAuthStore(s => s.hydrate);

  useEffect(() => {
    hydrateAuth();
    const timer = setTimeout(() => setIsBooting(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [hydrateAuth]);

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {isBooting || !hasHydrated ? (
        <SplashPage />
      ) : (
        <NavigationContainer>
          {isAuth ? <AfterLoginRoutes /> : <BeforeLoginRoutes />}
        </NavigationContainer>
      )}
    </>
  );
};
