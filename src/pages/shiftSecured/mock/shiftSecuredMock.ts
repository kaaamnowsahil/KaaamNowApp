import type { Option } from '@/types';

export type SecuredInfo = {
  checkInCode: string;
  contactName: string;
  arriveMinutesEarly: number;
  /** Overrides shift.dateLabel, e.g. "Today · 18 Oct 2026". */
  dateLabel?: string;
  /** Overrides shift.area. */
  workplace?: string;
  /** Cancelling inside this window is reviewed. */
  lateCancelWindow: string;
};

export const DEFAULT_SECURED: SecuredInfo = {
  checkInCode: 'KN-S2207',
  contactName: 'the shift lead',
  arriveMinutesEarly: 10,
  lateCancelWindow: '12 hours',
};

/** Keyed by shift id. */
export const SECURED: Record<string, Partial<SecuredInfo>> = {
  'shift-cafe-service': {
    checkInCode: 'KN-L1842',
    contactName: 'Meera',
    dateLabel: 'Today · 18 Oct 2026',
    workplace: '80 Feet Road, Koramangala',
    lateCancelWindow: '1 hour',
  },
  'shift-event-service': {
    checkInCode: 'KN-S2207',
    contactName: 'Karan',
    arriveMinutesEarly: 15,
    dateLabel: 'Thu, 22 Oct 2026',
    workplace: 'The Fern, Indiranagar',
  },
};

export const CANCEL_REASONS: Option[] = [
  { id: 'sick', label: 'I’m unwell' },
  { id: 'emergency', label: 'Family emergency' },
  { id: 'transport', label: 'Transport issue' },
  { id: 'clash', label: 'Another commitment' },
  { id: 'mistake', label: 'Accepted by mistake' },
  { id: 'other', label: 'Other' },
];
