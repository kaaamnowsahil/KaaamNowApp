import { ROUTES } from '@/constants/routes';
import { navigationRef } from '@/route/navigationRef';
import { apiRequest } from '@/services/api/apiClient';
import type { UserRole } from '@/services/onboarding/useOnboardingStore';

import { useAuthStore } from './useAuthStore';

/** Switches the active role on the server, then rebuilds the tabs for that role. */
export async function switchRole(role: UserRole) {
  await apiRequest('PUT', '/me/active-role', { body: { role } });
  await useAuthStore.getState().setRole(role);
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: ROUTES.mainTabs }] });
  }
}
