import { tr } from '@/services/i18n/tr';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`bookedWorkers.${key}`, values);

/** Business "Booked workers" list and worker profile. Same text on web. */
export const BOOKED_WORKERS_STRINGS = {
  get TITLE() {
    return k('title');
  },
  get SUBTITLE() {
    return k('subtitle');
  },
  get EMPTY_TITLE() {
    return k('emptyTitle');
  },
  get EMPTY_BODY() {
    return k('emptyBody');
  },
  get BOOKED() {
    return k('booked');
  },
  get VIEW_PROFILE() {
    return k('viewProfile');
  },
  get VIEW_BOOKING() {
    return k('viewBooking');
  },
  get NEW_WORKER() {
    return k('newWorker');
  },
  bookedCount: (count: number) => k('bookedCount', { n: count }),
  rating: (avg: number, count: number) => `★ ${avg.toFixed(1)} (${count})`,
  shiftsDone: (count: number) => k('shiftsDone', { count }),
  away: (km: number) => k('away', { km: Math.round(km * 10) / 10 }),
  withdrewHeading: (count: number) => k('withdrewHeading', { n: count }),
  get WITHDREW() {
    return k('withdrew');
  },
  get CANCELLED_BOOKING() {
    return k('cancelledBooking');
  },
  get DECLINED_OFFER() {
    return k('declinedOffer');
  },
  withdrewCount: (count: number) => k('withdrewCount', { n: count }),
};

export const WORKER_PROFILE_STRINGS = {
  get TITLE() {
    return k('profile.title');
  },
  get VERIFIED() {
    return k('profile.verified');
  },
  get NOT_VERIFIED() {
    return k('profile.notVerified');
  },
  memberSince: (date: string) => k('profile.memberSince', { date }),
  get RATING() {
    return k('profile.rating');
  },
  get NO_RATING() {
    return k('profile.noRating');
  },
  reviewsCount: (count: number) => k('profile.reviewsCount', { count }),
  get SHIFTS_DONE() {
    return k('profile.shiftsDone');
  },
  get WORK_TYPES() {
    return k('profile.workTypes');
  },
  get REVIEWS() {
    return k('profile.reviews');
  },
  get NO_REVIEWS() {
    return k('profile.noReviews');
  },
  get LOAD_FAILED() {
    return k('profile.loadFailed');
  },
  get RETRY() {
    return k('profile.retry');
  },
};
