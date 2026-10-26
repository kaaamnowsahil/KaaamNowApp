import { createNavigationContainerRef } from '@react-navigation/native';

import type { AppStackParamList } from '@/types';

/** Lets code outside screens (push taps) navigate the app stack. */
export const navigationRef = createNavigationContainerRef<AppStackParamList>();
