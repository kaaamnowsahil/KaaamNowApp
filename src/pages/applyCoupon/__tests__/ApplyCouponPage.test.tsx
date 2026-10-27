import TestRenderer, { act, type ReactTestRenderer } from 'react-test-renderer';

import { ApiError } from '@/services/api/apiClient';
import { i18n } from '@/services/i18n';
import { promoApi, type CouponOffer } from '@/services/promos/promoApi';
import {
  useCouponSession,
  type CouponSession,
} from '@/services/promos/useCouponSession';

import { ApplyCouponContent, ApplyCouponPage } from '../ApplyCouponPage';

jest.mock('@/services/promos/promoApi', () => ({
  promoApi: { available: jest.fn(), validate: jest.fn() },
}));

jest.mock('@/layout/FormScreen', () => {
  const { View } = require('react-native');
  return {
    FormScreen: ({ children }: { children: unknown }) => (
      <View>{children}</View>
    ),
  };
});

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

const available = promoApi.available as jest.Mock;
const validate = promoApi.validate as jest.Mock;

const offer = (over: Partial<CouponOffer> = {}): CouponOffer => ({
  id: 'o1',
  code: 'SAVE10',
  title: 'Festive offer',
  discount_type: 'percent',
  discount_value: 10,
  applies_to: 'commission',
  max_discount_minor: 20000,
  min_booking_minor: 50000,
  booking_types: 'all',
  valid_until: '2026-12-31T00:00:00Z',
  is_voucher: true,
  eligible: true,
  ineligible_reason: null,
  message: null,
  ...over,
});

const invalid = (reason: string) =>
  new ApiError('x', 'promo_invalid', 400, { reason });

const flush = () => act(async () => {});

let tree: ReactTestRenderer;
const byId = (id: string) => tree.root.findByProps({ testID: id });
const has = (id: string) => tree.root.findAllByProps({ testID: id }).length > 0;
const text = () => JSON.stringify(tree.toJSON());

function makeSession(over: Partial<CouponSession> = {}): CouponSession {
  return {
    bookingType: 'live',
    amountMinor: 90000,
    appliedCode: null,
    apply: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    ...over,
  };
}

async function renderScreen(session = makeSession(), onClose = jest.fn()) {
  await act(async () => {
    tree = TestRenderer.create(
      <ApplyCouponContent session={session} onClose={onClose} />,
    );
  });
  return { session, onClose };
}

beforeEach(async () => {
  available.mockReset().mockResolvedValue({ items: [offer()] });
  validate.mockReset().mockResolvedValue(offer());
  useCouponSession.getState().end();
  await act(async () => {
    await i18n.changeLanguage('en');
  });
});

