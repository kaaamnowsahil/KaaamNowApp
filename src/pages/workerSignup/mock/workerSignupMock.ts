import type { Option, PickedAddress } from '@/types';

export const WORK_TYPES: Option[] = [
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

export const CURRENT_ADDRESS: PickedAddress = {
  address: 'Koramangala, Bengaluru',
  lat: 12.9352,
  lng: 77.6245,
};
