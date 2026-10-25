import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import type { Option } from '@/types';
import { useTheme } from '@/theme/ThemeProvider';

type ChipGroupProps = {
  label: string;
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
  hint?: string;
  error?: string;
  /** Shows only this many chips (plus selected ones) until "View more" is pressed. */
  collapsedCount?: number;
};

/** Figma "Work type" chips (17:200): label, wrapping pills, primary when selected. */
export const ChipGroup: FC<ChipGroupProps> = ({
  label,
  options,
  selected,
  onToggle,
  hint,
  error,
  collapsedCount,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const canCollapse =
    collapsedCount !== undefined && options.length > collapsedCount;
  const visibleOptions =
    canCollapse && !isExpanded
      ? options.filter(
          (option, index) =>
            index < collapsedCount || selected.includes(option.id),
        )
      : options;

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      {hint ? (
        <Text style={[styles.hint, { color: colors.textSubtle }]}>{hint}</Text>
      ) : null}
      <View style={styles.wrap}>
        {visibleOptions.map(option => {
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
                      borderColor: error ? colors.danger : colors.border,
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
      {canCollapse ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => setIsExpanded(expanded => !expanded)}
          style={styles.more}
          testID="chip-group-toggle"
        >
          <Text style={[styles.moreText, { color: colors.primary }]}>
            {isExpanded
              ? t('common.viewLess')
              : t('common.viewMore', { count: options.length - visibleOptions.length })}
          </Text>
        </Pressable>
      ) : null}
      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  group: { width: '100%', gap: 8 },
  label: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontFamily: FONTS.semiBold, fontSize: 13 },
  hint: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
  more: { alignSelf: 'flex-start', paddingVertical: 2 },
  moreText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  error: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
});
