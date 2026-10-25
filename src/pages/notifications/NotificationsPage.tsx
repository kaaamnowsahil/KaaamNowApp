import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BodyNote } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import type { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { NOTIFICATIONS_STRINGS } from './constants';
import { NOTIFICATIONS } from './mock';

/** App-bar bell. Tap a row to mark it read. Data: mock/notificationsMock.ts */
export const NotificationsPage: FC<
  AppScreenProps<typeof ROUTES.notifications>
> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isLoading = useMockLoading();
  const [items, setItems] = useState(NOTIFICATIONS);
  const hasUnread = items.some(n => n.isUnread);

  const markRead = (id?: string) =>
    setItems(prev =>
      prev.map(n => (id === undefined || n.id === id ? { ...n, isUnread: false } : n)),
    );

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('notifications.title')}
      gap={0}
      headerRight={
        hasUnread ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => markRead()}
            testID="notifications-mark-all"
          >
            <Text style={[styles.action, { color: colors.primary }]}>
              {NOTIFICATIONS_STRINGS.MARK_ALL}
            </Text>
          </Pressable>
        ) : null
      }
      isLoading={isLoading}
      testID="notifications-page"
    >
      {items.length ? (
        items.map(n => (
          <Pressable
            key={n.id}
            accessibilityRole="button"
            accessibilityState={{ selected: n.isUnread }}
            onPress={() => markRead(n.id)}
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
                n.isUnread && { backgroundColor: colors.primary },
              ]}
            />
            <View style={styles.text}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.title,
                    n.isUnread && styles.unread,
                    { color: colors.text },
                  ]}
                >
                  {n.title}
                </Text>
                <Text style={[styles.time, { color: colors.textSubtle }]}>
                  {n.timeLabel}
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
  action: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 18 },
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
