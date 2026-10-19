import {
  formatLocalPhone,
  toE164India,
  toLocalDigits,
} from '../src/pages/welcome/hooks/useWelcome';

test.each([
  ['9876543210', '9876543210'],
  ['98765 43210', '9876543210'],
  ['+91 98765 43210', '9876543210'],
  ['09876543210', '9876543210'],
  ['98765432109999', '9876543210'],
])('toLocalDigits(%s)', (input, expected) => {
  expect(toLocalDigits(input)).toBe(expected);
});

test('formatLocalPhone groups 5 + 5', () => {
  expect(formatLocalPhone('98765')).toBe('98765');
  expect(formatLocalPhone('9876543210')).toBe('98765 43210');
});

test('toE164India accepts only valid mobiles', () => {
  expect(toE164India('9876543210')).toBe('+919876543210');
  expect(toE164India('5876543210')).toBeNull();
  expect(toE164India('98765')).toBeNull();
});
