export type TaxBase = 'subtotal' | 'base_amount' | 'commission';

/** Hourly: rate × reserved time. Task: one fixed price, no timer, finished with a code. */
export type PricingMode = 'hourly' | 'task';

/** The code a Business shares when the work is done; `code` is only sent to the Business. */
export type CompletionCode = {
  code?: string | null;
  attempts_left: number;
  locked: boolean;
  can_reissue: boolean;
};

export type LivePriceBreakdown = {
  currency: string;
  settings_version: number;
  pricing_mode: PricingMode;
  task_price_minor: number | null;
  hourly_rate_minor: number;
  reserved_minutes: number;
  base_amount_minor: number;
  commission_pct: number;
  commission_minor: number;
  tax_label: string;
  tax_pct: number;
  tax_base: TaxBase;
  tax_base_description: string;
  taxable_minor: number;
  tax_minor: number;
  /** Coupon reduces commission only; total = base + commission − discount + tax. */
  promo_code: string | null;
  promo_discount_minor: number;
  total_minor: number;
  worker_commission_minor: number;
  worker_net_minor: number;
  extension_surcharge_pct: number;
  extension_rate_minor: number;
  /** Prices above are per Worker; the booking total is total_minor × workers_required. */
  workers_required?: number;
  max_workers?: number;
  booking_total_minor?: number;
};

/** Approximate (~110 m) position of an available Worker; carries no identity. */
export type LiveWorkerDot = { latitude: number; longitude: number };

export type LiveAvailableWorkers = {
  count: number;
  radius_km: number;
  category_slug: string | null;
  fresh_within_seconds: number;
  checked_at: string;
  workers: LiveWorkerDot[];
};

export type LiveWorkDetails = {
  category_slug: string | null;
  category_name: string | null;
  job_title: string;
  description: string;
  address_text: string;
  latitude?: number | null;
  longitude?: number | null;
  arrival_instructions: string;
  site_contact_name: string;
  business_name: string;
  reserved_minutes: number;
  hourly_rate_minor: number;
  pricing_mode: PricingMode;
  task_price_minor: number | null;
};

export type LiveAssignment = {
  assignment_id: string;
  status: string;
  accepted_at: string;
  travel_started_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  ended_reason: string | null;
  worker: {
    worker_id: string;
    full_name: string | null;
    photo_url: string | null;
    rating_avg: number | null;
    rating_count: number;
    completed_shift_count: number;
    verification_status: string;
  };
  location: {
    latitude: number;
    longitude: number;
    accuracy_m: number | null;
    recorded_at: string;
    age_seconds: number;
    is_stale: boolean;
    distance_km: number;
  } | null;
  location_status: 'live' | 'stale' | 'unavailable' | 'not_shared';
};

export type LiveTimer = {
  started_at: string | null;
  ends_at: string | null;
  reserved_minutes: number;
  extended_minutes: number;
  remaining_seconds: number | null;
  completed_at: string | null;
};

export type LiveExtension = {
  id: string;
  assignment_id?: string;
  status:
    | 'requested'
    | 'awaiting_payment'
    | 'applied'
    | 'declined'
    | 'cancelled'
    | 'expired';
  extra_minutes: number;
  hourly_rate_minor: number;
  surcharge_pct: number;
  extension_rate_minor: number;
  base_amount_minor: number;
  commission_pct: number;
  commission_minor: number;
  tax_pct: number;
  tax_minor: number;
  total_minor: number;
  worker_net_minor: number;
  invoice_id: string | null;
  requested_at: string;
  responded_at: string | null;
  applied_at: string | null;
};

export type LiveExtensionQuote = {
  original_minutes: number;
  original_total_minor: number;
  current_minutes: number;
  additional_minutes: number;
  base_rate_minor: number;
  surcharge_pct: number;
  extension_rate_minor: number;
  additional_base_minor: number;
  commission_pct: number;
  commission_minor: number;
  tax_label: string;
  tax_pct: number;
  tax_minor: number;
  additional_total_minor: number;
  revised_minutes: number;
  revised_total_minor: number;
  currency: string;
};

export type LiveInvoice = {
  id: string;
  invoice_kind: string;
  status: string;
  total_minor: number;
  amount_due_minor: number;
  refund_due_minor: number;
  paid_at: string | null;
};

export type LiveRefund = {
  id: string;
  amount_minor: number;
  status: 'pending' | 'processed' | 'failed';
  reason: string;
  created_at: string;
  processed_at: string | null;
};

export type LiveCancellation = {
  cancelled_at: string | null;
  cancelled_by: 'business' | 'worker' | 'system' | null;
  reason: string | null;
  fee_minor: number;
  refund_minor: number;
};

