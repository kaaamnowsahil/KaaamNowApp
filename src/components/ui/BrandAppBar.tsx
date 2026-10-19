import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BellIcon from '@/assets/figma/bell.svg';
import { BRAND } from '@/constants/brand';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import { BrandLogo } from './BrandLogo';

const APP_NAME = BRAND.NAME;
const NOTIFICATIONS = 'Notifications';

/** Figma "App bar" contents (1:1466): KaamNow logo, 22px bold wordmark, bell. */
export const BrandAppBar: FC<{ onBellPress?: () => void; hasUnread?: boolean }> = ({
  onBellPress,
  hasUnread,
}) => {
  const { colors } = useTheme();
  return (
    <>
      <BrandLogo size={30} />
      <Text style={[styles.name, { color: colors.text }]}>{APP_NAME}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={NOTIFICATIONS}
        disabled={!onBellPress}
        hitSlop={10}
        onPress={onBellPress}
        testID="app-bar-bell"
      >
        <BellIcon width={22} height={22} color={colors.text} />
        {hasUnread ? (
          <View
            style={[
              styles.dot,
              { backgroundColor: colors.danger, borderColor: colors.background },
            ]}
          />
        ) : null}
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create({
  name: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 30.8 },
  dot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
  },
});
