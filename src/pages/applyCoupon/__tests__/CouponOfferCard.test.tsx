import TestRenderer, { act, type ReactTestRenderer } from 'react-test-renderer';

import { i18n } from '@/services/i18n';
import type { CouponOffer } from '@/services/promos/promoApi';

import { CouponOfferCard } from '../CouponOfferCard';

jest.mock('@/components/ui', () => {
  const { Pressable, Text } = require('react-native');
  const Button = ({
    label,
    onPress,
    disabled,
    testID,
  }: Record<string, any>) => (
    <Pressable
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
    >
      <Text>{label}</Text>
    </Pressable>
  );
  return { OutlineButton: Button, TextButton: Button };
});

const bare: CouponOffer = {
  id: 'o2',
  code: 'flat50',
  title: '',
  discount_type: 'flat',
  discount_value: 50,
  applies_to: 'all_fees',
  max_discount_minor: null,
  min_booking_minor: null,
  booking_types: 'all',
  valid_until: null,
  is_voucher: false,
  eligible: true,
  ineligible_reason: null,
  message: null,
};

let tree: ReactTestRenderer;
const text = () => JSON.stringify(tree.toJSON());

function render(props: Partial<Parameters<typeof CouponOfferCard>[0]> = {}) {
  const onApply = jest.fn();
  const onRemove = jest.fn();
  act(() => {
    tree = TestRenderer.create(
      <CouponOfferCard
        offer={bare}
        applied={false}
        disabled={false}
        pending={false}
        onApply={onApply}
        onRemove={onRemove}
        {...props}
      />,
    );
  });
  return { onApply, onRemove };
}

beforeAll(async () => {
  await act(async () => {
    await i18n.changeLanguage('en');
  });
});

describe('CouponOfferCard', () => {
  it('shows a flat discount without optional terms', () => {
    render();
    expect(text()).toContain('₹50');
    expect(text()).not.toContain('Up to');
    expect(text()).not.toContain('Valid until');
    expect(text()).not.toContain('For you');
    expect(text()).toContain('Apply FLAT50');
  });

  it('marks a pending apply', () => {
    render({ pending: true });
    expect(text()).toContain(i18n.t('coupons.applying'));
  });

  it('removes only when not busy', () => {
    const idle = render({ applied: true });
    tree.root.findByProps({ testID: 'coupon-remove-flat50' }).props.onPress();
    expect(idle.onRemove).toHaveBeenCalledTimes(1);

    const busy = render({ applied: true, disabled: true });
    tree.root.findByProps({ testID: 'coupon-remove-flat50' }).props.onPress();
    expect(busy.onRemove).not.toHaveBeenCalled();
  });
});
