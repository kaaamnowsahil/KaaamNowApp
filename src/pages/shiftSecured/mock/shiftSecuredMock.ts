import type { Option } from '@/types';

export const SECURED = {
  checkInCode: 'KN-L1842',
  contactName: 'Meera',
  arriveMinutesEarly: 10,
  startTime: '14:00',
  dateLabel: 'Today · 18 Oct 2026',
  workplace: '80 Feet Road, Koramangala',
  /** Cancelling inside this window is reviewed. */
  lateCancelWindow: '1 hour',
};

export const CANCEL_REASONS: Option[] = [
  { id: 'sick', label: 'I’m unwell' },
  { id: 'emergency', label: 'Family emergency' },
  { id: 'transport', label: 'Transport issue' },
  { id: 'clash', label: 'Another commitment' },
  { id: 'mistake', label: 'Accepted by mistake' },
  { id: 'other', label: 'Other' },
];
