import type { ShiftStatus } from '@/types';

export const WORKER_HOME_STRINGS = {
  greeting: (hour: number, name: string) => {
    const part = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    return `Good ${part}, ${name}`;
  },
  SUBTITLE: 'Your next good shift is close by.',
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
  SEE_ALL: 'See all',
  EMPTY: 'No shifts match right now. Try another role or search.',
  EMPTY_STATE: {
    live: {
      title: 'No live requests nearby',
      body: 'We’ll notify you the moment a business within 5 km posts a live request. Keep alerts on.',
      action: 'Browse scheduled shifts',
    },
    scheduled: {
      title: 'No scheduled shifts found',
      body: 'Try a wider area and different filters. New shifts in this area will appear here.',
      action: 'Clear filters',
    },
  } as Record<ShiftStatus, { title: string; body: string; action: string }>,
} as const;
