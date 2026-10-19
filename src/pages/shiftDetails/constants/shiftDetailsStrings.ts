import type { BookingStatus } from '@/types';

export const SHIFT_DETAILS_STRINGS = {
  TITLE: 'Shift details',
  PER_HOUR: ' / hour',
  estimated: (amount: string, hours: number) =>
    `${amount} for ${hours} ${hours === 1 ? 'hour' : 'hours'}`,
  WHEN: 'When',
  WHERE: 'Where',
  REQUIREMENT: 'Requirement',
  BREAK: 'Break',
  MANAGER: 'Report to',
  ABOUT: 'About the shift',
  BRING: 'What to bring',
  away: (km: number) => `${km} km away`,
  ACCEPT: 'Accept shift',
  APPLY: 'Apply to join',
  APPLIED: 'Applied · waiting for the business',
  ACCEPTED: 'Shift accepted · see it in My shifts',
  APPLIED_NOTE:
    'We’ll notify you as soon as the business replies. You can withdraw from My shifts.',
  ACCEPTED_NOTE: 'You’re booked. Your check-in code is in My shifts.',
  BOOKING_NOTE: {
    confirmed: 'You’re booked for this shift.',
    selected: 'The business selected you. Confirm to lock in this shift.',
    applied: 'You applied. Waiting for the business to reply.',
    completed: 'You completed this shift.',
    cancelled: 'This shift was cancelled.',
  } as Record<BookingStatus, string>,
  CONFIRM_OFFER: 'Confirm shift',
  DECLINE_OFFER: 'Decline offer',
  OFFER_CONFIRMED: 'Confirmed · you’re booked for this shift.',
  statusLine: (isLive: boolean, spots?: number) => {
    const status = isLive ? 'Live' : 'Scheduled';
    return spots === undefined
      ? status
      : `${status} · ${spots} ${spots === 1 ? 'spot' : 'spots'} left`;
  },
  verified: (business: string) => `${business} · Verified`,
} as const;
