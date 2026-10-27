import TestRenderer, { act, type ReactTestRenderer } from 'react-test-renderer';

import { ROUTES } from '@/constants/routes';
import { ApiError } from '@/services/api/apiClient';
import {
  earningsApi,
  type EarningsSummaryResponse,
  type PayoutAccount,
  type Withdrawal,
} from '@/services/earnings/earningsApi';
import { i18n } from '@/services/i18n';

import { WithdrawPage } from '../WithdrawPage';

jest.mock('@react-navigation/native', () => ({ useFocusEffect: jest.fn() }));

jest.mock('@/services/earnings/earningsApi', () => ({
  earningsApi: {
    summary: jest.fn(),
    payoutAccounts: jest.fn(),
    createWithdrawal: jest.fn(),
  },
}));

jest.mock('@/assets/figma/wallet.svg', () => 'WalletIcon');
jest.mock('@/assets/icons/shield-check.svg', () => 'ShieldIcon');
jest.mock('@/assets/icons/qr-code.svg', () => 'QrIcon');

jest.mock('@/layout/FormScreen', () => {
  const { View } = require('react-native');
  return {
    FormScreen: ({ children, actions, isLoading }: Record<string, any>) => (
      <View testID={isLoading ? 'loading' : 'screen'}>
        {isLoading ? null : children}
        {isLoading ? null : actions}
      </View>
    ),
  };
});

jest.mock('@/components/ui', () => {
  const { Pressable, Text, TextInput, View } = require('react-native');
  return {
    PrimaryButton: ({
      label,
      onPress,
      disabled,
      testID,
    }: Record<string, any>) => (
      <Pressable disabled={disabled} onPress={onPress} testID={testID}>
        <Text>{label}</Text>
      </Pressable>
    ),
    IconField: ({
      label,
      value,
      onChangeText,
      error,
      testID,
    }: Record<string, any>) => (
      <View>
        <Text>{label}</Text>
        <TextInput value={value} onChangeText={onChangeText} testID={testID} />
        {error ? <Text testID={`${testID}-error`}>{error}</Text> : null}
      </View>
    ),
    BodyNote: ({ children }: Record<string, any>) => <Text>{children}</Text>,
    RadioCheck: ({ selected }: { selected: boolean }) => (
      <Text>{selected ? 'selected' : 'unselected'}</Text>
    ),
  };
});

const summary = jest.mocked(earningsApi.summary);
const payoutAccounts = jest.mocked(earningsApi.payoutAccounts);
const createWithdrawal = jest.mocked(earningsApi.createWithdrawal);

const wallet = (
  over: Partial<EarningsSummaryResponse> = {},
): EarningsSummaryResponse => ({
  currency: 'INR',
  available_minor: 485000,
  dues_minor: 0,
  pending_minor: 0,
  in_flight_withdrawals_minor: 0,
  lifetime_minor: 485000,
  this_month_minor: 485000,
  completed_shifts: 12,
  min_withdrawal_minor: 10000,
  recent: [],
  ...over,
});

const accounts: PayoutAccount[] = [
  {
    id: 'acc-bank',
    account_type: 'bank',
    display: 'Bank · ••••4821',
    bank_account_last4: '4821',
    account_holder_name: 'Aarav',
    is_default: false,
    is_verified: true,
  },
  {
    id: 'acc-upi',
    account_type: 'upi',
    display: 'UPI · aarav@okaxis',
    upi_id: 'aarav@okaxis',
    account_holder_name: 'Aarav',
    is_default: true,
    is_verified: true,
  },
  {
    id: 'acc-paytm',
    account_type: 'paytm',
    display: 'Paytm · 9876543210',
    paytm_phone: '9876543210',
    account_holder_name: 'Aarav',
    is_default: false,
    is_verified: false,
  },
  {
    id: 'acc-odd',
    account_type: 'bank',
    display: 'Bank · ••••',
    account_holder_name: 'Aarav',
    is_default: false,
    is_verified: false,
  },
];

const withdrawal: Withdrawal = {
  id: 'w-1',
  amount_minor: 485000,
  currency: 'INR',
  status: 'processing',
  reference: 'KN-WD-REAL1',
  payout_account_id: 'acc-upi',
  payout_display: 'UPI · aarav@okaxis',
  initiated_at: '2026-10-27T10:00:00Z',
};

let tree: ReactTestRenderer;
const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  replace: jest.fn(),
};
const byId = (id: string) => tree.root.findByProps({ testID: id });
const has = (id: string) => tree.root.findAllByProps({ testID: id }).length > 0;
const text = () => JSON.stringify(tree.toJSON());
const press = (id: string) => act(async () => byId(id).props.onPress());
const type = (value: string) =>
  act(async () => byId('withdraw-amount').props.onChangeText(value));
const sent = (call: number) => createWithdrawal.mock.calls[call]?.[0];

async function renderPage() {
  await act(async () => {
    tree = TestRenderer.create(
      <WithdrawPage
        navigation={navigation as never}
        route={{ key: 'w', name: ROUTES.withdraw } as never}
      />,
    );
  });
}

beforeEach(async () => {
  summary.mockReset().mockResolvedValue(wallet());
  payoutAccounts.mockReset().mockResolvedValue(accounts);
  createWithdrawal.mockReset().mockResolvedValue(withdrawal);
  Object.values(navigation).forEach(fn => fn.mockReset());
  await act(async () => {
    await i18n.changeLanguage('en');
  });
});

