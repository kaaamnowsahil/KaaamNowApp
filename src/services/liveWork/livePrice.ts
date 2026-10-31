import { rupeesToMinor, type LiveWorkForm } from './liveWorkFormat';
import type {
  LivePriceBreakdown,
  LiveQuoteRequest,
  LiveWorkCreate,
} from './liveWorkTypes';

/** The quote the server prices; the coupon is only sent when one is applied. */
export function quoteRequest(
  form: LiveWorkForm,
  promoCode: string | null,
): LiveQuoteRequest {
  const workers = form.workers ?? 1;
  const price =
    form.pricingMode === 'task'
      ? {
          pricing_mode: 'task' as const,
          task_price_minor: rupeesToMinor(form.taskPrice) as number,
        }
      : {
          pricing_mode: 'hourly' as const,
          hourly_rate_minor: rupeesToMinor(form.rate) as number,
          duration_minutes: form.durationMinutes,
        };
  return {
    category_slug: form.categorySlug,
    ...price,
    ...(promoCode ? { promo_code: promoCode } : {}),
    ...(workers > 1 ? { workers_required: workers } : {}),
  };
}

/** Booking total for the quote (per-Worker total × Workers). */
export const bookingTotal = (quote: LivePriceBreakdown) =>
  quote.booking_total_minor ??
  quote.total_minor * (quote.workers_required ?? 1);

/** The booking exactly as reviewed: the server rejects it if the total it computes differs. */
export function createRequest(
  form: LiveWorkForm,
  quote: LivePriceBreakdown,
  idempotencyKey: string,
): LiveWorkCreate {
  const price =
    quote.pricing_mode === 'task'
      ? {
          pricing_mode: 'task' as const,
          task_price_minor: quote.task_price_minor as number,
        }
      : {
          pricing_mode: 'hourly' as const,
          duration_minutes: form.durationMinutes,
          hourly_rate_minor: quote.hourly_rate_minor,
        };
  return {
    category_slug: form.categorySlug,
    job_title: form.jobTitle.trim(),
    description: form.description.trim(),
    address_text: form.address.trim(),
    latitude: form.latitude as number,
    longitude: form.longitude as number,
    arrival_instructions: form.instructions.trim(),
    site_contact_name: form.siteContact.trim(),
    ...price,
    accept_terms: true,
    ...((quote.workers_required ?? 1) > 1
      ? { workers_required: quote.workers_required }
      : {}),
    expected_total_minor: bookingTotal(quote),
    idempotency_key: idempotencyKey,
    ...(quote.promo_code ? { promo_code: quote.promo_code } : {}),
  };
}
