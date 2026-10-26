import type { FC } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import { ShiftFieldError } from './ShiftFieldError';

type ShiftFormFieldProps = TextInputProps & {
  label: string;
  prefix?: string;
  error?: string;
};

export const ShiftFormField: FC<ShiftFormFieldProps> = ({
  label,
  prefix,
  error,
  style,
  ...inputProps
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSubtle }]}>{label}</Text>
      <View
        style={[
          styles.inputBox,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        {prefix ? (
          <Text style={[styles.value, { color: colors.text }]}>{prefix}</Text>
        ) : null}
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={error}
          placeholderTextColor={colors.textSubtle}
          style={[styles.value, styles.input, { color: colors.text }, style]}
          {...inputProps}
        />
      </View>
      <ShiftFieldError message={error} />
    </View>
  );
};

const styles = StyleSheet.create({
  field: { flex: 1, gap: 6 },
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
  value: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  input: { flex: 1, paddingVertical: 10, paddingHorizontal: 0 },
});
