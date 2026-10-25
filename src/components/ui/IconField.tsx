import type { FC } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

type IconFieldProps = TextInputProps & {
  label: string;
  icon: FC<SvgProps>;
  /** Fixed, non-editable text before the input, e.g. "+91". */
  prefix?: string;
  /** Trailing text action, e.g. "Change" (primary) or "Verified" (success). */
  action?: {
    label: string;
    onPress?: () => void;
    tone?: 'primary' | 'success';
  };
  error?: string;
};

/** Figma Edit profile field (17:177): 12px label, 52px filled box, 18px icon, trailing action. */
export const IconField: FC<IconFieldProps> = ({
  label,
  icon: Icon,
  prefix,
  action,
  error,
  style,
  ...inputProps
}) => {
  const { colors } = useTheme();
  const actionColor =
    action?.tone === 'success' ? colors.success : colors.primary;

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View
        style={[
          styles.box,
          {
            backgroundColor: colors.fill,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        <Icon width={18} height={18} color={colors.textSubtle} />
        {prefix ? (
          <Text style={[styles.inputText, { color: colors.text }]}>
            {prefix}
          </Text>
        ) : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textSubtle}
          style={[
            styles.inputText,
            styles.input,
            { color: colors.text },
            style,
          ]}
          {...inputProps}
        />
        {action ? (
          <Pressable
            accessibilityRole="button"
            disabled={!action.onPress}
            hitSlop={8}
            onPress={action.onPress}
          >
            <Text style={[styles.action, { color: actionColor }]}>
              {action.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  field: { width: '100%', gap: 7 },
  label: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  box: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: { fontFamily: FONTS.regular, fontSize: 15 },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: 0 },
  action: { fontFamily: FONTS.semiBold, fontSize: 12 },
  error: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
});
