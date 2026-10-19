import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import type { Option } from '@/constants/options';
import { useTheme } from '@/theme/ThemeProvider';

type ChipGroupProps = {
  label: string;
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
  hint?: string;
};

/** Figma "Work type" chips (17:200): 12px label, wrapping pills, primary when selected. */
export const ChipGroup: FC<ChipGroupProps> = ({
  label,
  options,
  selected,
  onToggle,
  hint,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View style={styles.wrap}>
        {options.map(option => {
          const isOn = selected.includes(option.id);
          return (
            <Pressable
              key={option.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isOn }}
              onPress={() => onToggle(option.id)}
              testID={`chip-${option.id}`}
              style={[
                styles.chip,
                isOn
                  ? {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    }
                  : {
                      backgroundColor: colors.fill,
                      borderColor: colors.border,
                    },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isOn ? colors.onPrimary : colors.textMuted },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {hint ? (
        <Text style={[styles.hint, { color: colors.textSubtle }]}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  group: { width: '100%', gap: 8 },
  label: { fontFamily: FONTS.semiBold, fontSize: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontFamily: FONTS.semiBold, fontSize: 13 },
  hint: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
});
