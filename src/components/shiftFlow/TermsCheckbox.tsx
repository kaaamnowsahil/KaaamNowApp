import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/** Inline "I agree to the terms" checkbox with a link to the full terms. */
export const TermsCheckbox: FC<{
  checked: boolean;
  onToggle: () => void;
  label: string;
  linkLabel: string;
  onReadTerms: () => void;
  error?: string;
  testID?: string;
}> = ({ checked, onToggle, label, linkLabel, onReadTerms, error, testID }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.stack}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={onToggle}
        style={styles.row}
        testID={testID}
      >
        <View
          style={[
            styles.checkbox,
            checked
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { borderColor: error ? colors.danger : colors.textMuted },
          ]}
        >
          {checked ? (
            <Text style={[styles.checkmark, { color: colors.onPrimary }]}>✓</Text>
          ) : null}
        </View>
        <Text style={[styles.text, { color: colors.text }]}>
          {label}{' '}
          <Text
            accessibilityRole="link"
            onPress={onReadTerms}
            style={[styles.link, { color: colors.primary }]}
          >
            {linkLabel}
          </Text>
        </Text>
      </Pressable>
      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  stack: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 18,
    height: 18,
    marginTop: 1,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { fontFamily: FONTS.bold, fontSize: 12, lineHeight: 14 },
  text: { flex: 1, fontFamily: FONTS.regular, fontSize: 13, lineHeight: 19 },
  link: { textDecorationLine: 'underline' },
  error: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
});
