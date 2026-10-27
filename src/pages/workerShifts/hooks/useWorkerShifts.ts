import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ROUTES } from '@/constants/routes';
import { errorMessage } from '@/services/api/apiClient';
import { getDevicePosition } from '@/services/maps/devicePosition';
import {
  formatDateTime,
  fromMinor,
  isToday,
  toShift,
} from '@/services/shifts/shiftMappers';
import {
  shiftsApi,
  type MyShiftItem,
  type MyShiftsTab,
} from '@/services/shifts/shiftsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type {
  Booking,
  BookingStatus,
  MyShiftStatus,
  TabAppNavigation,
} from '@/types';

import { WORKER_SHIFTS_STRINGS, type ShiftsSection } from '../constants';

const SECTION_ORDER: ShiftsSection[] = [
  'live',
  'inProgress',
  'today',
  'confirm',
  'upcoming',
  'past',
  'waiting',
  'declinedByBusiness',
  'declinedByYou',
];
const TABS: MyShiftsTab[] = ['applications', 'upcoming', 'active', 'completed'];
const CLOSED_APPLICATION: MyShiftStatus[] = [
  'declined',
  'rejected',
  'withdrawn',
  'expired',
];

type Entry = { booking: Booking; section: ShiftsSection };
export type SelectionAction = 'confirm' | 'decline';

const statusOf = (item: MyShiftItem): MyShiftStatus => {
  const application = item.application_status as MyShiftStatus | undefined;
  if (application === 'selected' || application === 'applied')
    return application;
  if (application && CLOSED_APPLICATION.includes(application))
    return application;
  if (item.assignment_status === 'cancelled') return 'cancelled';
  return item.tab === 'completed' ? 'completed' : 'confirmed';
};

const sectionOf = (item: MyShiftItem): ShiftsSection | null => {
  if (item.tab === 'applications') {
    switch (item.application_status) {
      case 'selected':
        return 'confirm';
      case 'applied':
        return 'waiting';
      case 'rejected':
        return 'declinedByBusiness';
      case 'declined':
      case 'withdrawn':
        return 'declinedByYou';
      default:
        return null;
    }
  }
  if (
    item.shift.shift_type === 'live' &&
    (item.tab === 'upcoming' || item.tab === 'active')
  )
    return 'live';
  if (item.tab === 'active') return 'inProgress';
  if (item.tab === 'completed') return 'past';
  return isToday(item.shift.starts_at) ? 'today' : 'upcoming';
};

const statusTimeOf = (item: MyShiftItem, status: MyShiftStatus) => {
  if (item.tab !== 'applications') {
    return item.responded_at
      ? { key: 'confirmed', at: item.responded_at }
      : undefined;
  }
  const at =
    status === 'applied'
      ? item.applied_at
      : status === 'declined' || status === 'withdrawn'
      ? item.responded_at
      : item.decided_at;
  return at ? { key: status, at } : undefined;
};

const toEntry = (item: MyShiftItem): Entry | null => {
  const section = sectionOf(item);
  if (!section) return null;
  const status = statusOf(item);
  const shift = {
    ...toShift(item.shift),
    applicationId: item.application_id ?? item.shift.my_application_id ?? null,
    applicationStatus: item.application_status ?? null,
    assignmentId: item.assignment_id ?? item.shift.my_assignment_id ?? null,
    assignmentStatus: item.assignment_status ?? null,
    confirmBy: item.confirm_by ? formatDateTime(item.confirm_by) : undefined,
  };
  const statusTime = statusTimeOf(item, status);
  return {
    section,
    booking: {
      id: item.assignment_id ?? item.application_id ?? item.shift.id,
      status,
      shift,
      confirmBy: shift.confirmBy,
      isToday:
        section === 'today' ||
        section === 'inProgress' ||
        (section === 'live' && isToday(item.shift.starts_at)),
      statusTime: statusTime && {
        key: statusTime.key,
        at: formatDateTime(statusTime.at),
      },
      estimatedPay: fromMinor(
        item.earned_minor ?? item.shift.estimated_pay_minor,
      ),
      businessRating: item.shift.business.rating_count
        ? {
            avg: item.shift.business.rating_avg,
            count: item.shift.business.rating_count,
          }
        : undefined,
    },
  };
};

export const useWorkerShifts = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const [pending, setPending] = useState<{
    id: string;
    action: SelectionAction;
  } | null>(null);
  const query = useApiQuery(async () => {
    const position = await getDevicePosition(5000);
    const pages = await Promise.all(
      TABS.map(tab => shiftsApi.myShifts(tab, position)),
    );
    return pages
      .flatMap(page => page.items)
      .map(toEntry)
      .filter((entry): entry is Entry => Boolean(entry));
  }, []);
  const entries = query.data ?? [];

  const openBooking = ({ status, shift }: Booking) => {
    if (status === 'selected') {
      navigation.navigate(ROUTES.shiftSelected, { shift });
    } else if (shift.status === 'live' && shift.assignmentId) {
      navigation.navigate(ROUTES.workerLiveBooking, {
        assignmentId: shift.assignmentId,
      });
    } else if (shift.assignmentStatus === 'checked_in') {
      navigation.navigate(ROUTES.activeShift, { shift });
    } else if (shift.assignmentStatus === 'en_route') {
      navigation.navigate(ROUTES.shiftTravel, { shift });
    } else if (CLOSED_APPLICATION.includes(status)) {
      navigation.navigate(ROUTES.shiftDetails, { shift });
    } else {
      navigation.navigate(ROUTES.shiftDetails, {
        shift,
        bookingStatus: status as BookingStatus,
      });
    }
  };

  const respondToSelection = async (
    booking: Booking,
    action: SelectionAction,
  ) => {
    const applicationId = booking.shift.applicationId;
    if (!applicationId || pending) return;
    setPending({ id: booking.id, action });
    try {
      await (action === 'confirm'
        ? shiftsApi.confirmSelection(applicationId)
        : shiftsApi.declineSelection(applicationId));
    } catch (error) {
      Alert.alert(WORKER_SHIFTS_STRINGS.UPDATE_FAILED, errorMessage(error));
    } finally {
      setPending(null);
      query.reload();
    }
  };

  return {
    isLoading: query.isLoading,
    error: query.error,
    retry: query.reload,
    sections: SECTION_ORDER.map(id => ({
      id,
      bookings: entries
        .filter(entry => entry.section === id)
        .map(entry => entry.booking),
    })).filter(section => section.bookings.length),
    pending,
    openBooking,
    respondToSelection,
    openNotifications: () => navigation.navigate(ROUTES.notifications),
    findShifts: () => navigation.navigate(ROUTES.workerHome),
  };
};
