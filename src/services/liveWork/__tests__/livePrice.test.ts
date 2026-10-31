import { bookingTotal, createRequest, quoteRequest } from '../livePrice';
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
  pricingMode: 'hourly',
  durationMinutes: 120,
  rate: '450.5',
  taskPrice: '',
};

const quote = {
  pricing_mode: 'hourly',
  task_price_minor: null,
  hourly_rate_minor: 45050,
  total_minor: 93000,
  promo_code: null,
} as LivePriceBreakdown;

describe('quoteRequest', () => {
  it('prices the rate in paise without a coupon', () => {
    expect(quoteRequest(form, null)).toEqual({
      category_slug: 'helper',
      pricing_mode: 'hourly',
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
      pricing_mode: 'hourly',
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

describe('task pricing', () => {
  const task: LiveWorkForm = {
    ...form,
    pricingMode: 'task',
    taskPrice: '800',
  };
  const taskQuote = {
    ...quote,
    pricing_mode: 'task',
    task_price_minor: 80000,
    total_minor: 84864,
  } as LivePriceBreakdown;

  it('quotes only the fixed price', () => {
    expect(quoteRequest(task, null)).toEqual({
      category_slug: 'helper',
      pricing_mode: 'task',
      task_price_minor: 80000,
    });
  });

  it('books the reviewed fixed price without a duration or rate', () => {
    const body = createRequest(task, taskQuote, 'key-2');
    expect(body).toMatchObject({
      pricing_mode: 'task',
      task_price_minor: 80000,
      expected_total_minor: 84864,
    });
    expect(body).not.toHaveProperty('duration_minutes');
    expect(body).not.toHaveProperty('hourly_rate_minor');
  });
});

describe('several Workers', () => {
  const crewQuote = {
    ...quote,
    workers_required: 3,
    booking_total_minor: 279000,
  } as LivePriceBreakdown;

  it('asks for the Worker count only above one', () => {
    expect(quoteRequest({ ...form, workers: 3 }, null).workers_required).toBe(
      3,
    );
    expect(quoteRequest(form, null)).not.toHaveProperty('workers_required');
  });

  it('books the whole booking total for the quoted Workers', () => {
    const body = createRequest({ ...form, workers: 3 }, crewQuote, 'key-3');
    expect(body.workers_required).toBe(3);
    expect(body.expected_total_minor).toBe(279000);
  });

  it('works out the booking total when the server omits it', () => {
    expect(
      bookingTotal({ ...quote, workers_required: 2 } as LivePriceBreakdown),
    ).toBe(186000);
    expect(bookingTotal(quote)).toBe(93000);
  });
});