describe('Withdraw screen', () => {
  it('prefills the balance and default account, then withdraws for real', async () => {
    await renderPage();
    expect(text()).toContain('₹4,850');
    expect(text()).toContain('Earnings from 12 completed shifts');
    expect(text()).toContain('aarav@okaxis');
    expect(text()).toContain('9876543210');
    expect(text()).toContain('••••4821');
    expect(text()).not.toMatch(/mock/i);
    expect(byId('withdraw-amount').props.value).toBe('4850');
    expect(byId('payout-option-acc-upi').props.accessibilityState).toEqual({
      selected: true,
    });

    await press('withdraw-submit');
    expect(sent(0)).toEqual({
      payout_account_id: 'acc-upi',
      amount_minor: 485000,
      idempotency_key: expect.stringMatching(/^wd_/),
    });
    expect(navigation.replace).toHaveBeenCalledWith(ROUTES.withdrawSuccess, {
      withdrawalId: 'w-1',
      withdrawal,
    });
  });

  it('sends the chosen account and the amount in paise', async () => {
    await renderPage();
    await press('payout-option-acc-bank');
    await type('1,200.50');
    await press('withdraw-submit');
    expect(sent(0)).toMatchObject({
      payout_account_id: 'acc-bank',
      amount_minor: 120050,
    });
  });

  it('blocks invalid amounts before calling the server', async () => {
    await renderPage();
    await type('50');
    expect(byId('withdraw-amount-error').props.children).toBe(
      'The minimum withdrawal is ₹100.',
    );
    await type('5000');
    expect(byId('withdraw-amount-error').props.children).toBe(
      'You can withdraw up to ₹4,850.',
    );
    await type('abc');
    expect(byId('withdraw-amount-error').props.children).toBe(
      'Enter a valid amount, like 500 or 500.50.',
    );
    await type('');
    expect(has('withdraw-amount-error')).toBe(false);
    await press('withdraw-submit');
    expect(has('withdraw-amount-error')).toBe(true);
    expect(createWithdrawal).not.toHaveBeenCalled();
  });

  it('sends one request for a double tap and reuses the key after a network failure', async () => {
    let fail: (error: Error) => void = () => undefined;
    createWithdrawal.mockReturnValueOnce(
      new Promise((_, reject) => (fail = reject)),
    );
    await renderPage();
    const submit = byId('withdraw-submit').props.onPress;
    await act(async () => {
      submit();
      submit();
    });
    expect(text()).toContain('Withdrawing...');
    expect(createWithdrawal).toHaveBeenCalledTimes(1);

    await act(async () => fail(new Error('Network down')));
    expect(byId('withdraw-error').props.children).toBe('Network down');

    await press('withdraw-submit');
    expect(createWithdrawal).toHaveBeenCalledTimes(2);
    expect(sent(1)?.idempotency_key).toBe(sent(0)?.idempotency_key);
  });

  it('uses a new key once the amount changes', async () => {
    createWithdrawal.mockRejectedValueOnce(new Error('Network down'));
    await renderPage();
    await press('withdraw-submit');
    expect(has('withdraw-error')).toBe(true);
    await type('500');
    expect(has('withdraw-error')).toBe(false);
    await press('withdraw-submit');
    expect(sent(1)?.idempotency_key).not.toBe(sent(0)?.idempotency_key);
  });

  it('explains a server rejection and reloads the balance', async () => {
    createWithdrawal.mockRejectedValueOnce(
      new ApiError('x', 'insufficient_balance', 409),
    );
    await renderPage();
    summary.mockResolvedValue(wallet({ available_minor: 300000 }));
    await press('withdraw-submit');
    expect(summary).toHaveBeenCalledTimes(2);
    expect(text()).toContain('₹3,000');
    expect(byId('withdraw-amount-error').props.children).toBe(
      'You can withdraw up to ₹3,000.',
    );
    expect(has('withdraw-error')).toBe(false);
  });

  it('shows the minimum when the server refuses a small withdrawal', async () => {
    createWithdrawal.mockRejectedValueOnce(
      new ApiError('x', 'withdrawal_below_min', 400),
    );
    await renderPage();
    await press('withdraw-submit');
    expect(byId('withdraw-error').props.children).toBe(
      'The minimum withdrawal is ₹100.',
    );
  });

  it('opens Payout account from the add option', async () => {
    await renderPage();
    const row = byId('payout-option-add-upi');
    expect(row.props.style({ pressed: true })).toContainEqual({ opacity: 0.7 });
    expect(row.props.style({ pressed: false })).toContain(false);
    await press('payout-option-add-upi');
    expect(navigation.navigate).toHaveBeenCalledWith(ROUTES.payoutAccount);
  });

  it('asks for a payout account when none is saved', async () => {
    payoutAccounts.mockResolvedValue([]);
    await renderPage();
    expect(text()).toContain('Add a payout account to withdraw your earnings.');
    expect(has('withdraw-amount')).toBe(false);
    await press('withdraw-add-account');
    expect(navigation.navigate).toHaveBeenCalledWith(ROUTES.payoutAccount);
  });

  it('does not offer a withdrawal below the minimum balance', async () => {
    summary.mockResolvedValue(wallet({ available_minor: -2000 }));
    await renderPage();
    expect(text()).toContain('₹0');
    expect(text()).toContain(
      'You can withdraw once your available balance reaches ₹100.',
    );
    await press('withdraw-back');
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('offers a retry when loading fails', async () => {
    summary.mockRejectedValueOnce(new Error('Server unavailable'));
    await renderPage();
    expect(text()).toContain('Server unavailable');
    await press('withdraw-retry');
    expect(text()).toContain('₹4,850');
  });

  it('shows nothing but the loader before data arrives', async () => {
    summary.mockReturnValue(new Promise(() => undefined));
    await renderPage();
    expect(has('loading')).toBe(true);
  });
});
