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
  extensionQuote: (bookingId: string, minutes: number) =>
    apiRequest<LiveExtensionQuote>(
      'GET',
      `${BUSINESS}/${bookingId}/extension-quote`,
      {
        query: { minutes },
      },
    ),
  requestExtension: (
    bookingId: string,
    minutes: number,
    expectedTotalMinor: number,
  ) =>
    apiRequest<BusinessLiveBooking>(
      'POST',
      `${BUSINESS}/${bookingId}/extensions`,
      {
        body: {
          extra_minutes: minutes,
          expected_total_minor: expectedTotalMinor,
        },
      },
    ),
  cancelExtension: (bookingId: string, extensionId: string) =>
    apiRequest<BusinessLiveBooking>(
      'POST',
      `${BUSINESS}/${bookingId}/extensions/${extensionId}/cancel`,
    ),
  endWork: (bookingId: string) =>
    apiRequest<BusinessLiveBooking>('POST', `${BUSINESS}/${bookingId}/end`),
  reissueCode: (bookingId: string) =>
    apiRequest<BusinessLiveBooking>(
      'POST',
      `${BUSINESS}/${bookingId}/arrival-code/reissue`,
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
  complete: (assignmentId: string) =>
    apiRequest<WorkerLiveBooking>(
      'POST',
      `${WORKER}/bookings/${assignmentId}/complete`,
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
