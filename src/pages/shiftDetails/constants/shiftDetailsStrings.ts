import { WORKER_CANCELLATION_STRINGS } from '@/components/shiftFlow/workerCancellationStrings';
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
  MESSAGE: 'Message business',
  breakNote: (minutes: number) =>
    minutes ? `includes ${minutes} min break` : 'no break',
  scheduledDuration: (hours: number, breakMinutes: number) =>
    `${hours} hours${breakMinutes ? ` · includes ${breakMinutes}-min paid break` : ''}`,
  NO_DETAILS: 'The business hasn’t added details yet.',
  ACCEPT_FAILED: 'Couldn’t accept this shift',
  APPLY_FAILED: 'Couldn’t book this shift',
  CONTACT_FAILED: 'Couldn’t reach the business',
  timeConflict: (isLive: boolean) =>
    `${isLive ? 'Live' : 'Scheduled'} · Clashes with your booking`,
  TIME_CONFLICT_ACTION: 'You have a shift at this time',
  NEXT_STEPS: 'What happens next',
  ACTIVITY: 'Activity',
  WITHDRAWN: 'Withdrawn',
  activity: {
    APPLIED: 'You applied',
    selected: (business: string) => `Selected by ${business}`,
    CONFIRMED: 'You confirmed',
    ACCEPTED: 'You accepted',
    ON_THE_WAY: 'You started travelling',
    CHECKED_IN: 'Checked in',
    CHECKED_OUT: 'Checked out',
    approved: (business: string) => `Hours approved by ${business}`,
    WITHDRAWN: 'You withdrew',
    cancelledByBusiness: (business: string) => `Cancelled by ${business}`,
  },
  travelStep: (time: string) =>
    `Tap Head to business from ${time} so the business can see you are on the way.`,
  checkInStep: (time: string) =>
    `Check in at the workplace from ${time} with the code from the site contact.`,
  CHECK_OUT_STEP: 'Check out when you finish so your hours are recorded and paid.',
  HEAD_TO_BUSINESS: 'Head to business',
  travelOpensAt: (time: string) => `Travel opens ${time}`,
  CHECK_IN: 'Check in',
  DIRECTIONS: 'Get directions',
  EMERGENCY: 'Emergency help',
  WITHDRAW: 'Withdraw from this shift',
  TRAVEL_FAILED: 'Couldn’t start travel',
  PREVIEW_FAILED: 'Couldn’t check the cancellation fee',
  CANCEL_FAILED: 'Couldn’t withdraw from this shift',
} as const;

/** Scheduled shifts: "Head to business" unlocks this many hours before the start (same as web). */
export const TRAVEL_OPENS_HOURS_BEFORE = 3;

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
    overline: () => 'Scheduled · Open for booking',
    callout: WORKER_CANCELLATION_STRINGS.BOOKING_NOTE,
    accept: () => 'Book this shift',
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
