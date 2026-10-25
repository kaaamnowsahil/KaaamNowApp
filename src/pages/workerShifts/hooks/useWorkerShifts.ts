import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ROUTES } from '@/constants/routes';
import { errorMessage } from '@/services/api/apiClient';
import { formatDateTime, isToday, toShift } from '@/services/shifts/shiftMappers';
import { shiftsApi, type MyShiftItem, type MyShiftsTab } from '@/services/shifts/shiftsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { Booking, BookingStatus, TabAppNavigation } from '@/types';

import type { ShiftsSection } from '../constants';

const SECTION_ORDER: ShiftsSection[] = ['today', 'confirm', 'upcoming', 'applied', 'past'];
const TABS: MyShiftsTab[] = ['active', 'upcoming', 'applications', 'completed'];

const bookingStatus = (item: MyShiftItem): BookingStatus | null => {
  if (item.tab === 'applications') {
    if (item.application_status === 'applied') return 'applied';
    if (item.application_status === 'selected') return 'selected';
    return null;
  }
  if (item.tab === 'completed') return 'completed';
  return 'confirmed';
};

const toBooking = (item: MyShiftItem): Booking | null => {
  const status = bookingStatus(item);
  if (!status) return null;
  const shift = {
    ...toShift(item.shift),
    applicationId: item.application_id ?? item.shift.my_application_id ?? null,
    applicationStatus: item.application_status ?? null,
    assignmentId: item.assignment_id ?? item.shift.my_assignment_id ?? null,
    assignmentStatus: item.assignment_status ?? null,
    confirmBy: item.confirm_by ? formatDateTime(item.confirm_by) : undefined,
  };
  return {
    id: item.assignment_id ?? item.application_id ?? item.shift.id,
    status,
    shift,
    confirmBy: shift.confirmBy,
    isToday: item.tab === 'active' || isToday(item.shift.starts_at),
  };
};

const sectionOf = (b: Booking): ShiftsSection => {
  switch (b.status) {
    case 'confirmed':
      return b.isToday ? 'today' : 'upcoming';
    case 'selected':
      return 'confirm';
    case 'applied':
      return 'applied';
    default:
      return 'past';
  }
};

export const useWorkerShifts = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const query = useApiQuery(async () => {
    const pages = await Promise.all(TABS.map(tab => shiftsApi.myShifts(tab)));
    return pages
      .flatMap(page => page.items)
      .map(toBooking)
      .filter((booking): booking is Booking => Boolean(booking));
  }, []);
  const bookings = query.data ?? [];

  const openBooking = ({ status, isToday: today, shift }: Booking) => {
    if (status === 'selected') {
      navigation.navigate(ROUTES.shiftSelected, { shift });
    } else if (shift.assignmentStatus === 'checked_in') {
      navigation.navigate(ROUTES.activeShift, { shift });
    } else if (shift.assignmentStatus === 'en_route') {
      navigation.navigate(ROUTES.shiftTravel, { shift });
    } else if (status === 'confirmed' && today) {
      navigation.navigate(ROUTES.shiftSecured, { shift });
    } else {
      navigation.navigate(ROUTES.shiftDetails, { shift, bookingStatus: status });
    }
  };

  const withdraw = async (booking: Booking) => {
    if (!booking.shift.applicationId || withdrawingId) return;
    setWithdrawingId(booking.id);
    try {
      await shiftsApi.withdrawApplication(booking.shift.applicationId);
      query.setData(prev => (prev ?? []).filter(b => b.id !== booking.id));
    } catch (error) {
      Alert.alert('Couldn’t withdraw', errorMessage(error));
    } finally {
      setWithdrawingId(null);
    }
  };

  return {
    isLoading: query.isLoading,
    error: query.error,
    retry: query.reload,
    sections: SECTION_ORDER.map(id => ({
      id,
      bookings: bookings.filter(b => sectionOf(b) === id),
    })).filter(section => section.bookings.length),
    openBooking,
    /** Applied bookings withdraw in place; everything else opens details. */
    runAction: (booking: Booking) =>
      booking.status === 'applied' ? withdraw(booking) : openBooking(booking),
    openNotifications: () => navigation.navigate(ROUTES.notifications),
    findShifts: () => navigation.navigate(ROUTES.workerHome),
  };
};
