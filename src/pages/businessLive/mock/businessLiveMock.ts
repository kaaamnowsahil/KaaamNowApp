import type { BusinessLiveRequestDraft } from '@/types';

import { BUSINESS_LIVE_SEARCH_MOCK } from './liveSearchMock';

export type BusinessDashboardShift = {
  id: string;
  title: string;
  category?: string;
  date: string;
  time: string;
  hours: number;
  area: string;
  requirement: string;
  distanceKm: number;
  hourlyRate: number;
  estimatedTotal: number;
  confirmedCount?: number;
  totalSpots?: number;
  applicantCount?: number;
};

export const BUSINESS_LOCATIONS = [
  'Koramangala, Bengaluru',
  'Indiranagar, Bengaluru',
  'HSR Layout, Bengaluru',
  'Jayanagar, Bengaluru',
  'Whitefield, Bengaluru',
];

export const BUSINESS_DASHBOARD = {
  businessName: 'Third Wave Coffee',
  location: 'Koramangala, Bengaluru',
  isVerified: true,
  liveConfirmed: 2,
  liveTotal: 3,
  newApplicants: 8,
  liveShifts: [
    {
      id: 'business-live-cafe',
      title: 'Café service associate',
      date: 'Today, 18 Oct',
      time: '14:00–18:00',
      hours: 4,
      area: 'Koramangala',
      requirement: 'Customer service required',
      distanceKm: 1.4,
      hourlyRate: 150,
      estimatedTotal: 600,
      confirmedCount: 2,
      totalSpots: 3,
    },
  ] as BusinessDashboardShift[],
  scheduledShifts: [
    {
      id: 'business-scheduled-event',
      title: 'Event service associate',
      date: 'Thu, 22 Oct',
      time: '10:00–16:00',
      hours: 6,
      area: 'Indiranagar',
      requirement: 'Service experience required',
      distanceKm: 3.2,
      hourlyRate: 175,
      estimatedTotal: 1050,
      applicantCount: 4,
    },
  ] as BusinessDashboardShift[],
};

export const createLiveDraftFromDashboardShift = (
  shift: BusinessDashboardShift,
): BusinessLiveRequestDraft => ({
  role: shift.title,
  category: shift.category ?? 'General',
  responsibilities: shift.requirement,
  requirement: shift.requirement,
  location: shift.area,
  latitude: null,
  longitude: null,
  workplaceInstructions: '',
  workers: String(shift.totalSpots ?? 1),
  hourlyRate: String(shift.hourlyRate),
  hours: String(shift.hours),
  startTime: shift.time.split(/[–-]/, 1)[0].trim(),
  searchRadiusKm: BUSINESS_LIVE_SEARCH_MOCK.maxRadiusKm,
  customPayAgreed: false,
});

export const BUSINESS_ROSTER = {
  staffedCount: 4,
  totalCount: 4,
};

export const createDefaultBusinessLiveDraft = (
  location: string,
): BusinessLiveRequestDraft => ({
  role: 'Café service associate',
  category: 'Hospitality / Café',
  responsibilities:
    'Welcome guests, take orders, serve food and keep the service area clean.',
  requirement: 'Customer service experience required.',
  location,
  latitude: null,
  longitude: null,
  workplaceInstructions: 'Closed shoes; main entrance, ask for Meera.',
  workers: '3',
  hourlyRate: '150',
  hours: '4',
  startTime: '14:00',
  searchRadiusKm: BUSINESS_LIVE_SEARCH_MOCK.maxRadiusKm,
  customPayAgreed: false,
});