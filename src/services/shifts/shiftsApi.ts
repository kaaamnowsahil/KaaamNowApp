import { apiRequest } from '@/services/api/apiClient';

export type ApiShiftType = 'live' | 'scheduled';
export type ApiShiftStatus =
  | 'draft'
  | 'searching'
  | 'open'
  | 'filled'
  | 'in_progress'
  | 'completed'
  | 'expired'
  | 'cancelled';

export type BusinessCard = {
  id: string;
  business_name: string;
  logo_url?: string | null;
  rating_avg: number;
  rating_count: number;
  verification_status: string;
};

export type WorkerShiftCard = {
  id: string;
  shift_type: ApiShiftType;
  status: ApiShiftStatus;
  job_title: string;
  category_slug: string;
  category_name: string;
  business: BusinessCard;
  workplace_name: string;
  address_text: string;
  latitude: number | null;
  longitude: number | null;
  distance_km?: number | null;
  starts_at: string;
  ends_at: string;
  break_minutes: number;
  hourly_rate_minor: number;
  currency: string;
  estimated_pay_minor: number;
  spots_left: number;
  my_application_id?: string | null;
  my_application_status?: string | null;
  my_assignment_id?: string | null;
  my_assignment_status?: string | null;
};

export type WorkerShiftDetail = WorkerShiftCard & {
  responsibilities: string;
  requirements: string;
  arrival_instructions: string;
  site_contact_name: string;
  cancellation_cutoff_hours: number;
};

export type MyShiftsTab = 'upcoming' | 'active' | 'completed' | 'applications';

export type MyShiftItem = {
  tab: string;
  assignment_id?: string | null;
  assignment_status?: string | null;
  application_id?: string | null;
  application_status?: string | null;
  confirm_by?: string | null;
  applied_at?: string | null;
  earned_minor?: number | null;
  shift: WorkerShiftCard;
};

export type LiveRequestItem = {
  dispatch_id: string;
  expires_at: string;
  seconds_left: number;
  shift: WorkerShiftCard;
};

export type WorkerSummary = {
  id: string;
  user_id: string;
  full_name: string;
  photo_url?: string | null;
  rating_avg: number;
  rating_count: number;
  completed_shift_count: number;
  verification_status: string;
};

export type AttendanceSummary = {
  checked_in_at?: string | null;
  checked_out_at?: string | null;
  recorded_minutes?: number | null;
  approved_minutes?: number | null;
};

export type RatingView = {
  direction: string;
  stars: number;
  tags: string[];
  review: string;
  created_at: string;
};

export type AssignmentDetail = {
  id: string;
  status: string;
  hourly_rate_minor: number;
  confirmed_at: string;
  travel_started_at?: string | null;
  shift: WorkerShiftCard;
  worker: WorkerSummary;
  business: BusinessCard;
  attendance?: AttendanceSummary | null;
  ratings?: RatingView[];
  can_rate?: boolean;
  check_in_opens_at: string;
};

export type ApplicationResponse = {
  id: string;
  shift_id: string;
  status: string;
  confirm_by?: string | null;
  assignment_id?: string | null;
};

export type ShiftCostEstimate = {
  currency: string;
  paid_minutes_per_worker: number;
  pay_per_worker_minor: number;
  workers_required: number;
  worker_subtotal_minor: number;
  fee_percentage: number;
  platform_fee_minor: number;
  total_minor: number;
};

export type BusinessShiftGroup =
  | 'upcoming'
  | 'in_progress'
  | 'draft'
  | 'completed'
  | 'expired'
  | 'cancelled';

export type BusinessShiftItem = {
  id: string;
  business_profile_id: string;
  shift_type: ApiShiftType;
  status: ApiShiftStatus;
  job_title: string;
  category_name: string;
  workers_required: number;
  booked_count: number;
  checked_in_count: number;
  pending_applications: number;
  hourly_rate_minor: number;
  currency: string;
  starts_at: string;
  ends_at: string;
  estimate: ShiftCostEstimate;
  workplace_name: string;
  address_text: string;
  invoice_status?: string | null;
  group: BusinessShiftGroup;
};

export type ShiftPage = {
  items: BusinessShiftItem[];
  group_counts: { key: BusinessShiftGroup; title: string; count: number }[];
};

export type ShiftBulkItem = {
  category_slug: string;
  job_title: string;
  responsibilities?: string | null;
  requirements?: string | null;
  workers_required: number;
  hourly_rate_minor: number;
  starts_at: string;
  ends_at?: string | null;
  break_minutes?: number;
  workplace_name?: string | null;
  address_text?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  arrival_instructions?: string | null;
};

export type ApplicantStatus = 'applied' | 'selected' | 'confirmed' | 'rejected';

export type BusinessApplicantItem = {
  application_id: string;
  status: string;
  applied_at: string;
  confirm_by?: string | null;
  distance_km?: number | null;
  cover_note: string;
  worker: WorkerSummary;
  shift: {
    id: string;
    shift_type: string;
    status: string;
    job_title: string;
    workplace_name: string;
    starts_at: string;
    ends_at: string;
    workers_required: number;
    hourly_rate_minor: number;
    currency: string;
  };
};

export type RosterEntry = {
  assignment_id: string;
  status: string;
  confirmed_at: string;
  travel_started_at?: string | null;
  worker: WorkerSummary;
  attendance?: AttendanceSummary | null;
};

