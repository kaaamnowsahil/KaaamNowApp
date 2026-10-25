export type BusinessShiftDraft = {
  id?: string;
  seriesId?: string;
  sameForEveryDate?: boolean;
  schedules: {
    date: string;
    startTime: string;
    endTime: string;
    role: string;
    category: string;
    requirement: string;
    responsibilities: string;
    workers: string;
    hourlyRate: string;
  }[];
  hourlyRate: string;
  workers: string;
  responsibilities: string;
  requirement: string;
  role: string;
  category: string;
  location: string;
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
  distanceKm?: number;
  arrivalMinutes?: number;
};
