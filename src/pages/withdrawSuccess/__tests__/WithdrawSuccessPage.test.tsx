import { Share } from 'react-native';
import TestRenderer, { act, type ReactTestRenderer } from 'react-test-renderer';

import { ROUTES } from '@/constants/routes';
import { earningsApi, type Withdrawal } from '@/services/earnings/earningsApi';
import { i18n } from '@/services/i18n';

import { WithdrawSuccessPage } from '../WithdrawSuccessPage';

jest.mock('@react-navigation/native', () => ({ useFocusEffect: jest.fn() }));
jest.mock('@/shared/hooks/useHardwareBack', () => ({
  useHardwareBack: jest.fn(),
}));
jest.mock('@/services/earnings/earningsApi', () => ({
  earningsApi: { withdrawal: jest.fn() },
}));
jest.mock('@/assets/icons/check.svg', () => 'CheckIcon');
jest.mock('@/assets/icons/clock.svg', () => 'ClockIcon');
jest.mock('@/assets/icons/triangle-alert.svg', () => 'AlertIcon');

jest.mock('@/layout/FormScreen', () => {
  const { View } = require('react-native');
  return {
    FormScreen: ({ children, actions, isLoading }: Record<string, any>) => (
      <View testID={isLoading ? 'loading' : 'screen'}>
        {isLoading ? null : children}
        {actions}
      </View>
    ),
  };
});

jest.mock('@/components/earnings', () => {
  const { Text, View } = require('react-native');
  return {
    ReceiptCard: ({ lines }: { lines: { label: string; value: string }[] }) => (
      <View>
        {lines.map(line => (
          <Text key={line.label}>{`${line.label}: ${line.value}`}</Text>
        ))}
      </View>
    ),
  };
});

jest.mock('@/components/ui', () => {
  const { Pressable, Text, View } = require('react-native');
  const Button = ({ label, onPress, testID }: Record<string, any>) => (
    <Pressable onPress={onPress} testID={testID}>
      <Text>{label}</Text>
    </Pressable>
  );
  return {
    PrimaryButton: Button,
    SecondaryButton: Button,
    BodyNote: ({ children }: Record<string, any>) => <Text>{children}</Text>,
    PopIn: ({ children }: Record<string, any>) => <View>{children}</View>,
  };
});

const fetchWithdrawal = jest.mocked(earningsApi.withdrawal);

const withdrawal = (over: Partial<Withdrawal> = {}): Withdrawal => ({
  id: 'w-1',
  amount_minor: 120050,
  currency: 'INR',
  status: 'processing',
  reference: 'KN-WD-REAL1',
  payout_account_id: 'acc-1',
  payout_display: 'UPI · aarav@okaxis',
  initiated_at: '2026-10-27T10:00:00Z',
  ...over,
});

let tree: ReactTestRenderer;
const navigation = { popTo: jest.fn() };
const text = () => JSON.stringify(tree.toJSON());
const press = (id: string) =>
  act(async () => tree.root.findByProps({ testID: id }).props.onPress());

async function renderPage(params: {
  withdrawalId: string;
  withdrawal?: Withdrawal;
}) {
  await act(async () => {
    tree = TestRenderer.create(
      <WithdrawSuccessPage
        navigation={navigation as never}
        route={{ key: 'ws', name: ROUTES.withdrawSuccess, params } as never}
      />,
    );
  });
}

beforeEach(async () => {
  fetchWithdrawal.mockReset().mockResolvedValue(withdrawal());
  navigation.popTo.mockReset();
  await act(async () => {
    await i18n.changeLanguage('en');
  });
});

describe('Withdrawal result screen', () => {
  it('shows the server record for a processing withdrawal', async () => {
    await renderPage({ withdrawalId: 'w-1' });
    expect(fetchWithdrawal).toHaveBeenCalledWith('w-1');
    const shown = text();
    expect(shown).toContain('Withdrawal initiated');
    expect(shown).toContain('Amount: ₹1,200.50');
    expect(shown).toContain('To: UPI · aarav@okaxis');
    expect(shown).toContain('Reference: KN-WD-REAL1');
    expect(shown).toContain('Status: Processing');
    expect(shown).toContain('Payouts reach you within 24 hours');
  });

  it('paints from the route, then trusts the fresh server status', async () => {
    let resolve: (value: Withdrawal) => void = () => undefined;
    fetchWithdrawal.mockReturnValueOnce(new Promise(r => (resolve = r)));
    await renderPage({ withdrawalId: 'w-1', withdrawal: withdrawal() });
    expect(text()).toContain('Withdrawal initiated');
    await act(async () => resolve(withdrawal({ status: 'paid' })));
    expect(text()).toContain('Withdrawal paid');
    expect(text()).toContain('Status: Paid');
    expect(text()).not.toContain('Payouts reach you within 24 hours');
  });

  it('ignores route data for a different withdrawal', async () => {
    fetchWithdrawal.mockReturnValue(new Promise(() => undefined));
    await renderPage({ withdrawalId: 'w-2', withdrawal: withdrawal() });
    expect(text()).not.toContain('Withdrawal initiated');
  });

  it('explains a failed payout', async () => {
    fetchWithdrawal.mockResolvedValue(withdrawal({ status: 'failed' }));
    await renderPage({ withdrawalId: 'w-1' });
    expect(text()).toContain('Withdrawal failed');
    expect(text()).toContain(
      'The amount has been returned to your available balance.',
    );
    expect(text()).toContain('Status: Failed');
  });

  it('reports a load error and returns to earnings', async () => {
    fetchWithdrawal.mockRejectedValue(new Error('Withdrawal not found'));
    await renderPage({ withdrawalId: 'w-9' });
    expect(text()).toContain('Withdrawal not found');
    await press('withdraw-success-back');
    expect(navigation.popTo).toHaveBeenCalledWith(ROUTES.mainTabs, {
      screen: ROUTES.workerEarnings,
    });
  });

  it('shares a receipt with the real details', async () => {
    const share = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: 'sharedAction', activityType: undefined });
    await renderPage({ withdrawalId: 'w-1' });
    await press('withdraw-success-receipt');
    expect(share.mock.calls[0]?.[0].message).toContain(
      'Reference: KN-WD-REAL1',
    );
  });
});
