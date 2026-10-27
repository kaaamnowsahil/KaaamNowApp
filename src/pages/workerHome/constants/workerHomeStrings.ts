import { tr } from '@/services/i18n/tr';
import type { ShiftStatus } from '@/types';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`workerHome.${key}`, values);
const filter = (key: string) => tr(`shiftFilters.${key}`);

export const WORKER_HOME_STRINGS = {
  greeting: (hour: number, name: string) => {
    const part = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
    return k(`greeting${part}`, { name });
  },
  get GREETING_FALLBACK() {
    return k('greetingFallback');
  },
  get LOAD_ERROR_TITLE() {
    return k('loadErrorTitle');
  },
  get RETRY() {
    return k('retry');
  },
  get SEARCH_PLACEHOLDER() {
    return k('searchRolePlaceholder');
  },
  get FILTERS() {
    return k('filters');
  },
  filtersLabel: (n: number) => (n ? k('filtersActive', { n }) : k('filters')),
  get FILTER_TITLE() {
    return filter('title');
  },
  get FILTER_SUBTITLE() {
    return filter('subtitle');
  },
  get FILTER_DISTANCE() {
    return filter('distance');
  },
  get FILTER_PAY() {
    return filter('minimumPay');
  },
  get FILTER_LENGTH() {
    return filter('length');
  },
  get FILTER_BUSINESS_TYPE() {
    return filter('businessType');
  },
  get FILTER_BUSINESS_TYPE_HINT() {
    return filter('businessTypeHint');
  },
  get FILTER_VERIFIED() {
    return filter('verified');
  },
  get FILTER_VERIFIED_HINT() {
    return filter('verifiedHint');
  },
  get FILTER_RESET() {
    return filter('reset');
  },
  get FILTER_APPLY() {
    return filter('apply');
  },
  get CLOSE() {
    return filter('close');
  },
  get CHANGE_LOCATION() {
    return k('changeLocation');
  },
  get LOCATION_HINT() {
    return k('locationHint');
  },
  SEGMENTS: [
    {
      id: 'live',
      get label() {
        return k('segments.live');
      },
    },
    {
      id: 'scheduled',
      get label() {
        return k('segments.scheduled');
      },
    },
  ] as { id: ShiftStatus; label: string }[],
  NEARBY_TITLE: {
    get live() {
      return k('nearbyTitle.live');
    },
    get scheduled() {
      return k('nearbyTitle.scheduled');
    },
  } as Record<ShiftStatus, string>,
  get RECOMMENDED_TITLE() {
    return k('recommendedTitle');
  },
  get EMPTY() {
    return k('empty');
  },
  EMPTY_STATE: {
    live: {
      get title() {
        return k('emptyState.live.title');
      },
      get body() {
        return k('emptyState.live.body');
      },
      get action() {
        return k('emptyState.live.action');
      },
    },
    scheduled: {
      get title() {
        return k('emptyState.scheduled.title');
      },
      get body() {
        return k('emptyState.scheduled.body');
      },
    },
  } as Record<ShiftStatus, { title: string; body: string; action?: string }>,
  AVAILABILITY: {
    get TITLE() {
      return k('availability.title');
    },
    get ON() {
      return k('availability.on');
    },
    get OFF() {
      return k('availability.off');
    },
    get GO_ONLINE() {
      return k('availability.goOnline');
    },
    get GO_OFFLINE() {
      return k('availability.goOffline');
    },
    get LOCATION_DENIED() {
      return k('availability.locationDenied');
    },
    get VERIFICATION_PENDING() {
      return k('availability.verificationPending');
    },
    get VERIFICATION_REJECTED() {
      return k('availability.verificationRejected');
    },
    get PROMPT_TITLE() {
      return k('availability.promptTitle');
    },
    get PROMPT_BODY() {
      return k('availability.promptBody');
    },
    get PROMPT_CANCEL() {
      return k('availability.promptCancel');
    },
    get PROMPT_SHARE() {
      return k('availability.promptShare');
    },
    get PROMPT_LOADING() {
      return k('availability.promptLoading');
    },
  },
};
