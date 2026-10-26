import type { ShiftStatus } from '@/types';

export const WORKER_HOME_STRINGS = {
  greeting: (hour: number, name: string) => {
    const part = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    return `Good ${part}, ${name}`;
  },
  GREETING_FALLBACK: 'Find your next shift',
  LOAD_ERROR_TITLE: 'Couldn’t load shifts',
  RETRY: 'Try again',
  SEARCH_PLACEHOLDER: 'Role, business or location',
  FILTERS: 'Filters',
  filtersLabel: (n: number) => (n ? `Filters, ${n} active` : 'Filters'),
  FILTER_TITLE: 'Filter shifts',
  FILTER_SUBTITLE: 'Show only the shifts that work for you.',
  FILTER_DISTANCE: 'Distance',
  FILTER_PAY: 'Minimum pay',
  FILTER_LENGTH: 'Shift length',
  FILTER_BUSINESS_TYPE: 'Business type',
  FILTER_BUSINESS_TYPE_HINT: 'Pick one or more.',
  FILTER_VERIFIED: 'Verified businesses only',
  FILTER_VERIFIED_HINT: 'Businesses checked by KaaamNow',
  FILTER_RESET: 'Reset',
  FILTER_APPLY: 'Show shifts',
  CLOSE: 'Close filters',
  CHANGE_LOCATION: 'Change location',
  LOCATION_HINT: 'Show shifts near',
  SEGMENTS: [
    { id: 'live', label: 'Live Now' },
    { id: 'scheduled', label: 'Scheduled' },
  ] as { id: ShiftStatus; label: string }[],
  NEARBY_TITLE: {
    live: 'Nearby, starting soon',
    scheduled: 'Nearby, coming up',
  } as Record<ShiftStatus, string>,
  RECOMMENDED_TITLE: 'Recommended for you',
  EMPTY: 'No shifts match right now. Try another role or search.',
  EMPTY_STATE: {
    live: {
      title: 'No live shifts nearby',
      body: 'There are no live shifts in your area right now.',
      action: 'Browse scheduled shifts',
    },
    scheduled: {
      title: 'No scheduled shifts found',
      body: 'There are no scheduled shifts in your area right now.',
    },
  } as Record<ShiftStatus, { title: string; body: string; action?: string }>,
  AVAILABILITY: {
    TITLE: 'Availability',
    ON: 'LIVE',
    OFF: 'You’re offline',
    GO_ONLINE: 'Go live',
    GO_OFFLINE: 'Go offline',
    LOCATION_DENIED:
      'We couldn’t get your location. Allow location access in your phone settings and check that location services are on, then try again.',
    VERIFICATION_PENDING:
      'Your worker profile is awaiting verification. You can go online once it’s approved.',
    VERIFICATION_REJECTED:
      'Your worker profile was not approved. Please update your details or contact support.',
    PROMPT_TITLE: 'Share your location to go online',
    PROMPT_BODY:
      'We use your current location to show nearby shifts and help businesses find available workers. Your location is shared only after you allow it.',
    PROMPT_CANCEL: 'Cancel',
    PROMPT_SHARE: 'Share location',
    PROMPT_LOADING: 'Loading…',
  },
} as const;
