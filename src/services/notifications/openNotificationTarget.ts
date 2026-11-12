import type { RemoteMessage } from '@react-native-firebase/messaging';

import { ROUTES } from '@/constants/routes';
import { navigationRef } from '@/route/navigationRef';
import { inTab, tabHome } from '@/route/tabRoutes';
import type { UserRole } from '@/services/onboarding/useOnboardingStore';
import { toShift } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import type { AppStackParamList, TabParamList } from '@/types';

import { notificationPath } from './notificationPath';

const READY_RETRIES = 20;
const READY_DELAY_MS = 250;

const waitForNavigation = async () => {
  for (let i = 0; i < READY_RETRIES && !navigationRef.isReady(); i += 1) {
    await new Promise<void>(resolve => setTimeout(resolve, READY_DELAY_MS));
  }
  return navigationRef.isReady();
};

const openInTab = <S extends keyof AppStackParamList>(
  tab: keyof TabParamList,
  screen: S,
  params?: AppStackParamList[S],
) => navigationRef.navigate(ROUTES.mainTabs, inTab(tab, screen, params));

const openTab = (tab: keyof TabParamList) =>
  navigationRef.navigate(ROUTES.mainTabs, tabHome(tab));

const inboxTab = (role: UserRole | null): keyof TabParamList =>
  role === 'business' ? ROUTES.businessProfile : ROUTES.workerProfile;

const openInbox = (role: UserRole | null) => openInTab(inboxTab(role), ROUTES.notifications);

const pathRole = (path: string): UserRole | null => {
  if (path.startsWith('/worker')) return 'worker';
  if (path.startsWith('/business')) return 'business';
  return null;
};

const idAfter = (path: string, prefix: string) => {
  if (!path.startsWith(prefix)) return '';
  const rest = path.slice(prefix.length).split('/')[0] ?? '';
  return rest.split('?')[0];
};

const FINISHED = new Set(['checked_out', 'approved']);

const openWorkerAssignment = async (assignmentId: string, role: UserRole | null) => {
  try {
    const assignment = await shiftsApi.assignment(assignmentId);
    const shift = {
      ...toShift(assignment.shift),
      assignmentId: assignment.id,
      assignmentStatus: assignment.status,
    };
    const live = assignment.shift.shift_type === 'live';
    switch (assignment.status) {
      case 'checked_in':
        openInTab(ROUTES.workerShifts, ROUTES.activeShift, { shift });
        return;
      case 'en_route':
        openInTab(ROUTES.workerShifts, ROUTES.shiftTravel, { shift });
        return;
      case 'checked_out':
      case 'approved':
        if (live) {
          openInTab(ROUTES.workerHome, ROUTES.workerLiveBooking, { assignmentId: assignment.id });
        } else {
          openInTab(ROUTES.workerShifts, ROUTES.shiftComplete, { shift });
        }
        return;
      case 'cancelled':
      case 'no_show':
        openInTab(ROUTES.workerShifts, ROUTES.shiftDetails, {
          shift,
          bookingStatus: 'cancelled',
        });
        return;
      default:
        if (live) {
          openInTab(ROUTES.workerHome, ROUTES.workerLiveBooking, { assignmentId: assignment.id });
        } else {
          openInTab(ROUTES.workerShifts, ROUTES.shiftDetails, {
            shift,
            bookingStatus: 'confirmed',
          });
        }
    }
  } catch {
    openInbox(role);
  }
};

const openWorkerShift = async (shiftId: string, role: UserRole | null) => {
  try {
    const detail = await shiftsApi.shiftDetail(shiftId);
    const shift = toShift(detail);
    const status = shift.assignmentStatus ?? '';
    const finished = Boolean(shift.assignmentId) && FINISHED.has(status);
    if (finished && shift.status === 'live') {
      openInTab(ROUTES.workerHome, ROUTES.workerLiveBooking, {
        assignmentId: shift.assignmentId as string,
      });
      return;
    }
    if (finished) {
      openInTab(ROUTES.workerShifts, ROUTES.shiftComplete, { shift });
      return;
    }
    if (status === 'cancelled' || status === 'no_show' || detail.can_reapply || detail.reapply_block_reason) {
      openInTab(ROUTES.workerShifts, ROUTES.shiftDetails, {
        shift,
        ...(status === 'cancelled' || status === 'no_show'
          ? { bookingStatus: 'cancelled' as const }
          : {}),
      });
      return;
    }
    openInTab(ROUTES.workerShifts, ROUTES.shiftDetails, { shift });
  } catch {
    openInbox(role);
  }
};

