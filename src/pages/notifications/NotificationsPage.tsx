import { useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BodyNote } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import type { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { TAB_HOMES } from '@/route/tabRoutes';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { notificationsApi } from '@/services/notifications/notificationsApi';
import { openNotificationTarget } from '@/services/notifications/openNotificationTarget';
import { useUnreadNotifications } from '@/services/notifications/useUnreadNotifications';
import { formatDateTime } from '@/services/shifts/shiftMappers';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

/**
 * App-bar bell. Tap a row to mark it read and open the related page.
 * - data: GET /notifications; POST /notifications/{id}/read
 */
export const NotificationsPage: FC<
  AppScreenProps<typeof ROUTES.notifications>
> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const role = useAuthStore(state => state.role);
  const query = useApiQuery(() => notificationsApi.list(), []);
  const items = query.data?.items ?? [];
  const setUnreadCount = useUnreadNotifications(s => s.setCount);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (query.data) setUnreadCount(query.data.unread_count);
  }, [query.data, setUnreadCount]);

  const markRead = (id: string) => {
    const page = query.data;
    if (!page || !items.some(n => !n.read_at && n.id === id)) return;
    const now = new Date().toISOString();
    const nextItems = page.items.map(n =>
      n.id === id ? { ...n, read_at: n.read_at ?? now } : n,
    );
    const unreadCount = nextItems.filter(n => !n.read_at).length;
    setUnreadCount(unreadCount);
    query.setData({ ...page, items: nextItems, unread_count: unreadCount });
    setMarking(true);
    notificationsApi
      .markRead(id)
      .then(result => setUnreadCount(result.unread_count))
      .catch(query.reload)
      .finally(() => setMarking(false));
  };

  const closeInbox = () => {
    if ((navigation.getState()?.index ?? 0) > 0) {
      navigation.goBack();
      return;
    }
    const parent = navigation.getParent();
    const parentState = parent?.getState();
    const tab = parentState?.routes[parentState.index ?? 0]?.name;
    const home = tab && tab in TAB_HOMES ? TAB_HOMES[tab as keyof typeof TAB_HOMES] : undefined;
    if (home) {
      navigation.reset({ index: 0, routes: [{ name: home }] });
      return;
    }
    navigation.goBack();
  };

  return (
    <FormScreen
      onBack={closeInbox}
      title={t('notifications.title')}
      gap={0}
      isLoading={query.isLoading}
      busy={marking || query.isRefreshing}
      testID="notifications-page"
    >
      {query.error && !query.data ? (
        <BodyNote>{query.error}</BodyNote>
      ) : items.length ? (
        items.map((n, index) => (
          <Pressable
            key={`${n.id}-${index}`}
            accessibilityRole="button"
            accessibilityState={{ selected: !n.read_at }}
            onPress={() => {
              markRead(n.id);
              openNotificationTarget(
                { kind: n.kind, ...(n.data ?? {}) },
                role,
                { fromInbox: true },
              ).catch(() => undefined);
            }}
            style={({ pressed }) => [
              styles.row,
              { borderBottomColor: colors.border },
              pressed && { backgroundColor: colors.fill },
            ]}
            testID={`notification-${n.id}`}
          >
            <View
              style={[
                styles.dot,
                !n.read_at && { backgroundColor: colors.primary },
              ]}
            />
            <View style={styles.text}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.title,
                    !n.read_at && styles.unread,
                    { color: colors.text },
                  ]}
                >
                  {n.title}
                </Text>
                <Text style={[styles.time, { color: colors.textSubtle }]}>
                  {formatDateTime(n.created_at)}
                </Text>
              </View>
              <Text style={[styles.body, { color: colors.textMuted }]}>
                {n.body}
              </Text>
            </View>
          </Pressable>
        ))
      ) : (
        <BodyNote>{t('notifications.empty')}</BodyNote>
      )}
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  text: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontFamily: FONTS.medium, fontSize: 15, lineHeight: 22 },
  unread: { fontFamily: FONTS.semiBold },
  time: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 17 },
  body: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 20 },
});
