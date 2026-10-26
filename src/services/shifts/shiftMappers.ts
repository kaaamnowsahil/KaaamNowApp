import i18n from '@/services/i18n/i18n';
import type { BusinessApplicant, BusinessDashboardShift, Shift } from '@/types';

import type {
  BusinessApplicantItem,
  BusinessShiftItem,
  RosterEntry,
  WorkerShiftCard,
} from './shiftsApi';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const pad = (value: number) => String(value).padStart(2, '0');

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isToday = (iso: string) => isSameDay(new Date(iso), new Date());

/** "Today, 18 Oct" or "Sat, 24 Oct" */
export const formatDateLabel = (iso: string) => {
  const date = new Date(iso);
  const day = isSameDay(date, new Date()) ? 'Today' : DAYS[date.getDay()];
  return `${day}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
};

/** "14:00" */
export const formatTime = (iso: string) => {
  const date = new Date(iso);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** "14:00–18:00" */
export const formatTimeRange = (startsAt: string, endsAt: string) =>
  `${formatTime(startsAt)}–${formatTime(endsAt)}`;

/** "20 Oct, 18:00" */
export const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${formatTime(iso)}`;
};

export const hoursBetween = (
  startsAt: string,
  endsAt: string,
  breakMinutes = 0,
) => {
  const minutes =
    (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000 -
    breakMinutes;
  return Math.max(0, Math.round((minutes / 60) * 10) / 10);
};

export const fromMinor = (minor: number) => Math.round(minor) / 100;

export const toShift = (card: WorkerShiftCard): Shift => ({
  id: card.id,
  status: card.shift_type,
  categoryId: card.category_slug,
  businessTypeId: '',
  title: card.job_title,
  businessName: card.business.business_name,
  isVerified: card.business.verification_status === 'verified',
  dateLabel: formatDateLabel(card.starts_at),
  timeLabel: formatTimeRange(card.starts_at, card.ends_at),
  durationHours: hoursBetween(card.starts_at, card.ends_at, card.break_minutes),
  area: card.workplace_name || card.address_text,
  requirement: card.category_name,
  distanceKm: Math.round((card.distance_km ?? 0) * 10) / 10,
  hourlyRate: fromMinor(card.hourly_rate_minor),
  spotsOpen: card.spots_left,
  startsAt: card.starts_at,
  endsAt: card.ends_at,
  addressText: card.address_text,
  latitude: card.latitude,
  longitude: card.longitude,
  applicationId: card.my_application_id ?? null,
  applicationStatus: card.my_application_status ?? null,
  assignmentId: card.my_assignment_id ?? null,
  assignmentStatus: card.my_assignment_status ?? null,
});

export const toDashboardShift = (
  item: BusinessShiftItem,
): BusinessDashboardShift => ({
  id: item.id,
  title: item.job_title,
  category: item.category_name,
  date: formatDateLabel(item.starts_at),
  time: formatTimeRange(item.starts_at, item.ends_at),
  hours: Math.round((item.estimate.paid_minutes_per_worker / 60) * 10) / 10,
  area: item.workplace_name || item.address_text,
  requirement: item.category_name,
  hourlyRate: fromMinor(item.hourly_rate_minor),
  estimatedTotal: fromMinor(item.estimate.pay_per_worker_minor),
  confirmedCount: item.booked_count,
  totalSpots: item.workers_required,
  applicantCount: item.pending_applications,
});

const APPLICANT_STATUSES: BusinessApplicant['status'][] = [
  'applied',
  'selected',
  'confirmed',
];

export const toApplicant = (
  item: BusinessApplicantItem,
): BusinessApplicant => ({
  id: item.application_id,
  name: item.worker.full_name,
  experience: i18n.t('businessApplicants.completedShifts', {
    count: item.worker.completed_shift_count,
  }),
  experienceMonths: item.worker.completed_shift_count,
  category: item.shift.job_title,
  rating: item.worker.rating_avg,
  status:
    APPLICANT_STATUSES.find(status => status === item.status) ?? 'applied',
  location:
    item.distance_km != null
      ? i18n.t('businessApplicants.distanceAway', {
          distance: Math.round(item.distance_km * 10) / 10,
        })
      : item.shift.workplace_name,
  about: item.cover_note,
  skills: [],
  assignmentId: item.assignment_id ?? undefined,
  distanceKm: item.distance_km ?? undefined,
  workerId: item.worker.id,
  photoUrl: item.worker.photo_url ?? undefined,
  isVerified: item.worker.verification_status === 'verified',
  ratingCount: item.worker.rating_count,
  completedShifts: item.worker.completed_shift_count,
  shiftId: item.shift.id,
  workplace: item.shift.workplace_name,
  startsAt: item.shift.starts_at,
  endsAt: item.shift.ends_at,
  hourlyRateMinor: item.shift.hourly_rate_minor,
  applicationStatus: item.status,
  respondedAt: item.responded_at ?? undefined,
});

/** Roster rows are keyed by assignment id so tracking and rating can call assignment endpoints. */
export const toRosterMember = (
  entry: RosterEntry,
  jobTitle: string,
): BusinessApplicant => ({
  id: entry.assignment_id,
  name: entry.worker.full_name,
  experience: i18n.t('businessApplicants.completedShifts', {
    count: entry.worker.completed_shift_count,
  }),
  experienceMonths: entry.worker.completed_shift_count,
  category: jobTitle,
  rating: entry.worker.rating_avg,
  status: 'confirmed',
  location: '',
  about: '',
  skills: [],
  assignmentId: entry.assignment_id,
  confirmedAt: formatDateTime(entry.confirmed_at),
});