/** Opens the page for a notification path. Inbox when the path is not for this role. */
export const openNotificationPath = async (path: string, role: UserRole | null) => {
  if (!(await waitForNavigation())) return;
  const clean = path.split('?')[0].replace(/\/$/, '') || '/';
  const owner = pathRole(clean);
  if (owner && role && owner !== role) {
    openInbox(role);
    return;
  }
  if (clean === '/notifications' || clean === '/') {
    openInbox(role);
    return;
  }

  const liveBooking = idAfter(clean, '/worker/live-work/');
  if (liveBooking) {
    openInTab(ROUTES.workerHome, ROUTES.workerLiveBooking, { assignmentId: liveBooking });
    return;
  }
  if (clean === '/worker/live-work') {
    openInTab(ROUTES.workerHome, ROUTES.workerLiveWork);
    return;
  }
  const bookingId = idAfter(clean, '/worker/booking/');
  if (bookingId) {
    await openWorkerAssignment(bookingId, role);
    return;
  }
  const shiftId = idAfter(clean, '/worker/shift/');
  if (shiftId) {
    await openWorkerShift(shiftId, role);
    return;
  }
  if (clean === '/worker/earnings-history') {
    openInTab(ROUTES.workerEarnings, ROUTES.earningsHistory);
    return;
  }
  if (clean === '/worker/earnings') {
    openTab(ROUTES.workerEarnings);
    return;
  }
  if (clean === '/worker/shifts') {
    openTab(ROUTES.workerShifts);
    return;
  }
  if (clean === '/worker/profile') {
    openTab(ROUTES.workerProfile);
    return;
  }
  if (clean === '/worker/home') {
    openTab(ROUTES.workerHome);
    return;
  }

  const liveWorkId = idAfter(clean, '/business/live-work/');
  if (liveWorkId && liveWorkId !== 'new') {
    openInTab(ROUTES.businessLive, ROUTES.businessLiveWork, { bookingId: liveWorkId });
    return;
  }
  if (clean === '/business/live') {
    openTab(ROUTES.businessLive);
    return;
  }
  const businessBooking = idAfter(clean, '/business/booking/');
  if (businessBooking) {
    openInTab(ROUTES.businessShifts, ROUTES.businessScheduledWorkerTracking, {
      assignmentId: businessBooking,
    });
    return;
  }
  if (clean === '/business/payments' || clean.startsWith('/business/payments/')) {
    openInTab(ROUTES.businessProfile, ROUTES.businessPaymentHistory);
    return;
  }
  if (clean === '/business/applicants') {
    openTab(ROUTES.businessApplicants);
    return;
  }
  if (clean === '/business/roster') {
    openInTab(ROUTES.businessShifts, ROUTES.businessRoster);
    return;
  }
  if (clean === '/business/shifts') {
    openTab(ROUTES.businessShifts);
    return;
  }
  if (clean === '/business/profile') {
    openTab(ROUTES.businessProfile);
    return;
  }
  openInbox(role);
};

/** Inbox rows and pushes. `fromInbox` stays put when there is no more specific page. */
export const openNotificationTarget = async (
  data: Record<string, unknown>,
  role: UserRole | null,
  options?: { fromInbox?: boolean },
) => {
  const path = notificationPath(
    { kind: typeof data.kind === 'string' ? data.kind : undefined, data },
    role,
  );
  if (options?.fromInbox && (path === '/notifications' || path === '/')) return;
  await openNotificationPath(path, role);
};

/** Booking pushes open the booking; a stored path opens that page; everything else opens the inbox. */
export const openFromPush = async (message: RemoteMessage, role: UserRole | null) => {
  const data = message.data ?? {};
  if (typeof data.path === 'string' && data.path.startsWith('/') && !data.path.startsWith('//')) {
    await openNotificationPath(data.path, role);
    return;
  }
  if (!(await waitForNavigation())) return;
  const assignmentId = data.assignment_id;
  if (typeof assignmentId !== 'string' || !assignmentId) {
    openInbox(role);
    return;
  }
  if (role === 'business') {
    openInTab(ROUTES.businessShifts, ROUTES.businessScheduledWorkerTracking, { assignmentId });
    return;
  }
  await openWorkerAssignment(assignmentId, role);
};
