import { formatMmSs, maskIndianPhone } from '../src/utils/format';

test('maskIndianPhone matches Figma format', () => {
  expect(maskIndianPhone('+919876543210')).toBe('+91 ••••• 43210');
});

test.each([
  [272, '04:32'],
  [28, '00:28'],
  [0, '00:00'],
  [-5, '00:00'],
])('formatMmSs(%i)', (input, expected) => {
  expect(formatMmSs(input)).toBe(expected);
});