export type LiveCancelPreview = {
  party: 'business' | 'worker';
  stage:
    | 'before_payment'
    | 'before_acceptance'
    | 'before_start'
    | 'during_work';
  fee_minor: number;
  worker_compensation_minor: number;
  business_refund_minor: number;
  business_retained_minor: number;
  strike_weight: number;
  business_voucher: boolean;
  rule: string;
  effect: string;
  currency: string;
};

export type LiveArrivalCode = {
  code: string;
  expires_at: string;
  attempts_left: number;
  locked: boolean;
  expired: boolean;
  verified: boolean;
};

/** One booked Worker of a several-Worker booking. */
export type LiveSeat = {
  assignment: LiveAssignment;
  arrival_code: LiveArrivalCode | null;
  completion_code: CompletionCode | null;
  timer: LiveTimer | null;
  actions: {
    can_cancel: boolean;
    can_extend: boolean;
    can_end_work: boolean;
    can_reissue_code: boolean;
    can_reissue_completion_code: boolean;
  };
  final_invoice?: LiveInvoice | null;
};

export type BusinessLiveStatus =
  | 'awaiting_payment'
  | 'searching'
  | 'no_workers'
  | 'assigned'
  | 'en_route'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type BusinessLiveBooking = {
  booking_id: string;
  status: BusinessLiveStatus;
  shift_status: string;
  server_time: string;
  version: string;
  created_at: string;
  work: LiveWorkDetails;
  pricing: LivePriceBreakdown;
  search: {
    started_at: string | null;
    expires_at: string | null;
    seconds_left: number;
    radius_km: number | null;
    notified_workers: number;
    available_workers: number;
  } | null;
  deposit_invoice: LiveInvoice | null;
  assignment: LiveAssignment | null;
  arrival_code: {
    code: string;
    expires_at: string;
    attempts_left: number;
    locked: boolean;
    expired: boolean;
    verified: boolean;
  } | null;
  timer: LiveTimer | null;
  extensions: LiveExtension[];
  final_invoice: LiveInvoice | null;
  refunds: LiveRefund[];
  cancellation: LiveCancellation | null;
  actions: {
    can_pay: boolean;
    can_cancel: boolean;
    can_extend: boolean;
    can_end_work: boolean;
    can_reissue_code: boolean;
    can_reissue_completion_code: boolean;
    can_repost: boolean;
  };
  completion_code: CompletionCode | null;
  workers_required?: number;
  workers_filled?: number;
  seat_total_minor?: number;
  unfilled_refund_minor?: number;
  workers?: LiveSeat[];
};

export type WorkerLiveBooking = {
  assignment_id: string;
  booking_id: string;
  status: 'assigned' | 'en_route' | 'in_progress' | 'completed' | 'cancelled';
  server_time: string;
  version: string;
  work: LiveWorkDetails;
  earnings: {
    reserved_minutes: number;
    base_amount_minor: number;
    commission_pct: number;
    worker_commission_minor: number;
    worker_net_minor: number;
    extension_net_minor: number;
    total_net_minor: number;
    /** Once the work ended: what was actually credited (null if nothing was). */
    final_net_minor?: number | null;
  };
  arrival: {
    verified: boolean;
    attempts_left: number;
    locked: boolean;
    expired: boolean;
  } | null;
  timer: LiveTimer | null;
  extensions: LiveExtension[];
  cancellation: LiveCancellation | null;
  completion: CompletionCode | null;
  workers_required?: number;
  actions: {
    can_start_travel: boolean;
    can_start_work: boolean;
    can_complete: boolean;
    can_cancel: boolean;
    can_answer_extension: boolean;
    can_accept_again?: boolean;
  };
};

export type WorkerLiveRequest = {
  booking_id: string;
  dispatch_id: string;
  job_title: string;
  category_name: string | null;
  business_name: string;
  address_text: string;
  distance_km: number | null;
  reserved_minutes: number;
  hourly_rate_minor: number;
  pricing_mode: PricingMode;
  task_price_minor: number | null;
  worker_net_minor: number;
  currency: string;
  expires_at: string;
  seconds_left: number;
};

export type LiveQuoteRequest = {
  category_slug?: string;
  pricing_mode: PricingMode;
  hourly_rate_minor?: number;
  duration_minutes?: number;
  task_price_minor?: number;
  promo_code?: string;
  workers_required?: number;
};

export type LiveWorkCreate = {
  category_slug: string;
  job_title: string;
  description: string;
  address_text: string;
  latitude: number;
  longitude: number;
  arrival_instructions: string;
  site_contact_name: string;
  pricing_mode: PricingMode;
  duration_minutes?: number;
  hourly_rate_minor?: number;
  task_price_minor?: number;
  accept_terms: boolean;
  workers_required?: number;
  expected_total_minor: number;
  idempotency_key: string;
  promo_code?: string;
};

export type LivePoint = {
  latitude: number;
  longitude: number;
  accuracy_m?: number;
};