describe('Apply Coupon screen', () => {
  it('shows loading, then the coupons for this booking', async () => {
    let resolve: (value: unknown) => void = () => undefined;
    available.mockReturnValueOnce(new Promise(r => (resolve = r)));
    await renderScreen();
    expect(has('coupon-loading')).toBe(true);
    await act(async () => resolve({ items: [offer()] }));
    expect(available).toHaveBeenCalledWith('live', 90000);
    expect(text()).toContain('SAVE10');
    expect(text()).toContain('For you');
    expect(text()).toContain('10% off platform commission');
    expect(text()).toContain('Up to ₹200 off');
    expect(text()).toContain('On bookings of ₹500 or more');
  });

  it('says when there are no coupons', async () => {
    available.mockResolvedValueOnce({ items: [] });
    await renderScreen();
    expect(has('coupon-none')).toBe(true);
  });

  it('reports a network failure and retries', async () => {
    available.mockRejectedValueOnce(new ApiError('x', 'network_error', 0));
    await renderScreen();
    expect(text()).toContain('Couldn’t reach the server');
    await act(async () => byId('coupon-retry').props.onPress());
    expect(available).toHaveBeenCalledTimes(2);
    expect(text()).toContain('SAVE10');
  });

  it('explains why a coupon cannot be used', async () => {
    available.mockResolvedValueOnce({
      items: [
        offer({
          eligible: false,
          ineligible_reason: 'below_minimum',
          is_voucher: false,
        }),
      ],
    });
    await renderScreen();
    expect(text()).toContain('below the coupon’s minimum');
    expect(byId('coupon-apply-SAVE10').props.disabled).toBe(true);
  });

  it('applies a listed coupon through the server and closes', async () => {
    const { session, onClose } = await renderScreen();
    await act(async () => byId('coupon-apply-SAVE10').props.onPress());
    expect(validate).toHaveBeenCalledWith('SAVE10', 'live', 90000);
    expect(session.apply).toHaveBeenCalledWith('SAVE10');
    expect(onClose).toHaveBeenCalled();
  });

  it('applies a typed code once even when tapped twice', async () => {
    let finish: () => void = () => undefined;
    const session = makeSession({
      apply: jest.fn(() => new Promise<void>(r => (finish = r))),
    });
    await renderScreen(session);
    await act(async () =>
      byId('coupon-code-input').props.onChangeText(' save 10 '),
    );
    act(() => {
      byId('coupon-code-apply').props.onPress();
      byId('coupon-code-apply').props.onPress();
    });
    await flush();
    expect(text()).toContain('Applying');
    await act(async () => finish());
    expect(validate).toHaveBeenCalledTimes(1);
    expect(session.apply).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['expired', 'This coupon has expired.'],
    ['already_used', 'You’ve already used this coupon.'],
    ['not_found', 'We couldn’t find that coupon.'],
    ['used_up', 'This coupon has been fully used.'],
  ])(
    'shows the %s reason and keeps the screen open',
    async (reason, message) => {
      validate.mockRejectedValueOnce(invalid(reason));
      const { session, onClose } = await renderScreen();
      await act(async () =>
        byId('coupon-code-input').props.onChangeText('OLD1'),
      );
      await act(async () => byId('coupon-code-apply').props.onPress());
      expect(byId('coupon-error').props.children).toBe(message);
      expect(session.apply).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    },
  );

  it('rejects a malformed code without calling the server', async () => {
    await renderScreen();
    await act(async () => byId('coupon-code-input').props.onChangeText('!'));
    await act(async () => byId('coupon-code-input').props.onSubmitEditing());
    expect(validate).not.toHaveBeenCalled();
    expect(text()).toContain('Enter a valid coupon code');
    await act(async () => byId('coupon-code-input').props.onChangeText('OK1'));
    expect(has('coupon-error')).toBe(false);
  });

  it('shows the checkout re-pricing failure', async () => {
    const session = makeSession({
      apply: jest
        .fn()
        .mockRejectedValue(new ApiError('x', 'price_changed', 409)),
    });
    const { onClose } = await renderScreen(session);
    await act(async () => byId('coupon-apply-SAVE10').props.onPress());
    expect(text()).toContain('The price changed');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('removes the applied coupon', async () => {
    const session = makeSession({ appliedCode: 'save10' });
    const { onClose } = await renderScreen(session);
    expect(text()).toContain('Applied');
    await act(async () => byId('coupon-remove-SAVE10').props.onPress());
    expect(session.remove).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('is translated', async () => {
    await act(async () => {
      await i18n.changeLanguage('hi');
    });
    await renderScreen();
    expect(text()).not.toContain('Available coupons');
    expect(text()).toContain(i18n.t('coupons.available'));
  });
});

describe('ApplyCouponPage', () => {
  beforeAll(async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  const navigation = () => ({ goBack: jest.fn() });

  it('goes back when no checkout opened it', async () => {
    const nav = navigation();
    await act(async () => {
      tree = TestRenderer.create(
        <ApplyCouponPage navigation={nav as never} route={{} as never} />,
      );
    });
    expect(nav.goBack).toHaveBeenCalled();
    expect(tree.toJSON()).toBeNull();
  });

  it('applies within the session and records the code', async () => {
    const session = makeSession();
    act(() => useCouponSession.getState().start(session));
    const nav = navigation();
    await act(async () => {
      tree = TestRenderer.create(
        <ApplyCouponPage navigation={nav as never} route={{} as never} />,
      );
    });
    await act(async () => byId('coupon-apply-SAVE10').props.onPress());
    expect(useCouponSession.getState().session?.appliedCode).toBe('SAVE10');
    expect(nav.goBack).toHaveBeenCalled();
  });
});
