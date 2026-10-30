import { i18n } from '@/services/i18n';
import { toShift } from '@/services/shifts/shiftMappers';
import type { WorkerShiftCard } from '@/services/shifts/shiftsApi';
import type { BusinessShiftDraft, BusinessShiftSlot } from '@/types';

import { scheduleAt, slotErrors, slotPricing, toBulkItems } from '../utils';

const inThreeDays = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

const slot = (over: Partial<BusinessShiftSlot> = {}): BusinessShiftSlot => ({
  id: 's1',
  date: inThreeDays(),
  startTime: '09:00',
  endTime: '17:00',
  role: 'Helper',
  category: 'kitchen',
  requirement: '',
  responsibilities: 'Prep',
  workers: '2',
  hourlyRate: '150',
  breakMinutes: '30',
  ...over,
});

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('slotErrors', () => {
  it('accepts a task with only a start and a fixed price', () => {
    expect(
      slotErrors(
        slot({
          pricingMode: 'task',
          taskPrice: '600',
          endTime: '',
          hourlyRate: '',
          breakMinutes: '',
        }),
      ),
    ).toEqual({});
  });

  it('flags a missing or too-high task price', () => {
    expect(
      slotErrors(slot({ pricingMode: 'task', taskPrice: '' })).taskPrice,
    ).toBe('Enter the price for the task.');
    expect(
      slotErrors(slot({ pricingMode: 'task', taskPrice: '1000001' })).taskPrice,
    ).toContain('at most');
  });

  it('still needs workers and a start for tasks', () => {
    const errors = slotErrors(
      slot({
        pricingMode: 'task',
        taskPrice: '600',
        workers: '0',
        startTime: '',
      }),
    );
    expect(errors.workers).toBeTruthy();
    expect(errors.startTime).toBeTruthy();
  });

  it('keeps the hourly checks for hourly shifts', () => {
    const errors = slotErrors(slot({ hourlyRate: '', endTime: '' }));
    expect(errors.hourlyRate).toBeTruthy();
    expect(errors.endTime).toBeTruthy();
    expect(errors.taskPrice).toBeUndefined();
  });
});

describe('slotPricing / toBulkItems', () => {
  it('sends rate, start, end and break for hourly shifts', () => {
    const s = slot();
    expect(slotPricing(s)).toEqual({
      pricing_mode: 'hourly',
      hourly_rate_minor: 15000,
      starts_at: scheduleAt(s.date, '09:00').toISOString(),
      ends_at: scheduleAt(s.date, '17:00').toISOString(),
      break_minutes: 30,
    });
  });

  it('sends only a fixed price and a start for tasks', () => {
    const s = slot({ pricingMode: 'task', taskPrice: '600.5' });
    const draft = {
      schedules: [s],
      location: 'MG Road',
      latitude: 12.9,
      longitude: 77.6,
    } as BusinessShiftDraft;
    const [item] = toBulkItems(draft);
    expect(item).toMatchObject({
      pricing_mode: 'task',
      task_price_minor: 60050,
      starts_at: scheduleAt(s.date, '09:00').toISOString(),
      break_minutes: 0,
      workers_required: 2,
    });
    expect(item).not.toHaveProperty('ends_at');
    expect(item).not.toHaveProperty('hourly_rate_minor');
  });
});

describe('toShift', () => {
  const card = {
    id: 'shift-1',
    shift_type: 'scheduled',
    status: 'open',
    job_title: 'Helper',
    category_slug: 'kitchen',
    category_name: 'Kitchen',
    business: {
      id: 'b1',
      business_name: 'Chai Point',
      rating_avg: 4.5,
      rating_count: 3,
      verification_status: 'verified',
    },
    workplace_name: '',
    address_text: 'MG Road',
    latitude: null,
    longitude: null,
    starts_at: '2026-11-02T09:00:00',
    ends_at: '2026-11-02T21:00:00',
    break_minutes: 0,
    hourly_rate_minor: 0,
    worker_hourly_rate_minor: 0,
    currency: 'INR',
    estimated_pay_minor: 58000,
    spots_left: 1,
  } as WorkerShiftCard;

  it('shows only the start and no length for a task', () => {
    const shift = toShift({
      ...card,
      pricing_mode: 'task',
      task_price_minor: 60000,
    });
    expect(shift.pricingMode).toBe('task');
    expect(shift.timeLabel).toBe('Starts 09:00');
    expect(shift.durationHours).toBe(0);
    expect(shift.estimatedPay).toBe(580);
  });

  it('treats a card without a pricing mode as hourly', () => {
    const shift = toShift(card);
    expect(shift.pricingMode).toBe('hourly');
    expect(shift.timeLabel).toBe('09:00–21:00');
  });
});
