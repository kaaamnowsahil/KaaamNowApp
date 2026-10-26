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

export const CURRENT_LOCATION_ID = 'current';
export const SAVED_LOCATION_ID = 'saved';
