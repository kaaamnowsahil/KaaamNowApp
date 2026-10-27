import TestRenderer, { act, type ReactTestRenderer } from 'react-test-renderer';

import { ROUTES } from '@/constants/routes';
import {
  earningsApi,
  type PayoutAccount,
} from '@/services/earnings/earningsApi';
import { i18n } from '@/services/i18n';

import { PayoutAccountPage } from '../PayoutAccountPage';

jest.mock('@react-navigation/native', () => ({ useFocusEffect: jest.fn() }));
jest.mock('@/services/earnings/earningsApi', () => ({
  earningsApi: {
    payoutAccounts: jest.fn(),
    addUpiAccount: jest.fn(),
    updateUpiAccount: jest.fn(),
  },
}));
jest.mock('@/assets/figma/user.svg', () => 'UserIcon');
jest.mock('@/assets/figma/wallet.svg', () => 'WalletIcon');

jest.mock('@/layout/FormScreen', () => {
  const { View } = require('react-native');
  return {
    FormScreen: ({ children, actions, isLoading }: Record<string, any>) => (
      <View testID={isLoading ? 'loading' : 'screen'}>
        {children}
        {actions}
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
      value,
      onChangeText,
      error,
      action,
      testID,
    }: Record<string, any>) => (
      <View>
        <TextInput value={value} onChangeText={onChangeText} testID={testID} />
        {action ? (
          <Text testID={`${testID}-action`}>{action.label}</Text>
        ) : null}
        {error ? <Text testID={`${testID}-error`}>{error}</Text> : null}
      </View>
    ),
    BodyNote: ({ children }: Record<string, any>) => <Text>{children}</Text>,
    ScreenIntro: ({ title }: Record<string, any>) => <Text>{title}</Text>,
  };
});

const payoutAccounts = jest.mocked(earningsApi.payoutAccounts);
const addUpiAccount = jest.mocked(earningsApi.addUpiAccount);
const updateUpiAccount = jest.mocked(earningsApi.updateUpiAccount);

const upiAccount = (over: Partial<PayoutAccount> = {}): PayoutAccount => ({
  id: 'acc-upi',
  account_type: 'upi',
  display: 'UPI · aarav@okaxis',
  upi_id: 'aarav@okaxis',
  account_holder_name: 'Aarav Sharma',
  is_default: true,
  is_verified: true,
  ...over,
});

const bankAccount = {
  ...upiAccount(),
  id: 'acc-bank',
  account_type: 'bank',
  upi_id: null,
} as PayoutAccount;

let tree: ReactTestRenderer;
const navigation = { goBack: jest.fn() };
const byId = (id: string) => tree.root.findByProps({ testID: id });
const has = (id: string) => tree.root.findAllByProps({ testID: id }).length > 0;
const text = () => JSON.stringify(tree.toJSON());
const change = (id: string, value: string) =>
  act(async () => byId(id).props.onChangeText(value));
const save = () => act(async () => byId('payout-save').props.onPress());

async function renderPage() {
  await act(async () => {
    tree = TestRenderer.create(
      <PayoutAccountPage
        navigation={navigation as never}
        route={{ key: 'p', name: ROUTES.payoutAccount } as never}
      />,
    );
  });
}

beforeEach(async () => {
  payoutAccounts.mockReset().mockResolvedValue([bankAccount, upiAccount()]);
  addUpiAccount.mockReset().mockResolvedValue(upiAccount());
  updateUpiAccount.mockReset().mockResolvedValue(upiAccount());
  navigation.goBack.mockReset();
  await act(async () => {
    await i18n.changeLanguage('en');
  });
});

describe('Payout account screen', () => {
  it('shows the saved UPI account and blocks saving without changes', async () => {
    await renderPage();
    expect(byId('payout-holder').props.value).toBe('Aarav Sharma');
    expect(byId('payout-upi').props.value).toBe('aarav@okaxis');
    expect(byId('payout-upi-action').props.children).toBe('Verified');
    expect(byId('payout-save').props.disabled).toBe(true);
    await save();
    expect(updateUpiAccount).not.toHaveBeenCalled();
  });

  it('renames without resending the UPI id, which would clear verification', async () => {
    await renderPage();
    await change('payout-holder', 'Aarav S Sharma ');
    await save();
    expect(updateUpiAccount).toHaveBeenCalledWith('acc-upi', {
      account_holder_name: 'Aarav S Sharma',
    });
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('sends a changed UPI id and drops the verified badge', async () => {
    await renderPage();
    await change('payout-upi', ' aarav@okhdfc ');
    expect(has('payout-upi-action')).toBe(false);
    await save();
    expect(updateUpiAccount).toHaveBeenCalledWith('acc-upi', {
      account_holder_name: 'Aarav Sharma',
      upi_id: 'aarav@okhdfc',
    });
  });

  it('adds a first UPI account', async () => {
    payoutAccounts.mockResolvedValue([]);
    await renderPage();
    expect(byId('payout-upi').props.value).toBe('');
    await change('payout-holder', 'Aarav');
    await change('payout-upi', 'aarav@okaxis');
    await save();
    expect(addUpiAccount).toHaveBeenCalledWith({
      upi_id: 'aarav@okaxis',
      account_holder_name: 'Aarav',
    });
  });

  it('uses the first UPI account when none is the default', async () => {
    payoutAccounts.mockResolvedValue([
      upiAccount({
        id: 'acc-2',
        is_default: false,
        upi_id: 'two@ok',
        is_verified: false,
      }),
    ]);
    await renderPage();
    expect(byId('payout-upi').props.value).toBe('two@ok');
    expect(has('payout-upi-action')).toBe(false);
  });

  it('validates the name and UPI id', async () => {
    await renderPage();
    await change('payout-holder', 'A');
    await change('payout-upi', 'not-a-upi');
    expect(byId('payout-holder-error').props.children).toBe(
      'Enter the account holder’s name.',
    );
    expect(byId('payout-upi-error').props.children).toBe(
      'Enter a valid UPI ID, like name@okaxis.',
    );
    expect(byId('payout-save').props.disabled).toBe(true);
  });

  it('keeps the form and shows the error when saving fails', async () => {
    let fail: (error: Error) => void = () => undefined;
    updateUpiAccount.mockReturnValueOnce(
      new Promise((_, reject) => (fail = reject)),
    );
    await renderPage();
    await change('payout-holder', 'Aarav Kumar');
    const startSave = () =>
      act(async () => {
        byId('payout-save').props.onPress();
      });
    await startSave();
    expect(text()).toContain('Saving...');
    await startSave();
    expect(updateUpiAccount).toHaveBeenCalledTimes(1);
    await act(async () => fail(new Error('Too many payout accounts')));
    expect(text()).toContain('Too many payout accounts');
    expect(navigation.goBack).not.toHaveBeenCalled();
  });

  it('offers a retry when loading fails', async () => {
    payoutAccounts.mockRejectedValueOnce(new Error('Server unavailable'));
    await renderPage();
    expect(text()).toContain('Server unavailable');
    await act(async () => byId('payout-retry').props.onPress());
    expect(byId('payout-upi').props.value).toBe('aarav@okaxis');
  });
});
