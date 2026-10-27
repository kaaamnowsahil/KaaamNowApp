import { createRequest, quoteRequest } from '../livePrice';
import type { LiveWorkForm } from '../liveWorkFormat';
import type { LivePriceBreakdown } from '../liveWorkTypes';

const form: LiveWorkForm = {
  categorySlug: 'helper',
  jobTitle: '  Kitchen helper ',
  description: ' Lunch rush ',
  address: ' MG Road ',
  latitude: 12.9,
  longitude: 77.6,
  instructions: ' Back door ',
  siteContact: ' Ravi ',
  durationMinutes: 120,
  rate: '450.5',
};

const quote = {
  hourly_rate_minor: 45050,
  total_minor: 93000,
  promo_code: null,
} as LivePriceBreakdown;

describe('quoteRequest', () => {
  it('prices the rate in paise without a coupon', () => {
    expect(quoteRequest(form, null)).toEqual({
      category_slug: 'helper',
      hourly_rate_minor: 45050,
      duration_minutes: 120,
    });
  });

  it('sends the applied coupon', () => {
    expect(quoteRequest(form, 'SAVE10').promo_code).toBe('SAVE10');
  });
});

describe('createRequest', () => {
  it('books exactly the reviewed quote with trimmed text', () => {
    expect(createRequest(form, quote, 'key-1')).toEqual({
      category_slug: 'helper',
      job_title: 'Kitchen helper',
      description: 'Lunch rush',
      address_text: 'MG Road',
      latitude: 12.9,
      longitude: 77.6,
      arrival_instructions: 'Back door',
      site_contact_name: 'Ravi',
      duration_minutes: 120,
      hourly_rate_minor: 45050,
      accept_terms: true,
      expected_total_minor: 93000,
      idempotency_key: 'key-1',
    });
  });

  it('carries the coupon the quote was priced with', () => {
    expect(
      createRequest(form, { ...quote, promo_code: 'SAVE10' }, 'k').promo_code,
    ).toBe('SAVE10');
  });
});
