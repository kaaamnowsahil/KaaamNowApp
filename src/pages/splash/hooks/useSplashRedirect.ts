import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';

import { ROUTES } from '@/constants/routes';
import type { RootStackParamList } from '@/types';

const SPLASH_DURATION_MS = 1500;

export const useSplashRedirect = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace(ROUTES.welcome), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [navigation]);
};
