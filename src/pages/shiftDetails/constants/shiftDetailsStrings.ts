import { WORKER_CANCELLATION_STRINGS } from '@/components/shiftFlow/workerCancellationStrings';
import { tr } from '@/services/i18n/tr';
import type { BookingStatus, ShiftStatus } from '@/types';
import type { Tone } from '@/theme/tone';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`shiftDetails.${key}`, values);

export const SHIFT_DETAILS_STRINGS = {
  get HEADER_TITLE() {
    return k('headerTitle');
  },
  get HEADER_TAG() {
    return k('headerTag');
  },
  businessMeta: (verified: boolean, rating: number, reviews: number) =>
    k(verified ? 'businessMetaVerified' : 'businessMeta', { rating, reviews }),
  rate: (rate: string) => k('rate', { rate }),
  get AGREED_RATE() {
    return k('agreedRate');
  },
  get ESTIMATED() {
    return k('estimated');
  },
  when: (date: string, time: string) => `${date} · ${time}`,
  duration: (hours: number, note: string) =>
    k('durationHours', { count: hours, note }),
  where: (place: string, km: number) => k('where', { place, km }),
  get WHAT_YOU_DO() {
    return k('whatYouDo');
  },
  get BEFORE_ACCEPT() {
    return k('beforeAccept');
  },
  get MESSAGE() {
    return k('message');
  },
  breakNote: (minutes: number) =>
    minutes ? k('breakNote', { minutes }) : k('noBreak'),
  scheduledDuration: (hours: number, breakMinutes: number) =>
    breakMinutes
      ? k('scheduledDurationBreak', { hours, minutes: breakMinutes })
      : k('scheduledDuration', { hours }),
  get NO_DETAILS() {
    return k('noDetails');
  },
  get ACCEPT_FAILED() {
    return k('acceptFailed');
  },
  get APPLY_FAILED() {
    return k('applyFailed');
  },
  get CONTACT_FAILED() {
    return k('contactFailed');
  },
  timeConflict: (isLive: boolean) =>
    k(isLive ? 'timeConflictLive' : 'timeConflictScheduled'),
  get TIME_CONFLICT_ACTION() {
    return k('timeConflictAction');
  },
  get NEXT_STEPS() {
    return k('nextSteps');
  },
  get ACTIVITY() {
    return k('activityTitle');
  },
  get WITHDRAWN() {
    return k('withdrawn');
  },
  get YOU_WITHDREW() {
    return k('youWithdrew');
  },
  get CANT_APPLY_AGAIN() {
    return k('cantApplyAgain');
  },
  againAction: (isLive: boolean) => k(isLive ? 'acceptAgain' : 'bookAgain'),
  activity: {
    get APPLIED() {
      return k('activity.applied');
    },
    selected: (business: string) => k('activity.selected', { business }),
    get CONFIRMED() {
      return k('activity.confirmed');
    },
    get ACCEPTED() {
      return k('activity.accepted');
    },
    get ON_THE_WAY() {
      return k('activity.onTheWay');
    },
    get CHECKED_IN() {
      return k('activity.checkedIn');
    },
    get CHECKED_OUT() {
      return k('activity.checkedOut');
    },
    approved: (business: string) => k('activity.approved', { business }),
    get WITHDRAWN() {
      return k('activity.withdrawn');
    },
    cancelledByBusiness: (business: string) =>
      k('activity.cancelledByBusiness', { business }),
  },
  travelStep: (time: string) => k('travelStep', { time }),
  checkInStep: (time: string) => k('checkInStep', { time }),
  get CHECK_OUT_STEP() {
    return k('checkOutStep');
  },
  get HEAD_TO_BUSINESS() {
    return k('headToBusiness');
  },
  travelOpensAt: (time: string) => k('travelOpensAt', { time }),
  get CHECK_IN() {
    return k('checkIn');
  },
  get DIRECTIONS() {
    return k('directions');
  },
  get EMERGENCY() {
    return k('emergency');
  },
  get WITHDRAW() {
    return k('withdraw');
  },
  get TRAVEL_FAILED() {
    return k('travelFailed');
  },
  get PREVIEW_FAILED() {
    return k('previewFailed');
  },
  get CANCEL_FAILED() {
    return k('cancelFailed');
  },
};

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
    overline: spots => k('detailsCopy.live.overline', { count: spots }),
    get callout() {
      return k('detailsCopy.live.callout');
    },
    accept: rate => k('detailsCopy.live.accept', { rate }),
  },
  scheduled: {
    overline: () => k('detailsCopy.scheduled.overline'),
    get callout() {
      return WORKER_CANCELLATION_STRINGS.BOOKING_NOTE;
    },
    accept: () => k('detailsCopy.scheduled.accept'),
  },
};

/** Overline and primary action when opened for an existing booking. */
export const BOOKING_COPY: Record<
  BookingStatus,
  { overline: string; tone: Tone; action?: string }
> = {
  confirmed: {
    get overline() {
      return k('bookingCopy.confirmed.overline');
    },
    tone: 'success',
    get action() {
      return k('bookingCopy.confirmed.action');
    },
  },
  selected: {
    get overline() {
      return k('bookingCopy.selected.overline');
    },
    tone: 'warning',
    get action() {
      return k('bookingCopy.selected.action');
    },
  },
  applied: {
    get overline() {
      return k('bookingCopy.applied.overline');
    },
    tone: 'primary',
    get action() {
      return k('bookingCopy.applied.action');
    },
  },
  completed: {
    get overline() {
      return k('bookingCopy.completed.overline');
    },
    tone: 'success',
  },
  cancelled: {
    get overline() {
      return k('bookingCopy.cancelled.overline');
    },
    tone: 'danger',
  },
};
