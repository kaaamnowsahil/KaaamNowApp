import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { errorMessage } from '@/services/api/apiClient';
import { meApi } from '@/services/api/meApi';
import { payInvoice } from '@/services/billing/billingApi';
import {
  shiftsApi,
  type ApiShiftStatus,
  type BusinessShiftItem,
  type ShiftCancelPreview,
} from '@/services/shifts/shiftsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { TabAppNavigation } from '@/types';

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

  const [cancelTarget, setCancelTarget] = useState<BusinessShiftItem | null>(
    null,
  );
  const [cancelPreview, setCancelPreview] = useState<ShiftCancelPreview | null>(
    null,
  );
  const [cancelError, setCancelError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [cardError, setCardError] = useState<{
    shiftId: string;
    message: string;
  } | null>(null);

  const openCancel = (shift: BusinessShiftItem) => {
    setCancelError('');
    setCancelPreview(null);
    setCancelTarget(shift);
    if (shift.shift_type === 'scheduled' && shift.booked_count > 0) {
      shiftsApi
        .shiftCancelPreview(shift.id)
        .then(setCancelPreview)
        .catch(() => undefined);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    setCancelError('');
    try {
      await shiftsApi.cancelShift(cancelTarget.id, '');
      setCancelTarget(null);
      query.reload();
    } catch (error) {
      setCancelError(errorMessage(error));
    } finally {
      setIsCancelling(false);
    }
  };

  const payDeposit = async (shift: BusinessShiftItem) => {
    if (!shift.deposit_invoice_id || payingId) return;
    setPayingId(shift.id);
    setCardError(null);
    try {
      await payInvoice(shift.deposit_invoice_id);
      query.reload();
    } catch (error) {
      setCardError({ shiftId: shift.id, message: errorMessage(error) });
    } finally {
      setPayingId(null);
    }
  };

  const publish = async (shift: BusinessShiftItem) => {
    if (publishingId) return;
    setPublishingId(shift.id);
    setCardError(null);
    try {
      await shiftsApi.publishShift(shift.id);
      query.reload();
    } catch (error) {
      setCardError({ shiftId: shift.id, message: errorMessage(error) });
    } finally {
      setPublishingId(null);
    }
  };

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
    cancelTarget,
    cancelPreview,
    cancelError,
    isCancelling,
    openCancel,
    closeCancel: () => {
      if (!isCancelling) setCancelTarget(null);
    },
    confirmCancel,
    payingId,
    publishingId,
    cardError,
    payDeposit,
    publish,
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
