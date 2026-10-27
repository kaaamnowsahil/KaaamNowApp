import { useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';

import ChevronDownIcon from '@/assets/figma/chevron-down.svg';
import MapPinIcon from '@/assets/figma/map-pin.svg';
import { FONTS } from '@/constants/fonts';
import { useCurrentAddress } from '@/shared/hooks/useCurrentAddress';
import { useTheme } from '@/theme/ThemeProvider';

/** Current device address; tap to look it up again. */
export const BusinessLocation: FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [address, setAddress] = useState('');
  const { locate, isLocating, locateError } = useCurrentAddress(picked =>
    setAddress(picked.address),
  );

  useEffect(() => {
    locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = locateError || (isLocating ? t('common.loading') : address);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('businessDashboard.changeLocation', { location: label })}
      accessibilityState={{ busy: isLocating, disabled: isLocating }}
      disabled={isLocating}
      onPress={locate}
      style={styles.root}
      testID="business-device-location"
    >
      <MapPinIcon width={22} height={22} color={colors.primary} />
      <Text
        numberOfLines={2}
        style={[
          styles.label,
          { color: locateError ? colors.danger : colors.textMuted },
        ]}
      >
        {label}
      </Text>
      <ChevronDownIcon width={20} height={20} color={colors.textMuted} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  label: { flex: 1, fontFamily: FONTS.regular, fontSize: 14, lineHeight: 20 },
});
