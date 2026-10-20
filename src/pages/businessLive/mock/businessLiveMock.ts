export type BusinessDashboardShift = {
  id: string;
  title: string;
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

export const BUSINESS_ROSTER = {
  staffedCount: 4,
  totalCount: 4,
};