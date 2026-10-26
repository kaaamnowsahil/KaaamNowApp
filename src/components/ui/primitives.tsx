import { useState, type FC, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import ChevronLeft from '@/assets/figma/chevron-left.svg';
import ChevronRight from '@/assets/figma/chevron-right.svg';
import EyeOffIcon from '@/assets/icons/eye-off.svg';
import EyeIcon from '@/assets/icons/eye.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Figma "back-button" (1:131): 36px circle, outlined, 20px chevron.
 * `plain` drops the circle (12 · Withdraw).
 */
export const BackButton: FC<{
  onPress: () => void;
  label?: string;
}> = ({ onPress, label = 'Back' }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      testID="back-button"
      style={({ pressed }) => [
        styles.backButton,
        { borderColor: colors.outline },
        pressed && styles.dimmed,
      ]}
    >
      <ChevronLeft width={20} height={20} color={colors.text} />
    </Pressable>
  );
};

/** Figma "Screen introduction" (1:61): 25px bold title + 15px muted subtitle. */
export const ScreenIntro: FC<{ title?: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.intro}>
      {title ? (
        <Text
          accessibilityRole="header"
          style={[styles.introTitle, { color: colors.text }]}
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text style={[styles.introSubtitle, { color: colors.textMuted }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

/** Figma "Information row" (1:206): title + caption, chevron, bottom divider, min 66px. */
export const InfoRow: FC<{
  title: string;
  caption?: string;
  onPress?: () => void;
  selected?: boolean;
  testID?: string;
}> = ({ title, caption, onPress, selected, testID }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole={selected === undefined ? 'button' : 'radio'}
      accessibilityState={selected === undefined ? undefined : { selected }}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.infoRow,
        { borderBottomColor: colors.border },
        pressed && styles.dimmed,
      ]}
    >
      <View style={styles.infoText}>
        <View style={styles.infoTitleRow}>
          {selected === undefined ? null : (
            <View
              style={[
                styles.radio,
                {
                  borderColor: colors.text,
                  backgroundColor: selected ? colors.text : undefined,
                },
              ]}
            />
          )}
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            {title}
          </Text>
        </View>
        {caption ? (
          <Text style={[styles.infoCaption, { color: colors.textSubtle }]}>
            {caption}
          </Text>
        ) : null}
      </View>
      <ChevronRight width={18} height={18} color={colors.textSubtle} />
    </Pressable>
  );
};

/** Figma 13px muted paragraph used under forms (1:70, 1:144). */
export const BodyNote: FC<{ children: ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  return (
    <Text style={[styles.note, { color: colors.textMuted }]}>{children}</Text>
  );
};

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /** `danger` swaps primary purple for red, e.g. "Cancel shift". */
  tone?: 'default' | 'danger';
  testID?: string;
};

/** Figma "Primary action" (1:72): 52px, radius 12, filled primary. */
export const PrimaryButton: FC<ButtonProps> = ({
  label,
  onPress,
  disabled,
  tone = 'default',
  testID,
}) => {
  const { colors } = useTheme();
  const fill = tone === 'danger' ? colors.danger : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: fill, borderColor: fill },
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <Text style={[styles.buttonLabel, { color: colors.onPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );
};

/** Figma "Secondary action" (1:74): 52px, radius 12, filled outline (primary colour). */
export const SecondaryButton: FC<ButtonProps> = ({
  label,
  onPress,
  disabled,
  tone = 'default',
  testID,
}) => {
  const { colors } = useTheme();
  const isDanger = tone === 'danger';
  const accentColor = isDanger ? colors.danger : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: 'transparent',
          borderColor: accentColor,
        },
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          { color: accentColor },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

type TextFieldProps = TextInputProps & {
  label: string;
  helper?: string;
  /** Red message under the input; shown below the helper. */
  error?: string;
  /** Fixed, non-editable text before the input, e.g. "+91". */
  prefix?: string;
};

/** Figma "Form field" (1:65): label, 52px input, helper text. */
export const TextField: FC<TextFieldProps> = ({
  label,
  helper,
  error,
  prefix,
  style,
  secureTextEntry,
  ...inputProps
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isRevealed, setIsRevealed] = useState(false);
  const EyeToggleIcon = isRevealed ? EyeOffIcon : EyeIcon;
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
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
          <Text
            style={[styles.inputText, styles.prefix, { color: colors.text }]}
          >
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
          secureTextEntry={secureTextEntry && !isRevealed}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(
              isRevealed ? 'auth.hidePassword' : 'auth.showPassword',
            )}
            hitSlop={10}
            onPress={() => setIsRevealed(revealed => !revealed)}
            style={styles.eyeToggle}
            testID={inputProps.testID ? `${inputProps.testID}-toggle` : undefined}
          >
            <EyeToggleIcon width={20} height={20} color={colors.textSubtle} />
          </Pressable>
        ) : null}
      </View>
      {helper ? (
        <Text style={[styles.helper, { color: colors.textSubtle }]}>
          {helper}
        </Text>
      ) : null}
      {error ? (
        <Text style={[styles.fieldError, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intro: { gap: 8 },
  introTitle: { fontFamily: FONTS.bold, fontSize: 25, lineHeight: 35 },
  introSubtitle: { fontFamily: FONTS.regular, fontSize: 15, lineHeight: 23 },
  note: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 21 },
  infoRow: {
    minHeight: 66,
    paddingVertical: 12,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  infoText: { flex: 1 },
  infoTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  // Fixed-size circle replaces Figma's "○" glyph so selection never shifts the text.
  radio: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: { fontFamily: FONTS.regular, fontSize: 15, lineHeight: 23 },
  infoCaption: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  button: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonLabel: { fontFamily: FONTS.semiBold, fontSize: 15 },
  dimmed: { opacity: 0.7 },
  field: { width: '100%', gap: 7 },
  fieldLabel: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  inputBox: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: { fontFamily: FONTS.regular, fontSize: 15 },
  prefix: { marginRight: 6 },
  eyeToggle: { marginLeft: 8, padding: 2 },
  input: { flex: 1, paddingVertical: 13, paddingHorizontal: 0 },
  helper: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 17 },
  fieldError: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
});
