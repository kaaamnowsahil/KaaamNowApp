import { apiRequest } from '@/services/api/apiClient';

import { earningsApi } from '../earningsApi';

jest.mock('@/services/api/apiClient', () => ({ apiRequest: jest.fn() }));

const request = apiRequest as jest.Mock;

describe('earningsApi', () => {
  beforeEach(() => request.mockReset().mockResolvedValue({}));

  it('reads the wallet', async () => {
    await earningsApi.summary();
    await earningsApi.entries();
    expect(request).toHaveBeenNthCalledWith(1, 'GET', '/worker/earnings');
    expect(request).toHaveBeenNthCalledWith(
      2,
      'GET',
      '/worker/earnings/entries',
    );
  });

  it('lists, adds and edits UPI payout accounts', async () => {
    await earningsApi.payoutAccounts();
    await earningsApi.addUpiAccount({
      upi_id: 'a@ok',
      account_holder_name: 'Aarav',
    });
    await earningsApi.updateUpiAccount('acc-1', {
      account_holder_name: 'Aarav S',
    });
    expect(request).toHaveBeenNthCalledWith(
      1,
      'GET',
      '/worker/payout-accounts',
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      'POST',
      '/worker/payout-accounts',
      {
        body: {
          account_type: 'upi',
          make_default: true,
          upi_id: 'a@ok',
          account_holder_name: 'Aarav',
        },
      },
    );
    expect(request).toHaveBeenNthCalledWith(
      3,
      'PATCH',
      '/worker/payout-accounts/acc-1',
      { body: { account_holder_name: 'Aarav S', make_default: true } },
    );
  });

  it('creates and reads withdrawals', async () => {
    const body = {
      payout_account_id: 'acc-1',
      amount_minor: 50000,
      idempotency_key: 'wd_abc12345',
    };
    await earningsApi.createWithdrawal(body);
    await earningsApi.withdrawal('w-1');
    expect(request).toHaveBeenNthCalledWith(1, 'POST', '/worker/withdrawals', {
      body,
    });
    expect(request).toHaveBeenNthCalledWith(
      2,
      'GET',
      '/worker/withdrawals/w-1',
    );
  });
});
