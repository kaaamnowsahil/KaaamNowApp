import type { BookingStatus, ShiftStatus } from '@/types';
import type { Tone } from '@/theme/tone';

export const SHIFT_DETAILS_STRINGS = {
  HEADER_TITLE: 'Worker mode',
  HEADER_TAG: 'Worker',
  businessMeta: (verified: boolean, rating: number, reviews: number) =>
    `${verified ? 'Verified business · ' : ''}${rating} (${reviews} reviews)`,
  rate: (rate: string) => `${rate}/hr`,
  AGREED_RATE: 'Agreed rate',
  ESTIMATED: 'Estimated earnings',
  when: (date: string, time: string) => `${date} · ${time}`,
  duration: (hours: number, note: string) =>
    `${hours} ${hours === 1 ? 'hour' : 'hours'} · ${note}`,
  where: (place: string, km: number) => `${place} · ${km} km`,
  WHAT_YOU_DO: 'What you’ll do',
  BEFORE_ACCEPT: 'Before you accept',
  CANCELLATION: 'Cancellation policy',
  MESSAGE: 'Message business',
} as const;

/** Figma "Live · Café service associate" vs "Scheduled · Event service associate". */
export const DETAILS_COPY: Record<
  ShiftStatus,
  {
    overline: (spots: number) => string;
    callout: string;
    accept: (rate: string) => string;
  }
> = {
  live: {
    overline: spots =>
      `Live · ${spots} ${spots === 1 ? 'spot' : 'spots'} available`,
    callout:
      'First-come-first-served for eligible workers. Your place is confirmed only when availability is secured.',
    accept: rate => `Accept shift · ${rate}/hour`,
  },
  scheduled: {
    overline: () => 'Scheduled · Applications open',
    callout:
      'Applying is not a booking. If selected, confirm your place before the stated deadline.',
    accept: () => 'Apply for this shift',
  },
};

/** Overline and primary action when opened for an existing booking. */
export const BOOKING_COPY: Record<
  BookingStatus,
  { overline: string; tone: Tone; action?: string }
> = {
  confirmed: {
    overline: 'Confirmed · You’re booked',
    tone: 'success',
    action: 'View my shift',
  },
  selected: {
    overline: 'Selected · Confirmation needed',
    tone: 'warning',
    action: 'Review offer',
  },
  applied: {
    overline: 'Applied · Waiting for the business',
    tone: 'primary',
    action: 'Application submitted',
  },
  completed: { overline: 'Completed', tone: 'success' },
  cancelled: { overline: 'Cancelled', tone: 'danger' },
};
