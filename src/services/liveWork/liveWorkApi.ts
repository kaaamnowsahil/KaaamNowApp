import { apiRequest } from '@/services/api/apiClient';

import type {
  BusinessLiveBooking,
  LiveAvailableWorkers,
  LiveCancelPreview,
  LiveExtensionQuote,
  LivePoint,
  LivePriceBreakdown,
  LiveQuoteRequest,
  LiveWorkCreate,
  WorkerLiveBooking,
  WorkerLiveRequest,
} from './liveWorkTypes';

const BUSINESS = '/business/live-work';
const WORKER = '/worker/live-work';

/** Business action on one Worker; without it the server picks the first Worker. */
const seatQuery = (assignmentId?: string) =>
  assignmentId ? { assignment_id: assignmentId } : undefined;

export const liveWorkApi = {
  quote: (body: LiveQuoteRequest) =>
    apiRequest<LivePriceBreakdown>('POST', `${BUSINESS}/quote`, { body }),
  availableWorkers: (query: { lat: number; lng: number; category?: string }) =>
    apiRequest<LiveAvailableWorkers>('GET', `${BUSINESS}/available-workers`, {
      query,
    }),
  create: (body: LiveWorkCreate) =>
    apiRequest<BusinessLiveBooking>('POST', BUSINESS, { body }),
  list: (active = false) =>
    apiRequest<{ items: BusinessLiveBooking[] }>('GET', BUSINESS, {
      query: { active, limit: 20 },
    }),
  get: (bookingId: string) =>
    apiRequest<BusinessLiveBooking>('GET', `${BUSINESS}/${bookingId}`),
  cancelPreview: (bookingId: string) =>
    apiRequest<LiveCancelPreview>(
      'GET',
      `${BUSINESS}/${bookingId}/cancel-preview`,
    ),
  cancel: (bookingId: string, reason: string, expectedRefundMinor: number) =>
    apiRequest<BusinessLiveBooking>('POST', `${BUSINESS}/${bookingId}/cancel`, {
      body: { reason, expected_refund_minor: expectedRefundMinor },
    }),
  cancelWorkerPreview: (bookingId: string, assignmentId: string) =>
    apiRequest<LiveCancelPreview>(
      'GET',
      `${BUSINESS}/${bookingId}/workers/${assignmentId}/cancel-preview`,
    ),
  cancelWorker: (
    bookingId: string,
    assignmentId: string,
    reason: string,
    expectedRefundMinor: number,
  ) =>
    apiRequest<BusinessLiveBooking>(
      'POST',
      `${BUSINESS}/${bookingId}/workers/${assignmentId}/cancel`,
      { body: { reason, expected_refund_minor: expectedRefundMinor } },
    ),
  extensionQuote: (bookingId: string, minutes: number, assignmentId?: string) =>
    apiRequest<LiveExtensionQuote>(
      'GET',
      `${BUSINESS}/${bookingId}/extension-quote`,
      {
        query: {
          minutes,
          ...(assignmentId ? { assignment_id: assignmentId } : {}),
        },
      },
    ),
  requestExtension: (
    bookingId: string,
    minutes: number,
    expectedTotalMinor: number,
    assignmentId?: string,
  ) =>
    apiRequest<BusinessLiveBooking>(
      'POST',
      `${BUSINESS}/${bookingId}/extensions`,
      {
        body: {
          extra_minutes: minutes,
          expected_total_minor: expectedTotalMinor,
          ...(assignmentId ? { assignment_id: assignmentId } : {}),
        },
      },
    ),
  cancelExtension: (bookingId: string, extensionId: string) =>
    apiRequest<BusinessLiveBooking>(
      'POST',
      `${BUSINESS}/${bookingId}/extensions/${extensionId}/cancel`,
    ),
  endWork: (bookingId: string, assignmentId?: string) =>
    apiRequest<BusinessLiveBooking>('POST', `${BUSINESS}/${bookingId}/end`, {
      query: seatQuery(assignmentId),
    }),
  reissueCode: (bookingId: string, assignmentId?: string) =>
    apiRequest<BusinessLiveBooking>(
      'POST',
      `${BUSINESS}/${bookingId}/arrival-code/reissue`,
      { query: seatQuery(assignmentId) },
    ),
  reissueCompletionCode: (bookingId: string, assignmentId?: string) =>
    apiRequest<BusinessLiveBooking>(
      'POST',
      `${BUSINESS}/${bookingId}/completion-code/reissue`,
      { query: seatQuery(assignmentId) },
    ),

  reportWorkerLocation: (point: LivePoint) =>
    apiRequest<{ is_available: boolean }>('PUT', '/me/location', {
      body: point,
    }),
  requests: () => apiRequest<WorkerLiveRequest[]>('GET', `${WORKER}/requests`),
  accept: (bookingId: string) =>
    apiRequest<WorkerLiveBooking>(
      'POST',
      `${WORKER}/requests/${bookingId}/accept`,
    ),
  decline: (bookingId: string) =>
    apiRequest<void>('POST', `${WORKER}/requests/${bookingId}/decline`),
  active: () =>
    apiRequest<{ booking: WorkerLiveBooking | null }>(
      'GET',
      `${WORKER}/active`,
    ),
  workerBooking: (assignmentId: string) =>
    apiRequest<WorkerLiveBooking>('GET', `${WORKER}/bookings/${assignmentId}`),
  startTravel: (assignmentId: string) =>
    apiRequest<WorkerLiveBooking>(
      'POST',
      `${WORKER}/bookings/${assignmentId}/start-travel`,
    ),
  shareLocation: (assignmentId: string, point: LivePoint) =>
    apiRequest<WorkerLiveBooking>(
      'POST',
      `${WORKER}/bookings/${assignmentId}/location`,
      {
        body: point,
      },
    ),
  startWork: (assignmentId: string, arrivalCode: string, point: LivePoint) =>
    apiRequest<WorkerLiveBooking>(
      'POST',
      `${WORKER}/bookings/${assignmentId}/start`,
      {
        body: { arrival_code: arrivalCode, ...point },
      },
    ),
  complete: (assignmentId: string, completionCode: string) =>
    apiRequest<WorkerLiveBooking>(
      'POST',
      `${WORKER}/bookings/${assignmentId}/complete`,
      { body: { completion_code: completionCode } },
    ),
  workerCancelPreview: (assignmentId: string) =>
    apiRequest<LiveCancelPreview>(
      'GET',
      `${WORKER}/bookings/${assignmentId}/cancel-preview`,
    ),
  workerCancel: (assignmentId: string, reason: string) =>
    apiRequest<WorkerLiveBooking>(
      'POST',
      `${WORKER}/bookings/${assignmentId}/cancel`,
      {
        body: { reason },
      },
    ),
  answerExtension: (
    assignmentId: string,
    extensionId: string,
    accept: boolean,
  ) =>
    apiRequest<WorkerLiveBooking>(
      'POST',
      `${WORKER}/bookings/${assignmentId}/extensions/${extensionId}`,
      { body: { accept } },
    ),
};
