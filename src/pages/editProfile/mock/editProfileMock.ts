import type { Option, PickedAddress } from '@/types';

export const PROFILE_FORM = {
  fullName: 'Aarav Sharma',
  phone: '8557062835',
  email: 'aarav.sharma@gmail.com',
  age: '24',
  address: 'Koramangala, Bengaluru',
  workTypes: ['waiter', 'hotel-staff', 'kitchen-helper', 'retail'],
};

export const WORK_TYPES: Option[] = [
  { id: 'house-help', label: 'House help' },
  { id: 'cook', label: 'Cook' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'waiter', label: 'Waiter' },
  { id: 'hotel-staff', label: 'Hotel staff' },
  { id: 'kitchen-helper', label: 'Kitchen helper' },
  { id: 'retail', label: 'Retail' },
  { id: 'events', label: 'Events' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'security', label: 'Security guard' },
];

export const CURRENT_ADDRESS: PickedAddress = {
  address: '4th Block, Koramangala, Bengaluru',
  lat: 12.9339,
  lng: 77.6295,
};
