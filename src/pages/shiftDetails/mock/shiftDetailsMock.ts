import type { ShiftStatus } from '@/types';

export type ShiftInfo = {
  rating: number;
  reviews: number;
  /** Shown after the duration, e.g. "starts in 30 minutes". */
  durationNote: string;
  placeLabel: string;
  whatYouDo: string;
  beforeAccept: string;
  cancellation: string;
  businessPhone: string;
};

const LIVE_DEFAULT: ShiftInfo = {
  rating: 4.8,
  reviews: 126,
  durationNote: 'starts in 30 minutes',
  placeLabel: 'Third Wave, Koramangala',
  whatYouDo:
    'Welcome guests, take orders, serve food and keep the service area clean. Follow the shift lead’s safety briefing.',
  beforeAccept:
    'Customer service experience, basic English or Kannada, closed shoes. Identity review must be complete to accept.',
  cancellation:
    'Cancel before check-in from My shifts. Cancellations within 1 hour of start are reviewed; emergencies can be reported. Final earnings depend on approved payable hours. Estimates are not guaranteed.',
  businessPhone: '+919845012345',
};

const SCHEDULED_DEFAULT: ShiftInfo = {
  rating: 4.7,
  reviews: 64,
  durationNote: 'includes 30 min paid break',
  placeLabel: 'The Fern, Indiranagar',
  whatYouDo:
    'Welcome guests, take orders, serve food and keep the service area clean. Follow the shift lead’s safety briefing.',
  beforeAccept:
    '6 months of service experience, black shirt and closed shoes. Bring your Aadhaar or any government ID; no other document is required.',
  cancellation:
    'Cancel at least 12 hours before start. Late cancellations are reviewed; contact support in an emergency. Final earnings depend on approved payable hours. Estimates are not guaranteed.',
  businessPhone: '+919845067890',
};

export const DEFAULT_SHIFT_INFO: Record<ShiftStatus, ShiftInfo> = {
  live: LIVE_DEFAULT,
  scheduled: SCHEDULED_DEFAULT,
};

/** Per-shift overrides, keyed by shift id. */
export const SHIFT_INFO: Record<string, Partial<ShiftInfo>> = {
  'shift-store-restock': {
    rating: 4.6,
    reviews: 88,
    durationNote: 'starts in 45 minutes',
    placeLabel: 'Nature’s Basket, HSR Layout',
    whatYouDo:
      'Unload deliveries, restock shelves by section and keep aisles clear for customers. Follow the floor lead’s instructions.',
    beforeAccept:
      'Able to lift 10 kg, closed shoes. Identity review must be complete to accept.',
  },
  'shift-kitchen-helper': {
    rating: 4.5,
    reviews: 41,
    durationNote: 'includes 30 min meal break',
    placeLabel: 'Truffles, Koramangala',
    whatYouDo:
      'Prep vegetables, keep stations stocked and wash up during the lunch rush. Follow the head cook’s hygiene rules.',
    beforeAccept:
      'Kitchen experience preferred, closed shoes and hair tied back. Bring any government ID.',
  },
  'shift-store-promoter': {
    rating: 4.4,
    reviews: 57,
    placeLabel: 'Lenskart, Jayanagar',
    whatYouDo:
      'Greet walk-ins, explain current offers and guide customers to the eye-test desk. Report footfall to the store lead.',
    beforeAccept:
      'Clear communication in English and Kannada, smart casual wear. Bring any government ID.',
  },
};
