import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import type { Option } from '@/types';

/** Figma "Categories" (1:1495): text-only role filters, active one in primary. */
export const CategoryTabs: FC<{
  options: Option[];
  value: string;
  onChange: (id: string) => void;
}> = ({ options, value, onChange }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.root}>
      {options.map(option => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            hitSlop={6}
            onPress={() => onChange(option.id)}
            testID={`category-${option.id}`}
          >
            <Text
              style={[
                styles.label,
                { color: active ? colors.primary : colors.textSubtle },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flexDirection: 'row', gap: 7 },
  label: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 16.5 },
});
