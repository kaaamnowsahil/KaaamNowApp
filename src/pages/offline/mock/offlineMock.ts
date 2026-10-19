import type { Shift } from '@/types';

export const SAVED_CHECK_IN_CODE = 'KN-L1842';
export const LAST_SYNCED_AT = '13:22';
export const RECONNECT_MS = 1500;

export const SAVED_SHIFT: Shift = {
  id: 'shift-cafe-service',
  status: 'live',
  categoryId: 'hospitality',
  title: 'Café service associate',
  businessTypeId: 'cafe',
  businessName: 'Third Wave Coffee',
  isVerified: true,
  dateLabel: 'Today, 18 Oct',
  timeLabel: '14:00–18:00',
  durationHours: 4,
  area: '80 Feet Road, Koramangala',
  requirement: 'Wear black, shoes closed',
  distanceKm: 1.2,
  hourlyRate: 150,
  spotsOpen: 0,
};
