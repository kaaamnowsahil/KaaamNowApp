import { apiRequest } from '@/services/api/apiClient';

export type AppNotification = {
  id: string;
  kind: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read_at?: string | null;
  created_at: string;
};

export type NotificationPage = {
  items: AppNotification[];
  unread_count: number;
  limit: number;
  offset: number;
};

type UnreadCount = { unread_count: number };

export const notificationsApi = {
  list: () => apiRequest<NotificationPage>('GET', '/notifications'),
  markRead: (notificationId: string) =>
    apiRequest<UnreadCount>('POST', `/notifications/${notificationId}/read`),
  markAllRead: () => apiRequest<UnreadCount>('POST', '/notifications/read-all'),
};
