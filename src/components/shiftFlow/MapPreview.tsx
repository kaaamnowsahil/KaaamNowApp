import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import MapPinIcon from '@/assets/figma/map-pin.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const ROUTE_PATH = 'M38 162 C 80 150, 95 112, 140 100 S 200 72, 240 38';

/**
 * Illustrated map from Live shift (10): street grid with either a travel route
 * (Head to …) or a centred pin with a place label (Check in, Active shift).
 */
export const MapPreview: FC<{
  variant: 'route' | 'pin';
  label?: string;
  height?: number;
}> = ({ variant, label, height = 170 }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.map,
        { height, backgroundColor: colors.fill, borderColor: colors.border },
      ]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 270 180" preserveAspectRatio="none">
        {variant === 'route' ? (
          <>
            <Line x1="72" y1="0" x2="72" y2="180" stroke={colors.border} strokeWidth={6} />
            <Line x1="180" y1="0" x2="180" y2="180" stroke={colors.border} strokeWidth={6} />
            <Line x1="0" y1="55" x2="270" y2="55" stroke={colors.border} strokeWidth={6} />
            <Line x1="0" y1="112" x2="270" y2="112" stroke={colors.border} strokeWidth={6} />
            <Path d={ROUTE_PATH} stroke={colors.primary} strokeWidth={3} fill="none" strokeLinecap="round" />
            <Circle cx="38" cy="162" r="5" fill={colors.success} />
            <Circle cx="240" cy="38" r="7" fill={colors.primary} />
          </>
        ) : (
          <>
            <Line x1="0" y1="62" x2="270" y2="10" stroke={colors.border} strokeWidth={14} />
            <Line x1="125" y1="0" x2="95" y2="180" stroke={colors.border} strokeWidth={10} />
          </>
        )}
      </Svg>
      {variant === 'pin' ? (
        <View style={styles.pinWrap}>
          <View style={[styles.pin, { backgroundColor: colors.primary }]}>
            <MapPinIcon width={16} height={16} color={colors.onPrimary} />
          </View>
          {label ? (
            <Text style={[styles.label, { color: colors.text, backgroundColor: colors.surface }]}>
              {label}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  map: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  pinWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    lineHeight: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
