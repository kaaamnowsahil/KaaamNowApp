import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';

import ChevronDownIcon from '@/assets/figma/chevron-down.svg';
import MapPinIcon from '@/assets/figma/map-pin-home.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import { WORKER_HOME_STRINGS } from '../constants';

/** Current-location row; tapping it fetches the device location again (same as web). */
export const LocationButton: FC<{
  label: string;
  isLoading: boolean;
  error: string;
  onPress: () => void;
}> = ({ label, isLoading, error, onPress }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${WORKER_HOME_STRINGS.CHANGE_LOCATION}: ${label}`}
      accessibilityState={{ busy: isLoading }}
      disabled={isLoading}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
      testID="home-location"
    >
      <MapPinIcon width={18} height={18} color={colors.primary} />
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.text, { color: error ? colors.danger : colors.textMuted }]}
      >
        {error || (isLoading ? t('common.loading') : label)}
      </Text>
      <ChevronDownIcon width={16} height={16} color={colors.textMuted} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pressed: { opacity: 0.7 },
  text: { flex: 1, fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18.2 },
});
