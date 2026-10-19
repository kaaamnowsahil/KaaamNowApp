export type Option = { id: string; label: string };

/** Shown until the backend list loads, or if it is unreachable. */
export const FALLBACK_WORK_TYPES: Option[] = [
  { id: 'house-help', label: 'House help' },
  { id: 'cook', label: 'Cook' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'waiter', label: 'Waiter' },
  { id: 'hotel-staff', label: 'Hotel staff' },
  { id: 'kitchen-helper', label: 'Kitchen helper' },
  { id: 'hospitality', label: 'Hospitality' },
  { id: 'retail', label: 'Retail' },
  { id: 'events', label: 'Events' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'security', label: 'Security guard' },
  { id: 'driver', label: 'Driver' },
  { id: 'warehouse', label: 'Warehouse' },
];

export const FALLBACK_BUSINESS_TYPES: Option[] = [
  { id: 'hospitality', label: 'Hospitality' },
  { id: 'retail', label: 'Retail' },
  { id: 'events', label: 'Events' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'household', label: 'Household' },
  { id: 'office', label: 'Office' },
  { id: 'other', label: 'Other' },
];