export type Roster = {
  shift_id: string;
  workers_required: number;
  booked_count: number;
  items: RosterEntry[];
};

type Page<T> = { items: T[]; limit: number; offset: number };

export const shiftsApi = {
  // worker
  feed: (query: {
    shift_type?: ApiShiftType;
    category?: string;
    q?: string;
    lat?: number;
    lng?: number;
    radius_km?: number;
    business_type_slugs?: string;
    sort?: 'distance' | 'starts_at' | 'pay';
    limit?: number;
  }) => apiRequest<Page<WorkerShiftCard>>('GET', '/worker/feed', { query }),
  myShifts: (tab: MyShiftsTab) =>
    apiRequest<Page<MyShiftItem> & { tab: MyShiftsTab }>('GET', '/worker/my-shifts', {
      query: { tab, limit: 50 },
    }),
  shiftDetail: (shiftId: string) =>
    apiRequest<WorkerShiftDetail>('GET', `/worker/shifts/${shiftId}`),
  apply: (shiftId: string, coords?: { latitude: number; longitude: number }) =>
    apiRequest<ApplicationResponse>('POST', `/worker/shifts/${shiftId}/applications`, {
      body: { cover_note: '', ...coords },
    }),
  withdrawApplication: (applicationId: string) =>
    apiRequest<ApplicationResponse>('POST', `/worker/applications/${applicationId}/withdraw`),
  confirmSelection: (applicationId: string) =>
    apiRequest<ApplicationResponse>('POST', `/worker/applications/${applicationId}/confirm`),
  declineSelection: (applicationId: string) =>
    apiRequest<ApplicationResponse>('POST', `/worker/applications/${applicationId}/decline`),
  liveRequests: () => apiRequest<LiveRequestItem[]>('GET', '/worker/live-requests'),
  acceptLive: (shiftId: string) =>
    apiRequest<AssignmentDetail>('POST', `/worker/live-shifts/${shiftId}/accept`),
  declineLive: (shiftId: string) =>
    apiRequest<void>('POST', `/worker/live-shifts/${shiftId}/decline`),
  assignment: (assignmentId: string) =>
    apiRequest<AssignmentDetail>('GET', `/assignments/${assignmentId}`),
  startTravel: (assignmentId: string) =>
    apiRequest<AssignmentDetail>('POST', `/worker/assignments/${assignmentId}/start-travel`),
  cancelAssignment: (assignmentId: string, reason: string) =>
    apiRequest<AssignmentDetail>('POST', `/worker/assignments/${assignmentId}/cancel`, {
      body: { reason },
    }),
  checkIn: (
    assignmentId: string,
    body: { latitude: number; longitude: number; check_in_code: string },
  ) =>
    apiRequest<AssignmentDetail>('POST', `/worker/assignments/${assignmentId}/check-in`, {
      body,
    }),
  checkOut: (
    assignmentId: string,
    body: { latitude?: number; longitude?: number; note?: string },
  ) =>
    apiRequest<AssignmentDetail>('POST', `/worker/assignments/${assignmentId}/check-out`, {
      body,
    }),
  rate: (assignmentId: string, body: { stars: number; tags?: string[]; review?: string }) =>
    apiRequest<RatingView>('POST', `/assignments/${assignmentId}/ratings`, { body }),
  ratingTags: async (direction: 'worker_to_business' | 'business_to_worker') =>
    (
      await apiRequest<{ direction: string; tags: string[] }[]>('GET', '/catalog/rating-tags', {
        query: { direction },
      })
    ).flatMap(group => group.tags),
  tracking: (assignmentId: string) =>
    apiRequest<{ distance_km?: number | null; eta_minutes?: number | null }>(
      'GET',
      `/assignments/${assignmentId}/tracking`,
    ),
  contact: (assignmentId: string) =>
    apiRequest<{ name: string; phone: string; role: string }>(
      'GET',
      `/assignments/${assignmentId}/contact`,
    ),
  setAvailability: (body: {
    is_available: boolean;
    latitude?: number | null;
    longitude?: number | null;
  }) => apiRequest<{ is_available: boolean }>('PUT', '/me/availability', { body }),

  // business
  businessShifts: (query: { shift_type?: ApiShiftType; group?: BusinessShiftGroup }) =>
    apiRequest<ShiftPage>('GET', '/business/shifts', { query: { ...query, limit: 100 } }),
  createBulk: (body: { publish: boolean; shifts: ShiftBulkItem[] }) =>
    apiRequest<{ items: { id: string }[] }>('POST', '/business/shifts/bulk', { body }),
  cancelShift: (shiftId: string, reason: string) =>
    apiRequest<unknown>('POST', `/business/shifts/${shiftId}/cancel`, { body: { reason } }),
  publishShift: (shiftId: string) =>
    apiRequest<unknown>('POST', `/business/shifts/${shiftId}/publish`),
  applications: (status: ApplicantStatus) =>
    apiRequest<Page<BusinessApplicantItem>>('GET', '/business/applications', {
      query: { status, limit: 100 },
    }),
  selectApplicant: (applicationId: string) =>
    apiRequest<unknown>('POST', `/business/applications/${applicationId}/select`),
  rejectApplicant: (applicationId: string) =>
    apiRequest<unknown>('POST', `/business/applications/${applicationId}/reject`),
  roster: (shiftId: string) => apiRequest<Roster>('GET', `/business/shifts/${shiftId}/roster`),
};
