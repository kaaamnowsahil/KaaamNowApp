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
  return {
    category_slug: form.categorySlug,
    hourly_rate_minor: rupeesToMinor(form.rate) as number,
    duration_minutes: form.durationMinutes,
    ...(promoCode ? { promo_code: promoCode } : {}),
  };
}

/** The booking exactly as reviewed: the server rejects it if the total it computes differs. */
export function createRequest(
  form: LiveWorkForm,
  quote: LivePriceBreakdown,
  idempotencyKey: string,
): LiveWorkCreate {
  return {
    category_slug: form.categorySlug,
    job_title: form.jobTitle.trim(),
    description: form.description.trim(),
    address_text: form.address.trim(),
    latitude: form.latitude as number,
    longitude: form.longitude as number,
    arrival_instructions: form.instructions.trim(),
    site_contact_name: form.siteContact.trim(),
    duration_minutes: form.durationMinutes,
    hourly_rate_minor: quote.hourly_rate_minor,
    accept_terms: true,
    expected_total_minor: quote.total_minor,
    idempotency_key: idempotencyKey,
    ...(quote.promo_code ? { promo_code: quote.promo_code } : {}),
  };
}
