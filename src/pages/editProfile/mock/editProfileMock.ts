import type { Option, PickedAddress } from '@/types';

export const PROFILE_FORM = {
  fullName: 'Aarav Sharma',
  phone: '9876543210',
  address: 'Koramangala, Bengaluru',
  workTypes: ['hospitality'],
};

export const WORK_TYPES: Option[] = [
  { id: 'hospitality', label: 'Hospitality' },
  { id: 'retail', label: 'Retail' },
  { id: 'events', label: 'Events' },
  { id: 'delivery', label: 'Delivery' },
];

export const CURRENT_ADDRESS: PickedAddress = {
  address: '4th Block, Koramangala, Bengaluru',
  lat: 12.9339,
  lng: 77.6295,
};
