export type ShiftStatus = 'live' | 'scheduled';

export type Shift = {
  id: string;
  status: ShiftStatus;
  categoryId: string;
  /** e.g. "cafe", "retail" — matches the Discover business-type filter. */
  businessTypeId: string;
  title: string;
  businessName: string;
  isVerified: boolean;
  /** e.g. "Today, 18 Oct" */
  dateLabel: string;
  /** e.g. "14:00–18:00" */
  timeLabel: string;
  durationHours: number;
  area: string;
  requirement: string;
  distanceKm: number;
  hourlyRate: number;
  spotsOpen: number;
  startsAt?: string;
  endsAt?: string;
  addressText?: string;
  latitude?: number | null;
  longitude?: number | null;
  applicationId?: string | null;
  applicationStatus?: string | null;
  assignmentId?: string | null;
  assignmentStatus?: string | null;
  /** Selected offers only, e.g. "20 Oct, 18:00". */
  confirmBy?: string;
};
