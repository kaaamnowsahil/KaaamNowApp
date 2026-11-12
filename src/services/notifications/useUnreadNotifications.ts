import { useEffect } from 'react';
import { AppState } from 'react-native';
import { create } from 'zustand';

import { useAuthStore } from '@/services/auth/useAuthStore';

import { notificationsApi } from './notificationsApi';

const UNREAD_POLL_MS = 60_000;

type UnreadState = {
  count: number;
  /** Re-reads the count from the server; a failed read keeps the last known count. */
  refresh: () => Promise<void>;
  setCount: (count: number) => void;
};

export const useUnreadNotifications = create<UnreadState>(set => ({
  count: 0,
  refresh: async () => {
    try {
      const { unread_count } = await notificationsApi.unreadCount();
      set({ count: unread_count });
    } catch {
      // The dot stays as it was when the count cannot be loaded.
    }
  },
  setCount: count => set({ count: Math.max(0, count) }),
}));

/** Keeps the bell dot current while the user is signed in. Mount once at the app root. */
export const useUnreadNotificationSync = () => {
  const isAuth = useAuthStore(s => s.isAuth);
  const hasHydrated = useAuthStore(s => s.hasHydrated);
  const refresh = useUnreadNotifications(s => s.refresh);
  const setCount = useUnreadNotifications(s => s.setCount);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuth) {
      setCount(0);
      return;
    }

    void refresh();
    let active = AppState.currentState === 'active';
    const timer = setInterval(() => {
      if (active) void refresh();
    }, UNREAD_POLL_MS);
    const subscription = AppState.addEventListener('change', state => {
      active = state === 'active';
      if (active) void refresh();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [hasHydrated, isAuth, refresh, setCount]);
};
