import TestRenderer, { act, type ReactTestRenderer } from 'react-test-renderer';

import { ROUTES } from '@/constants/routes';
import { i18n } from '@/services/i18n';
import {
  notificationsApi,
  type AppNotification,
} from '@/services/notifications/notificationsApi';

import { NotificationsPage } from '../NotificationsPage';

jest.mock('@react-navigation/native', () => ({ useFocusEffect: jest.fn() }));
jest.mock('@/services/notifications/notificationsApi', () => ({
  notificationsApi: {
    list: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  },
}));

jest.mock('@/layout/FormScreen', () => {
  const { View } = require('react-native');
  return {
    FormScreen: ({ children, headerRight, isLoading }: Record<string, any>) => (
      <View testID={isLoading ? 'loading' : 'screen'}>
        {headerRight}
        {isLoading ? null : children}
      </View>
    ),
  };
});

jest.mock('@/components/ui', () => {
  const { Text } = require('react-native');
  return {
    BodyNote: ({ children }: Record<string, any>) => <Text>{children}</Text>,
  };
});

const list = jest.mocked(notificationsApi.list);
const markRead = jest.mocked(notificationsApi.markRead);
const markAllRead = jest.mocked(notificationsApi.markAllRead);

const notification = (
  over: Partial<AppNotification> = {},
): AppNotification => ({
  id: 'n1',
  kind: 'shift_confirmed',
  title: 'Shift confirmed',
  body: 'Truffles confirmed your shift.',
  data: {},
  read_at: null,
  created_at: '2026-10-20T12:30:00Z',
  ...over,
});

const page = (items: AppNotification[]) => ({
  items,
  unread_count: items.filter(n => !n.read_at).length,
  limit: 50,
  offset: 0,
});

let tree: ReactTestRenderer;
const byId = (id: string) => tree.root.findByProps({ testID: id });
const has = (id: string) => tree.root.findAllByProps({ testID: id }).length > 0;
const text = () => JSON.stringify(tree.toJSON());
const press = (id: string) => act(async () => byId(id).props.onPress());

async function renderPage() {
  await act(async () => {
    tree = TestRenderer.create(
      <NotificationsPage
        navigation={{ goBack: jest.fn() } as never}
        route={{ key: 'n', name: ROUTES.notifications } as never}
      />,
    );
  });
}

beforeEach(async () => {
  list
    .mockReset()
    .mockResolvedValue(
      page([
        notification(),
        notification({
          id: 'n2',
          title: 'Payment sent',
          read_at: '2026-10-21T00:00:00Z',
        }),
      ]),
    );
  markRead.mockReset().mockResolvedValue({ unread_count: 0 });
  markAllRead.mockReset().mockResolvedValue({ unread_count: 0 });
  await act(async () => {
    await i18n.changeLanguage('en');
  });
});

describe('Notifications screen', () => {
  it('lists the server notifications and their read state', async () => {
    await renderPage();
    expect(text()).toContain('Shift confirmed');
    expect(text()).toContain('Payment sent');
    expect(text()).not.toContain('Third Wave Coffee');
    expect(byId('notification-n1').props.accessibilityState).toEqual({
      selected: true,
    });
    expect(byId('notification-n2').props.accessibilityState).toEqual({
      selected: false,
    });
    const row = byId('notification-n1');
    expect(row.props.style({ pressed: true })).toHaveLength(3);
  });

  it('marks one notification read on the server', async () => {
    await renderPage();
    await press('notification-n1');
    expect(markRead).toHaveBeenCalledWith('n1');
    expect(byId('notification-n1').props.accessibilityState).toEqual({
      selected: false,
    });
    expect(has('notifications-mark-all')).toBe(false);
  });

  it('does not resend reads for read notifications', async () => {
    await renderPage();
    await press('notification-n2');
    expect(markRead).not.toHaveBeenCalled();
  });

  it('marks everything read', async () => {
    await renderPage();
    await press('notifications-mark-all');
    expect(markAllRead).toHaveBeenCalled();
    expect(has('notifications-mark-all')).toBe(false);
  });

  it('reloads the truth when marking read fails', async () => {
    markRead.mockRejectedValueOnce(new Error('offline'));
    await renderPage();
    await press('notification-n1');
    expect(list).toHaveBeenCalledTimes(2);
    expect(byId('notification-n1').props.accessibilityState).toEqual({
      selected: true,
    });
  });

  it('says when there is nothing to show', async () => {
    list.mockResolvedValue(page([]));
    await renderPage();
    expect(text()).toContain('No notifications yet.');
  });

  it('shows a load error', async () => {
    list.mockRejectedValue(new Error('Server unavailable'));
    await renderPage();
    expect(text()).toContain('Server unavailable');
    expect(has('notifications-mark-all')).toBe(false);
  });

  it('shows the loader until the list arrives', async () => {
    list.mockReturnValue(new Promise(() => undefined));
    await renderPage();
    expect(has('loading')).toBe(true);
  });
});
