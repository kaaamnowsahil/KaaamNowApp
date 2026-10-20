import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

export const LiveSearchRadius: FC<{
  innerRadius: number;
  outerRadius: number;
}> = ({ innerRadius, outerRadius }) => {
  const { colors } = useTheme();

  return (
    <View
      accessibilityLabel={`${innerRadius} kilometer first search radius, expanding to ${outerRadius} kilometers`}
      style={[styles.container, { backgroundColor: colors.fill }]}
      testID="business-live-search-radius"
    >
      <Svg width="100%" height="100%" viewBox="0 0 320 170">
        <Circle
          cx="160"
          cy="84"
          r="44"
          fill={colors.primarySoft}
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeDasharray="3 4"
        />
        <Circle
          cx="160"
          cy="84"
          r="73"
          fill="none"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeDasharray="3 4"
        />
        <SvgText
          x="173"
          y="48"
          fill={colors.primary}
          fontSize="9"
          textAnchor="middle"
        >
          {innerRadius} km
        </SvgText>
        <SvgText
          x="176"
          y="157"
          fill={colors.primary}
          fontSize="9"
          textAnchor="middle"
        >
          {outerRadius} km
        </SvgText>
        <Circle cx="103" cy="59" r="2.7" fill={colors.success} />
        <Circle cx="134" cy="67" r="2.7" fill={colors.success} />
        <Circle cx="178" cy="55" r="2.7" fill={colors.success} />
        <Circle cx="210" cy="76" r="2.7" fill={colors.success} />
        <Circle cx="190" cy="109" r="2.7" fill={colors.success} />
        <Circle cx="168" cy="136" r="2.7" fill={colors.success} />
        <Circle cx="116" cy="105" r="2.7" fill={colors.success} />
        <Circle
          cx="160"
          cy="84"
          r="7"
          fill={colors.primary}
          stroke={colors.onPrimary}
          strokeWidth="2"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 166, borderRadius: 16, overflow: 'hidden' },
});
