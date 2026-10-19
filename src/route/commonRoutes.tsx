import type { FC } from 'react';

import { ROUTES } from '@/constants/routes';
import { PlaceholderPage } from '@/pages/placeholder/PlaceholderPage';
import type { CommonStackParamList } from '@/types';

/** Screens mounted in both the before-login and after-login stacks. */
export const COMMON_SCREENS: {
  name: keyof CommonStackParamList;
  component: FC;
}[] = [
  { name: ROUTES.terms, component: PlaceholderPage },
  { name: ROUTES.faq, component: PlaceholderPage },
];
