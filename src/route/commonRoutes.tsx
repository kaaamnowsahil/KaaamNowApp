import type { FC } from 'react';

import { ROUTES } from '@/constants/routes';
import { FaqPage } from '@/pages/faq/FaqPage';
import { TermsPage } from '@/pages/terms/TermsPage';
import { PrivacyPolicyPage } from '@/pages/privacy/PrivacyPolicyPage';
import type { CommonStackParamList } from '@/types';

/** Screens mounted in both the before-login and after-login stacks. */
export const COMMON_SCREENS: {
  name: keyof CommonStackParamList;
  component: FC;
}[] = [
  { name: ROUTES.terms, component: TermsPage },
  { name: ROUTES.privacy, component: PrivacyPolicyPage },
  { name: ROUTES.faq, component: FaqPage },
];
