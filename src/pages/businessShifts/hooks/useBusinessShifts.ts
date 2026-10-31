import { useNavigation } from '@react-navigation/native';

import { ROUTES } from '@/constants/routes';
import { meApi } from '@/services/api/meApi';
import {
  shiftsApi,
  type ApiShiftStatus,
  type BusinessShiftItem,
} from '@/services/shifts/shiftsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { TabAppNavigation } from '@/types';

import { useShiftCardActions } from './useShiftCardActions';

export type ShiftSection =
  | 'live'
  | 'awaiting_payment'
  | 'draft'
  | 'completed'
  | 'upcoming'
  | 'in_progress'
  | 'expired'
  | 'cancelled';

const SHIFT_SECTIONS: { key: ShiftSection; titleKey: string }[] = [
  { key: 'live', titleKey: 'businessDashboard.liveNow' },
  { key: 'in_progress', titleKey: 'businessDashboard.shiftStatus.inProgress' },
  { key: 'upcoming', titleKey: 'businessDashboard.upcoming' },
  { key: 'awaiting_payment', titleKey: 'businessShifts.paymentPending' },
  { key: 'draft', titleKey: 'businessDashboard.shiftStatus.draft' },
  { key: 'completed', titleKey: 'businessDashboard.shiftStatus.completed' },
  { key: 'expired', titleKey: 'businessDashboard.shiftStatus.expired' },
  { key: 'cancelled', titleKey: 'businessDashboard.shiftStatus.cancelled' },
];

const PAST_SECTIONS: ShiftSection[] = ['completed', 'expired', 'cancelled'];

const SECTION_BY_STATUS: Record<ApiShiftStatus, ShiftSection> = {
  awaiting_payment: 'awaiting_payment',
  draft: 'draft',
  searching: 'upcoming',
  open: 'upcoming',
  filled: 'upcoming',
  in_progress: 'in_progress',
  completed: 'completed',
  expired: 'expired',
  cancelled: 'cancelled',
};

const ACTIVE_STATUSES: ApiShiftStatus[] = [
  'searching',
  'open',
  'filled',
  'in_progress',
];

/** Active live requests get their own section, as on web. */
const sectionOf = (shift: BusinessShiftItem): ShiftSection =>
  shift.shift_type === 'live' && ACTIVE_STATUSES.includes(shift.status)
    ? 'live'
    : SECTION_BY_STATUS[shift.status];

const byStart = (a: BusinessShiftItem, b: BusinessShiftItem) =>
  new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();

/** Business Shifts tab: every live and scheduled shift grouped by status, as on web. */
export const useBusinessShifts = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const query = useApiQuery(
    () =>
      Promise.all([
        meApi.profile(),
        shiftsApi.businessShifts({ shift_type: 'live' }),
        shiftsApi.businessShifts({ shift_type: 'scheduled' }),
      ]),
    [],
  );
  const [profile, live, scheduled] = query.data ?? [];
  const shifts = [...(live?.items ?? []), ...(scheduled?.items ?? [])].sort(
    byStart,
  );
  const business = profile?.business;

  const actions = useShiftCardActions(query.reload);

  return {
    isLoading: query.isLoading,
    error: query.error,
    reload: query.reload,
    businessName: business?.business_name ?? '',
    isVerified: business?.verification_status === 'verified',
    hasShifts: shifts.length > 0,
    sections: SHIFT_SECTIONS.map(section => ({
      ...section,
      shifts: shifts
        .filter(shift => sectionOf(shift) === section.key)
        .sort((a, b) =>
          PAST_SECTIONS.includes(section.key) ? byStart(b, a) : byStart(a, b),
        ),
    })).filter(section => section.shifts.length > 0),
    ...actions,
    openBooked: (shift: BusinessShiftItem) =>
      navigation.navigate(ROUTES.businessRoster, { shiftId: shift.id }),
    openSchedule: () => navigation.navigate(ROUTES.businessShiftSchedule),
    openApplicants: () => navigation.navigate(ROUTES.businessApplicants),
    /** The tracking screen lives in the Dashboard tab, so the tabs stay visible. */
    openLive: (shift: BusinessShiftItem) =>
      navigation.navigate(ROUTES.businessLive, {
        screen: ROUTES.businessLiveWork,
        params: { bookingId: shift.id },
      } as never),
  };
};
