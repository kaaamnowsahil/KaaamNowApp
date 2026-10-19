import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

type Segment<T extends string> = { id: T; label: string };

/** Figma "Segmented control" (1:1490). */
export const SegmentedControl = <T extends string>({
  segments,
  value,
  onChange,
}: {
  segments: Segment<T>[];
  value: T;
  onChange: (id: T) => void;
}) => {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.root,
        { backgroundColor: colors.fill, borderColor: colors.border },
      ]}
    >
      {segments.map(segment => {
        const active = segment.id === value;
        return (
          <Pressable
            key={segment.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(segment.id)}
            style={[
              styles.segment,
              { backgroundColor: active ? colors.primary : colors.fill },
            ]}
            testID={`segment-${segment.id}`}
          >
            <Text
              style={[
                styles.label,
                { color: active ? colors.onPrimary : colors.textMuted },
              ]}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderWidth: 1,
    borderRadius: 12,
  },
  segment: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18.2 },
});
