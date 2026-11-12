import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BellIcon from '@/assets/figma/bell.svg';
import { BRAND } from '@/constants/brand';
import { FONTS } from '@/constants/fonts';
import { useUnreadNotifications } from '@/services/notifications/useUnreadNotifications';
import { useTheme } from '@/theme/ThemeProvider';

import { BrandLogo } from './BrandLogo';

const APP_NAME = BRAND.NAME;

/** App bar contents: KaaamNow logo, 22px bold wordmark, outlined bell on the right. */
export const BrandAppBar: FC<{ onBellPress?: () => void; hasUnread?: boolean }> = ({
  onBellPress,
  hasUnread,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const unreadCount = useUnreadNotifications(s => s.count);
  const showDot = hasUnread ?? unreadCount > 0;
  const bellLabel =
    unreadCount > 0
      ? `${t('notifications.title')} (${unreadCount})`
      : t('notifications.title');
  return (
    <>
      <BrandLogo size={30} />
      <Text style={[styles.name, { color: colors.text }]}>{APP_NAME}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={bellLabel}
        disabled={!onBellPress}
        hitSlop={10}
        onPress={onBellPress}
        style={({ pressed }) => [
          styles.bell,
          { borderColor: colors.outline },
          pressed && styles.pressed,
        ]}
        testID="app-bar-bell"
      >
        <BellIcon width={20} height={20} color={colors.text} />
        {showDot ? (
          <View
            style={[
              styles.dot,
              { backgroundColor: colors.danger, borderColor: colors.background },
            ]}
            testID="app-bar-bell-dot"
          />
        ) : null}
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create({
  name: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 30.8 },
  bell: {
    width: 44,
    height: 44,
    marginLeft: 'auto',
    borderWidth: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  dot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
  },
});
