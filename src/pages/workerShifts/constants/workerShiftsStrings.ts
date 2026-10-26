import type { BookingStatus } from '@/types';

/** Same order and keys as the web My shifts sections. */
export type ShiftsSection =
  | 'inProgress'
  | 'today'
  | 'confirm'
  | 'upcoming'
  | 'past'
  | 'waiting'
  | 'declinedByBusiness'
  | 'declinedByYou';

export const WORKER_SHIFTS_STRINGS = {
  TITLE: 'My shifts',
  SUBTITLE: 'Your confirmed shifts and selected offers.',
  SECTION_TITLE: {
    inProgress: 'In progress',
    today: 'Today',
    confirm: 'Needs confirmation',
    upcoming: 'Confirmed',
    past: 'Completed',
    waiting: 'Waiting for business',
    declinedByBusiness: 'Declined by business',
    declinedByYou: 'Declined by you',
  } as Record<ShiftsSection, string>,
  status: (status: BookingStatus, code?: string) =>
    ({
      confirmed: code ? `Confirmed · ${code}` : 'Confirmed',
      selected: 'Selected · Confirmation needed',
      applied: 'Applied · Waiting for the business',
      completed: 'Completed',
      cancelled: 'Cancelled',
    })[status],
  verified: (business: string) => `${business} · Verified`,
  when: (date: string, time: string, hours: number) =>
    `${date} · ${time} · ${hours} ${hours === 1 ? 'hour' : 'hours'}`,
  where: (area: string, km: number) => `${area} · ${km} km`,
  PER_HOUR: ' / hour',
  estimated: (amount: string) => `Estimated ${amount} earnings`,
  offerPay: (rate: string, total: string) =>
    `${rate}/hour · ${total} estimated earnings`,
  confirmBy: (when: string) => `Confirm by ${when}`,
  ACTION: {
    confirmed: 'View my shift',
    selected: 'Review selected offer',
    applied: 'Withdraw application',
    completed: 'View details',
    cancelled: 'View details',
  } as Record<BookingStatus, string>,
  EMPTY_TITLE: 'No shifts yet',
  EMPTY_BODY:
    'Shifts you accept and offers businesses send you will show up here.',
  EMPTY_ACTION: 'Find shifts',
  LOAD_ERROR_TITLE: 'Couldn’t load your shifts',
  RETRY: 'Try again',
} as const;
