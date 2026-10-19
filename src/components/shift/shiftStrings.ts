import type { ShiftStatus } from '@/types';

export const SHIFT_STRINGS = {
  STATUS_LABEL: {
    live: 'Live · starts soon',
    scheduled: 'Scheduled',
  } as Record<ShiftStatus, string>,
  VERIFIED: 'Verified',
  PER_HOUR: ' / hour',
  estimated: (amount: string) => `${amount} estimated / worker`,
  spotsOpen: (n: number) => `${n} ${n === 1 ? 'spot' : 'spots'} open`,
  APPLY: 'Apply to join',
  hours: (n: number) => `${n} ${n === 1 ? 'hour' : 'hours'}`,
  km: (n: number) => `${n} km`,
} as const;
