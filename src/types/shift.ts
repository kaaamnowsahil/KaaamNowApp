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
};
