import { apiRequest } from '@/services/api/apiClient';

import { notificationsApi } from '../notificationsApi';

jest.mock('@/services/api/apiClient', () => ({ apiRequest: jest.fn() }));

const request = apiRequest as jest.Mock;

describe('notificationsApi', () => {
  beforeEach(() => request.mockReset().mockResolvedValue({}));

  it('lists and marks notifications read', async () => {
    await notificationsApi.list();
    await notificationsApi.markRead('n1');
    await notificationsApi.markAllRead();
    expect(request).toHaveBeenNthCalledWith(1, 'GET', '/notifications');
    expect(request).toHaveBeenNthCalledWith(
      2,
      'POST',
      '/notifications/n1/read',
    );
    expect(request).toHaveBeenNthCalledWith(
      3,
      'POST',
      '/notifications/read-all',
    );
  });
});
