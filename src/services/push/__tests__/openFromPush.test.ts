import type { RemoteMessage } from '@react-native-firebase/messaging';

import { ROUTES } from '@/constants/routes';
import { navigationRef } from '@/route/navigationRef';
import { shiftsApi } from '@/services/shifts/shiftsApi';

import { openFromPush } from '../usePushNotifications';

jest.mock('@/route/navigationRef', () => ({
  navigationRef: { isReady: jest.fn(() => true), navigate: jest.fn() },
}));
jest.mock('@/services/shifts/shiftsApi', () => ({ shiftsApi: { assignment: jest.fn() } }));
jest.mock('@/services/shifts/shiftMappers', () => ({
  toShift: (shift: { id: string }) => ({ id: shift.id }),
}));

const navigate = navigationRef.navigate as unknown as jest.Mock;
const assignment = shiftsApi.assignment as jest.Mock;
const message = (data?: Record<string, string>) => ({ data }) as unknown as RemoteMessage;
/** Every push opens inside a tab so the bottom tabs stay visible. */
const expectTab = (tab: string, screen: string, params?: object) =>
  expect(navigate).toHaveBeenCalledWith(ROUTES.mainTabs, {
    screen: tab,
    params: { screen, params },
  });

describe('openFromPush', () => {
  beforeEach(() => {
    navigate.mockReset();
    assignment.mockReset();
  });

  it('opens the inbox for pushes without a booking', async () => {
    await openFromPush(message({ kind: 'verification' }), 'worker');
    expectTab(ROUTES.workerProfile, ROUTES.notifications);
  });

  it('opens worker tracking for a business booking push', async () => {
    await openFromPush(message({ assignment_id: 'a1' }), 'business');
    expectTab(ROUTES.businessShifts, ROUTES.businessScheduledWorkerTracking, {
      assignmentId: 'a1',
    });
  });

  it('opens the live shift for a checked-in worker', async () => {
    assignment.mockResolvedValue({ id: 'a1', status: 'checked_in', shift: { id: 's1' } });
    await openFromPush(message({ assignment_id: 'a1' }), 'worker');
    expectTab(ROUTES.workerShifts, ROUTES.activeShift, {
      shift: { id: 's1', assignmentId: 'a1', assignmentStatus: 'checked_in' },
    });
  });

  it('opens a finished live booking on the done screen', async () => {
    assignment.mockResolvedValue({
      id: 'a1',
      status: 'approved',
      shift: { id: 's1', shift_type: 'live' },
    });
    await openFromPush(message({ assignment_id: 'a1' }), 'worker');
    expectTab(ROUTES.workerHome, ROUTES.workerLiveBooking, { assignmentId: 'a1' });
  });

  it('opens a withdrawn booking as cancelled, not as a check-in', async () => {
    assignment.mockResolvedValue({
      id: 'a1',
      status: 'cancelled',
      shift: { id: 's1', shift_type: 'live' },
    });
    await openFromPush(message({ assignment_id: 'a1' }), 'worker');
    expectTab(ROUTES.workerShifts, ROUTES.shiftDetails, {
      shift: { id: 's1', assignmentId: 'a1', assignmentStatus: 'cancelled' },
      bookingStatus: 'cancelled',
    });
  });

  it('opens booking details for other worker bookings', async () => {
    assignment.mockResolvedValue({ id: 'a1', status: 'confirmed', shift: { id: 's1' } });
    await openFromPush(message({ assignment_id: 'a1' }), 'worker');
    expectTab(ROUTES.workerShifts, ROUTES.shiftDetails, {
      shift: { id: 's1', assignmentId: 'a1', assignmentStatus: 'confirmed' },
      bookingStatus: 'confirmed',
    });
  });

  it('falls back to the inbox when the booking cannot be loaded', async () => {
    assignment.mockRejectedValue(new Error('offline'));
    await openFromPush(message({ assignment_id: 'a1' }), 'worker');
    expectTab(ROUTES.workerProfile, ROUTES.notifications);
  });

  it('opens the business inbox on the dashboard tab', async () => {
    await openFromPush(message({ kind: 'verification' }), 'business');
    expectTab(ROUTES.businessProfile, ROUTES.notifications);
  });

  it('opens the page stored on the push', async () => {
    await openFromPush(message({ path: '/business/live-work/s1' }), 'business');
    expectTab(ROUTES.businessLive, ROUTES.businessLiveWork, { bookingId: 's1' });
  });

  it('opens worker earnings from the stored path', async () => {
    await openFromPush(message({ path: '/worker/earnings' }), 'worker');
    expect(navigate).toHaveBeenCalledWith(ROUTES.mainTabs, {
      screen: ROUTES.workerEarnings,
      params: { screen: ROUTES.workerEarningsHome, pop: true },
    });
  });

  it('stays in the inbox when the path is for the other role', async () => {
    await openFromPush(message({ path: '/business/shifts' }), 'worker');
    expectTab(ROUTES.workerProfile, ROUTES.notifications);
  });
});
