import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RadioCheck } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import type { PricingMode } from '@/services/liveWork/liveWorkTypes';
import { useTheme } from '@/theme/ThemeProvider';

const MODES: PricingMode[] = ['hourly', 'task'];

/** Hourly (rate × time) or Task (one fixed price, finished with the completion code). */
export const PricingModeRadio: FC<{
  value: PricingMode;
  onChange: (mode: PricingMode) => void;
  disabled?: boolean;
  testID?: string;
}> = ({ value, onChange, disabled, testID = 'pricing-mode' }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={styles.field} accessibilityRole="radiogroup">
      <Text style={[styles.label, { color: colors.textMuted }]}>
        {t('taskPricing.modeLabel')}
      </Text>
      <View style={styles.row}>
        {MODES.map(mode => {
          const selected = value === mode;
          const title = t(`taskPricing.${mode}Title`);
          const hint = t(`taskPricing.${mode}Hint`);
          return (
            <Pressable
              key={mode}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={`${title}, ${hint}`}
              disabled={disabled}
              onPress={() => onChange(mode)}
              testID={`${testID}-${mode}`}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: selected
                    ? colors.primarySoft
                    : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.optionHead}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {title}
                </Text>
                <RadioCheck selected={selected} />
              </View>
              <Text style={[styles.hint, { color: colors.textSubtle }]}>
                {hint}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontFamily: FONTS.medium, fontSize: 13, lineHeight: 19 },
  row: { flexDirection: 'row', gap: 10 },
  option: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, gap: 4 },
  optionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pressed: { opacity: 0.7 },
  title: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 21 },
  hint: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
});
