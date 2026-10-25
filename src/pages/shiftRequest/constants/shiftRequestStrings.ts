import { BRAND } from '@/constants/brand';
import type { ShiftStatus } from '@/types';

export const SHIFT_REQUEST_STRINGS = {
  SENDER: BRAND.NAME,
  SENDER_INITIAL: BRAND.NAME.charAt(0),
  SENT_AT: 'now',
  PAY_NOTE: 'paid after the shift',
  BADGE: { live: 'Now', scheduled: 'Open' } as Record<ShiftStatus, string>,
  ACCEPT_FAILED: 'Couldn’t accept this request',
  APPLY_FAILED: 'Couldn’t apply for this shift',
  DECLINE_FAILED: 'Couldn’t decline this request',
} as const;
