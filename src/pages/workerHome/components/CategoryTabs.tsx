import type { FC } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import type { Option } from '@/types';

/** Figma "Categories" (1:1495): horizontally scrolling role filter pills, active one in primary. */
export const CategoryTabs: FC<{
  options: Option[];
  value: string;
  onChange: (id: string) => void;
}> = ({ options, value, onChange }) => {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.root}
      style={styles.scroll}
    >
      {options.map(option => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.id)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primary : colors.fill,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
            testID={`category-${option.id}`}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                { color: active ? colors.onPrimary : colors.textMuted },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -20, flexGrow: 0 },
  root: { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  chip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 16 },
});
