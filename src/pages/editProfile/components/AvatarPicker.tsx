import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import CameraIcon from '@/assets/icons/camera.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

type AvatarPickerProps = {
  initials: string;
  actionLabel: string;
  accessibilityLabel: string;
  onPress: () => void;
};

/** Figma Edit profile avatar: 96px initials disc, 28px camera badge, "Change photo". */
export const AvatarPicker: FC<AvatarPickerProps> = ({
  initials,
  actionLabel,
  accessibilityLabel,
  onPress,
}) => {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.wrap}
      testID="edit-avatar"
    >
      <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
        <Text style={[styles.initials, { color: colors.primary }]}>
          {initials}
        </Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.primary, borderColor: colors.background },
          ]}
        >
          <CameraIcon width={14} height={14} color={colors.onPrimary} />
        </View>
      </View>
      <Text style={[styles.action, { color: colors.primary }]}>
        {actionLabel}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center', alignItems: 'center', gap: 10 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontFamily: FONTS.bold, fontSize: 28, lineHeight: 34 },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
});
