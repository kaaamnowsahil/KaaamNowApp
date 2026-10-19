import type { Option, Shift } from '@/types';

export const WORKER = {
  firstName: 'Aarav',
  location: 'Koramangala, Bengaluru',
  hasUnreadNotifications: true,
};

/** Areas offered in the location dropdown; the first matches WORKER.location. */
export const LOCATIONS: Option[] = [
  { id: 'koramangala', label: 'Koramangala, Bengaluru' },
  { id: 'indiranagar', label: 'Indiranagar, Bengaluru' },
  { id: 'hsr', label: 'HSR Layout, Bengaluru' },
  { id: 'jayanagar', label: 'Jayanagar, Bengaluru' },
  { id: 'whitefield', label: 'Whitefield, Bengaluru' },
];

export const ALL_CATEGORIES_ID = 'all';

export const CATEGORIES: Option[] = [
  { id: ALL_CATEGORIES_ID, label: 'All roles' },
  { id: 'hospitality', label: 'Hospitality' },
  { id: 'retail', label: 'Retail' },
];

export const ANY_ID = 'any';

/** Filter sheet options. `max`/`min` are read by the filter logic. */
export const DISTANCE_OPTIONS = [
  { id: ANY_ID, label: 'Any', max: Infinity },
  { id: '1km', label: 'Within 1 km', max: 1 },
  { id: '3km', label: 'Within 3 km', max: 3 },
  { id: '5km', label: 'Within 5 km', max: 5 },
];

export const PAY_OPTIONS = [
  { id: ANY_ID, label: 'Any', min: 0 },
  { id: '130', label: '₹130+ / hr', min: 130 },
  { id: '150', label: '₹150+ / hr', min: 150 },
  { id: '175', label: '₹175+ / hr', min: 175 },
];

export const LENGTH_OPTIONS = [
  { id: ANY_ID, label: 'Any', min: 0, max: Infinity },
  { id: 'short', label: 'Up to 4 hours', min: 0, max: 4 },
  { id: 'half', label: '5–6 hours', min: 5, max: 6 },
  { id: 'long', label: '7+ hours', min: 7, max: Infinity },
];

/** Multi-select; "Any" clears the selection. */
export const BUSINESS_TYPE_OPTIONS: Option[] = [
  { id: ANY_ID, label: 'Any' },
  { id: 'cafe', label: 'Café' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'hotel', label: 'Hotel' },
  { id: 'retail', label: 'Retail store' },
  { id: 'events', label: 'Events' },
];

/** Shifts near the worker, shown under "Nearby" and filtered by the Live Now / Scheduled toggle. */
export const NEARBY_SHIFTS: Shift[] = [
  {
    id: 'shift-cafe-service',
    status: 'live',
    categoryId: 'hospitality',
    title: 'Café service associate',
    businessTypeId: 'cafe',
    businessName: 'Third Wave Coffee',
    isVerified: true,
    dateLabel: 'Today, 18 Oct',
    timeLabel: '14:00–18:00',
    durationHours: 4,
    area: 'Koramangala',
    requirement: 'Customer service required',
    distanceKm: 1.4,
    hourlyRate: 150,
    spotsOpen: 1,
  },
  {
    id: 'shift-store-restock',
    status: 'live',
    categoryId: 'retail',
    title: 'Store restock associate',
    businessTypeId: 'retail',
    businessName: 'Nature’s Basket',
    isVerified: true,
    dateLabel: 'Today, 18 Oct',
    timeLabel: '16:00–21:00',
    durationHours: 5,
    area: 'HSR Layout',
    requirement: 'Able to lift 10 kg',
    distanceKm: 2.1,
    hourlyRate: 140,
    spotsOpen: 3,
  },
  {
    id: 'shift-kitchen-helper',
    status: 'scheduled',
    categoryId: 'hospitality',
    title: 'Kitchen helper',
    businessTypeId: 'restaurant',
    businessName: 'Truffles',
    isVerified: true,
    dateLabel: 'Sat, 24 Oct',
    timeLabel: '11:00–17:00',
    durationHours: 6,
    area: 'Koramangala',
    requirement: 'Kitchen experience preferred',
    distanceKm: 0.9,
    hourlyRate: 160,
    spotsOpen: 2,
  },
  {
    id: 'shift-billing-desk',
    status: 'scheduled',
    categoryId: 'retail',
    title: 'Billing desk assistant',
    businessTypeId: 'retail',
    businessName: 'Decathlon',
    isVerified: false,
    dateLabel: 'Sun, 25 Oct',
    timeLabel: '10:00–14:00',
    durationHours: 4,
    area: 'BTM Layout',
    requirement: 'Basic billing knowledge',
    distanceKm: 2.8,
    hourlyRate: 130,
    spotsOpen: 1,
  },
];

export const RECOMMENDED_SHIFTS: Shift[] = [
  {
    id: 'shift-event-service',
    status: 'scheduled',
    categoryId: 'hospitality',
    title: 'Event service associate',
    businessTypeId: 'events',
    businessName: 'The Fern Events',
    isVerified: true,
    dateLabel: 'Thu, 22 Oct',
    timeLabel: '10:00–16:00',
    durationHours: 6,
    area: 'Indiranagar',
    requirement: 'Service experience required',
    distanceKm: 3.2,
    hourlyRate: 175,
    spotsOpen: 4,
  },
  {
    id: 'shift-store-promoter',
    status: 'scheduled',
    categoryId: 'retail',
    title: 'In-store promoter',
    businessTypeId: 'retail',
    businessName: 'Lenskart',
    isVerified: true,
    dateLabel: 'Fri, 23 Oct',
    timeLabel: '12:00–20:00',
    durationHours: 8,
    area: 'Jayanagar',
    requirement: 'Good communication',
    distanceKm: 4.5,
    hourlyRate: 145,
    spotsOpen: 2,
  },
];
