import { ROUTES } from '@/constants/routes';
import { inTab } from '@/route/tabRoutes';
import { navigationRef } from '@/route/navigationRef';
import { useAuthStore } from '@/services/auth/useAuthStore';

/** Always open the notification inbox from the Profile tab, matching web navigation. */
export const navigateToNotifications = () => {
  const tab =
    useAuthStore.getState().role === 'business'
      ? ROUTES.businessProfile
      : ROUTES.workerProfile;
  navigationRef.navigate(ROUTES.mainTabs, inTab(tab, ROUTES.notifications));
};
