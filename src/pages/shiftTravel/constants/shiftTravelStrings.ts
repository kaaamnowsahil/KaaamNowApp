import { tr } from '@/services/i18n/tr';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`shiftTravel.${key}`, values);

export const SHIFT_TRAVEL_STRINGS = {
  get OVERLINE() {
    return k('overline');
  },
  heading: (workplace: string) => k('heading', { workplace }),
  subtitle: (time: string) => k('subtitle', { time }),
  eta: (min: number) => k('eta', { min }),
  get ETA() {
    return k('etaLabel');
  },
  distance: (km: number) => k('distance', { km }),
  get DISTANCE() {
    return k('distanceLabel');
  },
  get DIRECTIONS() {
    return k('directions');
  },
  get ARRIVAL_INSTRUCTIONS() {
    return k('arrivalInstructions');
  },
  locationNote: (business: string) => k('locationNote', { business }),
  get START_NAVIGATION() {
    return k('startNavigation');
  },
  travelOpensAt: (time: string) => k('travelOpensAt', { time }),
  get ARRIVED() {
    return k('arrived');
  },
  checkInOpensAt: (time: string) => k('checkInOpensAt', { time }),
  get MESSAGE() {
    return k('message');
  },
  get EMERGENCY() {
    return k('emergency');
  },
  NO_ETA: '—',
  get START_FAILED() {
    return k('startFailed');
  },
};
