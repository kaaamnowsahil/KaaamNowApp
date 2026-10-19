import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { Booking, TabAppNavigation } from '@/types';

import type { ShiftsSection } from '../constants';
import { BOOKINGS, HAS_UNREAD_NOTIFICATIONS } from '../mock';

const SECTION_ORDER: ShiftsSection[] = [
  'today',
  'confirm',
  'upcoming',
  'applied',
  'past',
];

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
  const isLoading = useMockLoading();
  const [bookings, setBookings] = useState(BOOKINGS);

  const openBooking = ({ status, isToday, shift }: Booking) => {
    if (status === 'selected') {
      navigation.navigate(ROUTES.shiftSelected, { shift });
    } else if (status === 'confirmed' && isToday) {
      navigation.navigate(ROUTES.shiftSecured, { shift });
    } else {
      navigation.navigate(ROUTES.shiftDetails, { shift, bookingStatus: status });
    }
  };

  return {
    isLoading,
    hasUnread: HAS_UNREAD_NOTIFICATIONS,
    sections: SECTION_ORDER.map(id => ({
      id,
      bookings: bookings.filter(b => sectionOf(b) === id),
    })).filter(section => section.bookings.length),
    openBooking,
    /** Applied bookings withdraw in place; everything else opens details. */
    runAction: (booking: Booking) =>
      booking.status === 'applied'
        ? setBookings(prev => prev.filter(b => b.id !== booking.id))
        : openBooking(booking),
    openNotifications: () => navigation.navigate(ROUTES.notifications),
    findShifts: () => navigation.navigate(ROUTES.workerHome),
  };
};
