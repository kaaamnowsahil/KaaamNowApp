export type BusinessShiftDraft = {
  id?: string;
  seriesId?: string;
  sameForEveryDate?: boolean;
  /** One entry per shift; a date can hold several shifts. */
  schedules: BusinessShiftSlot[];
  hourlyRate: string;
  workers: string;
  responsibilities: string;
  requirement: string;
  role: string;
  category: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type BusinessShiftSlot = {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  category: string;
  requirement: string;
  responsibilities: string;
  workers: string;
  hourlyRate: string;
  breakMinutes?: string;
};

export type BusinessDashboardShift = {
  id: string;
  title: string;
  category?: string;
  date: string;
  time: string;
  hours: number;
  area: string;
  requirement: string;
  responsibilities?: string;
  distanceKm?: number;
  hourlyRate: number;
  estimatedTotal: number;
  confirmedCount?: number;
  totalSpots?: number;
  applicantCount?: number;
};

export type BusinessApplicantStatus = 'applied' | 'selected' | 'confirmed';

export type BusinessApplicant = {
  id: string;
  name: string;
  experience: string;
  experienceMonths: number;
  category: string;
  rating: number;
  status: BusinessApplicantStatus;
  location: string;
  about: string;
  skills: string[];
  confirmedAt?: string;
  /** Booked seat; opens the booking detail. */
  assignmentId?: string;
  distanceKm?: number;
  arrivalMinutes?: number;
  /** Worker profile id for GET /me/workers/{id}. */
  workerId?: string;
  photoUrl?: string;
  isVerified?: boolean;
  ratingCount?: number;
  completedShifts?: number;
  shiftId?: string;
  workplace?: string;
  startsAt?: string;
  endsAt?: string;
};
