import type { Option } from '@/types';

export const SHIFT_SECURED_STRINGS = {
  ARRIVE_MINUTES_EARLY: 10,
  SHIFT_LEAD: 'the shift lead',
  lateCancelWindow: (hours: number) => `${hours} ${hours === 1 ? 'hour' : 'hours'}`,
  CANCEL_FAILED: 'Couldn’t cancel this shift',
} as const;

/** Labels are translated with shiftSecured.reasons.<id>. */
export const CANCEL_REASONS: Option[] = [
  { id: 'sick', label: 'I’m unwell' },
  { id: 'emergency', label: 'Family emergency' },
  { id: 'transport', label: 'Transport issue' },
  { id: 'clash', label: 'Another commitment' },
  { id: 'mistake', label: 'Accepted by mistake' },
  { id: 'other', label: 'Other' },
];
