import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import type { Option } from '@/types';

/** Inline single-select menu card; opens in the content flow so nothing overlaps it. */
export const OptionMenu: FC<{
  hint: string;
  options: Option[];
  value: string;
  onSelect: (id: string) => void;
  testID?: string;
}> = ({ hint, options, value, onSelect, testID }) => {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="menu"
      style={[
        styles.menu,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      testID={testID}
    >
      <Text style={[styles.hint, { color: colors.textSubtle }]}>{hint}</Text>
      {options.map((option, i) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="menuitem"
            accessibilityState={{ selected }}
            onPress={() => onSelect(option.id)}
            style={({ pressed }) => [
              styles.item,
              i > 0 && { borderTopColor: colors.border, borderTopWidth: 1 },
              pressed && { backgroundColor: colors.fill },
            ]}
            testID={testID ? `${testID}-${option.id}` : undefined}
          >
            <Text
              style={[
                styles.itemText,
                selected && styles.itemSelected,
                { color: selected ? colors.primary : colors.text },
              ]}
            >
              {option.label}
            </Text>
            {selected ? (
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  menu: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  hint: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    lineHeight: 16.5,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  item: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 19.6,
  },
  itemSelected: { fontFamily: FONTS.semiBold },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
