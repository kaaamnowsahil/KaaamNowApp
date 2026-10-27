import { ApiError } from '@/services/api/apiClient';

import {
  formatClock,
  formatMinutes,
  isRequestTaken,
  liveErrorText,
  rupeesToMinor,
  secondsUntil,
  serverFieldErrors,
  validateLiveWorkForm,
  type LiveWorkForm,
} from '../liveWorkFormat';

jest.mock('@/services/auth/authApi', () => ({
  apiBaseUrl: '',
  refreshAuthTokens: jest.fn(),
}));
jest.mock('@/services/auth/useAuthStore', () => ({
  useAuthStore: { getState: jest.fn() },
}));

const validForm: LiveWorkForm = {
  categorySlug: 'cleaning',
  jobTitle: 'Kitchen helper',
  description: '',
  address: 'Koramangala, Bengaluru',
  latitude: 12.93,
  longitude: 77.62,
  instructions: '',
  siteContact: '',
  durationMinutes: 120,
  rate: '500',
};

describe('rupeesToMinor', () => {
  it('converts rupee text to paise', () => {
    expect(rupeesToMinor('500')).toBe(50000);
    expect(rupeesToMinor(' 450.5 ')).toBe(45050);
    expect(rupeesToMinor('450.05')).toBe(45005);
  });

  it('rejects malformed amounts', () => {
    for (const bad of ['', 'abc', '1.234', '-5', '1,000', '.5']) {
      expect(rupeesToMinor(bad)).toBeNull();
    }
  });
});

describe('validateLiveWorkForm', () => {
  it('accepts a complete form', () => {
    expect(validateLiveWorkForm(validForm)).toEqual({});
  });

  it('flags each missing or invalid field inline', () => {
    const errors = validateLiveWorkForm({
      ...validForm,
      categorySlug: '',
      jobTitle: ' ',
      address: '',
      durationMinutes: 45,
      rate: '0',
    });
    expect(Object.keys(errors).sort()).toEqual([
      'address',
      'categorySlug',
      'durationMinutes',
      'jobTitle',
      'rate',
    ]);
  });

  it('requires coordinates for a typed address', () => {
    const errors = validateLiveWorkForm({ ...validForm, latitude: null });
    expect(errors.address).toMatch(/map/);
  });

  it('caps the rate', () => {
    expect(
      validateLiveWorkForm({ ...validForm, rate: '100001' }).rate,
    ).toBeDefined();
  });
});

describe('server errors', () => {
  it('maps snake_case field errors onto the form', () => {
    const error = new ApiError('Invalid', 'validation_error', 422, {
      fields: {
        hourly_rate_minor: 'Too low',
        latitude: 'Out of area',
        unknown: 'x',
      },
    });
    expect(serverFieldErrors(error)).toEqual({
      rate: 'Too low',
      address: 'Out of area',
    });
  });

  it('ignores list-shaped validation details', () => {
    const error = new ApiError('Invalid', 'validation_error', 422, [
      { loc: ['body'] },
    ]);
    expect(serverFieldErrors(error)).toEqual({});
  });

  it('adds the request reference only for server failures', () => {
    expect(
      liveErrorText(new ApiError('Boom', 'internal_error', 500, null, 'req-1')),
    ).toBe('Boom (Ref: req-1)');
    expect(liveErrorText(new ApiError('Nope', 'bad', 400, null, 'req-2'))).toBe(
      'Nope',
    );
    expect(liveErrorText(null)).toMatch(/try again/);
  });

  it('recognises a request another worker already took', () => {
    expect(isRequestTaken(new ApiError('Taken', 'shift_full', 409))).toBe(true);
    expect(isRequestTaken(new ApiError('Other', 'location_stale', 409))).toBe(
      false,
    );
  });
});

describe('time helpers', () => {
  it('counts down against the server clock', () => {
    const now = Date.parse('2026-10-27T10:00:00Z');
    expect(secondsUntil('2026-10-27T10:01:00Z', 0, now)).toBe(60);
    expect(secondsUntil('2026-10-27T10:01:00Z', 15000, now)).toBe(45);
    expect(secondsUntil('2026-10-27T09:59:00Z', 0, now)).toBe(0);
    expect(secondsUntil(null, 0, now)).toBeNull();
  });

  it('formats clocks and durations', () => {
    expect(formatClock(null)).toBe('—');
    expect(formatClock(65)).toBe('01:05');
    expect(formatClock(3725)).toBe('1:02:05');
    expect(formatMinutes(90)).toBe('1 h 30 min');
    expect(formatMinutes(120)).toBe('2 h');
    expect(formatMinutes(30)).toBe('30 min');
  });
});
