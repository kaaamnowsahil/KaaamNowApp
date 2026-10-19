export type LiveDetails = {
  rating: number;
  reviews: number;
  startsIn: string;
  placeLabel: string;
  whatYouDo: string;
  beforeAccept: string;
  firstComeNote: string;
  cancellation: string;
  businessPhone: string;
};

const DEFAULT: LiveDetails = {
  rating: 4.8,
  reviews: 126,
  startsIn: 'starts in 30 minutes',
  placeLabel: 'Third Wave, Koramangala',
  whatYouDo:
    'Welcome guests, take orders, serve food and keep the service area clean. Follow the shift lead’s safety briefing.',
  beforeAccept:
    'Customer service experience, basic English or Kannada, closed shoes. Identity review must be complete to accept.',
  firstComeNote:
    'First-come-first-served for eligible workers. Your place is confirmed only when availability is secured.',
  cancellation:
    'Cancel before check-in from My shifts. Cancellations within 1 hour of start are reviewed; emergencies can be reported. Final earnings depend on approved payable hours. Estimates are not guaranteed.',
  businessPhone: '+919845012345',
};

export const LIVE_DETAILS: Record<string, LiveDetails> = {
  'shift-cafe-service': DEFAULT,
  'shift-store-restock': {
    ...DEFAULT,
    rating: 4.6,
    reviews: 88,
    startsIn: 'starts in 45 minutes',
    placeLabel: 'Nature’s Basket, HSR Layout',
    whatYouDo:
      'Unload deliveries, restock shelves by section and keep aisles clear for customers. Follow the floor lead’s instructions.',
    beforeAccept:
      'Able to lift 10 kg, closed shoes. Identity review must be complete to accept.',
  },
};

export const DEFAULT_LIVE_DETAILS = DEFAULT;
