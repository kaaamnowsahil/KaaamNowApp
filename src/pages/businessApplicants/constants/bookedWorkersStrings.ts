/** Business "Booked workers" list and worker profile. Same text on web. */
export const BOOKED_WORKERS_STRINGS = {
  TITLE: 'Booked workers',
  SUBTITLE: 'Workers book open seats directly. See who is coming to each of your shifts.',
  EMPTY_TITLE: 'No bookings yet',
  EMPTY_BODY: 'When workers book your shifts, they’ll appear here.',
  BOOKED: 'Booked',
  VIEW_PROFILE: 'View profile',
  VIEW_BOOKING: 'View booking',
  NEW_WORKER: 'New worker',
  bookedCount: (count: number) => `${count} booked`,
  rating: (avg: number, count: number) => `★ ${avg.toFixed(1)} (${count})`,
  shiftsDone: (count: number) => `${count} ${count === 1 ? 'shift' : 'shifts'} done`,
  away: (km: number) => `${Math.round(km * 10) / 10} km away`,
} as const;

export const WORKER_PROFILE_STRINGS = {
  TITLE: 'Worker profile',
  VERIFIED: 'Verified worker',
  NOT_VERIFIED: 'Not verified yet',
  memberSince: (date: string) => `Member since ${date}`,
  RATING: 'Rating',
  NO_RATING: 'New',
  reviewsCount: (count: number) => `${count} ${count === 1 ? 'review' : 'reviews'}`,
  SHIFTS_DONE: 'Shifts done',
  WORK_TYPES: 'Work they do',
  REVIEWS: 'Recent reviews',
  NO_REVIEWS: 'No reviews from businesses yet.',
  LOAD_FAILED: 'Couldn’t load this profile',
  RETRY: 'Retry',
} as const;
