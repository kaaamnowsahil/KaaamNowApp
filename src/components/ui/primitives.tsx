import type { FC, ReactNode } from 'react';
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
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/** Figma "back-button" (1:131): 36px circle, outlined, 20px chevron. */
export const BackButton: FC<{ onPress: () => void; label?: string }> = ({
  onPress,
  label = 'Back',
}) => {
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
export const ScreenIntro: FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.intro}>
      <Text
        accessibilityRole="header"
        style={[styles.introTitle, { color: colors.text }]}
      >
        {title}
      </Text>
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
                { borderColor: selected ? colors.primary : colors.text },
              ]}
            >
              {selected ? (
                <View
                  style={[styles.radioDot, { backgroundColor: colors.primary }]}
                />
              ) : null}
            </View>
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

/** Figma "Secondary action" (1:74): 52px, radius 12, outlined. */
export const SecondaryButton: FC<ButtonProps> = ({
  label,
  onPress,
  disabled,
  tone = 'default',
  testID,
}) => {
  const { colors } = useTheme();
  const isDanger = tone === 'danger';
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
          backgroundColor: colors.background,
          borderColor: isDanger ? colors.danger : colors.border,
        },
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          { color: isDanger ? colors.danger : colors.text },
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
  /** Fixed, non-editable text before the input, e.g. "+91". */
  prefix?: string;
};

/** Figma "Form field" (1:65): label, 52px input, helper text. */
export const TextField: FC<TextFieldProps> = ({
  label,
  helper,
  prefix,
  style,
  ...inputProps
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputBox,
          { backgroundColor: colors.surface, borderColor: colors.border },
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
        />
      </View>
      {helper ? (
        <Text style={[styles.helper, { color: colors.textSubtle }]}>
          {helper}
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
  introTitle: { fontFamily: FONTS.bold, fontSize: 25, lineHeight: 29.5 },
  introSubtitle: { fontFamily: FONTS.regular, fontSize: 15, lineHeight: 21 },
  note: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18.2 },
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
  radioDot: { width: 7, height: 7, borderRadius: 3.5 },
  infoTitle: { fontFamily: FONTS.regular, fontSize: 15, lineHeight: 22.5 },
  infoCaption: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  button: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonLabel: { fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 21 },
  dimmed: { opacity: 0.7 },
  field: { width: '100%', gap: 7 },
  fieldLabel: { fontFamily: FONTS.regular, fontSize: 13 },
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
  input: { flex: 1, paddingVertical: 13, paddingHorizontal: 0 },
  helper: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
});
