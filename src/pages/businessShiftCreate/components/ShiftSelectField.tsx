import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ChevronDown from '@/assets/figma/chevron-down.svg';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import { ShiftFieldError } from './ShiftFieldError';

type ShiftSelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
  error?: string;
  testID?: string;
};

/** Input-styled dropdown; options open in a bottom sheet (web uses a native select). */
export const ShiftSelectField: FC<ShiftSelectFieldProps> = ({
  label,
  value,
  placeholder,
  options,
  onChange,
  error,
  testID,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(option => option.id === value);

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSubtle }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: selected?.label ?? placeholder }}
        onPress={() => setIsOpen(true)}
        style={[
          styles.inputBox,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
        testID={testID}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.value,
            { color: selected ? colors.text : colors.textSubtle },
          ]}
        >
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown width={16} height={16} color={colors.textMuted} />
      </Pressable>
      <ShiftFieldError message={error} />
      {isOpen ? (
        <BottomSheet
          title={label}
          closeLabel={t('common.close')}
          onClose={() => setIsOpen(false)}
          testID={testID ? `${testID}-sheet` : undefined}
        >
          <ScrollView style={styles.list}>
            {options.map(option => {
              const isSelected = option.id === value;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  style={[styles.option, { borderBottomColor: colors.border }]}
                  testID={testID ? `${testID}-${option.id}` : undefined}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: isSelected ? colors.primary : colors.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected ? (
                    <Text style={[styles.optionLabel, { color: colors.primary }]}>
                      ✓
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </BottomSheet>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
  inputBox: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: { flex: 1, fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  list: { maxHeight: 420 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionLabel: { fontFamily: FONTS.semiBold, fontSize: 15 },
});
