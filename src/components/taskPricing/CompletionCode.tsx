import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { SecondaryButton, TextField } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import {
  cleanCompletionCode,
  COMPLETION_CODE_ATTEMPTS,
  COMPLETION_CODE_LENGTH,
} from '@/services/liveWork/liveWorkFormat';
import type { CompletionCode } from '@/services/liveWork/liveWorkTypes';
import { useTheme } from '@/theme/ThemeProvider';

/** Business: the code the Worker needs to finish; shared only when the work is done. */
export const CompletionCodeCard: FC<{
  completion: CompletionCode | null | undefined;
  busy?: boolean;
  onReissue?: () => void;
  testID?: string;
}> = ({ completion, busy, onReissue, testID = 'completion-code-card' }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  if (!completion?.code) return null;
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      testID={testID}
    >
      <Text style={[styles.label, { color: colors.primary }]}>
        {t('taskPricing.codeLabel')}
      </Text>
      {completion.locked ? (
        <Text
          accessibilityRole="alert"
          style={[styles.body, { color: colors.danger }]}
        >
          {t('taskPricing.codeLocked')}
        </Text>
      ) : (
        <Text
          selectable
          style={[styles.code, { color: colors.text }]}
          testID={`${testID}-value`}
        >
          {completion.code}
        </Text>
      )}
      <Text style={[styles.hint, { color: colors.textSubtle }]}>
        {t('taskPricing.codeHint')}
      </Text>
      {completion.can_reissue && onReissue ? (
        <SecondaryButton
          label={t('taskPricing.newCode')}
          onPress={onReissue}
          disabled={busy}
          testID={`${testID}-reissue`}
        />
      ) : null}
    </View>
  );
};

/** Worker: enters the code the Business gives when the work is done. */
export const CompletionCodeField: FC<{
  value: string;
  onChange: (value: string) => void;
  businessName: string;
  completion: CompletionCode | null | undefined;
  error?: string;
  testID?: string;
}> = ({
  value,
  onChange,
  businessName,
  completion,
  error,
  testID = 'completion-code-input',
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  if (completion?.locked) {
    return (
      <Text
        accessibilityRole="alert"
        style={[styles.body, { color: colors.danger }]}
        testID={`${testID}-locked`}
      >
        {t('taskPricing.workerLocked', { business: businessName })}
      </Text>
    );
  }
  const tries =
    completion && completion.attempts_left < COMPLETION_CODE_ATTEMPTS
      ? ` ${t('taskPricing.attemptsLeft', { count: completion.attempts_left })}`
      : '';
  return (
    <TextField
      label={t('taskPricing.enterCodeLabel')}
      value={value}
      onChangeText={text => onChange(cleanCompletionCode(text))}
      keyboardType="number-pad"
      autoComplete="one-time-code"
      textContentType="oneTimeCode"
      maxLength={COMPLETION_CODE_LENGTH}
      placeholder={'•'.repeat(COMPLETION_CODE_LENGTH)}
      helper={`${t('taskPricing.enterCodeHint', {
        business: businessName,
      })}${tries}`}
      error={error}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  code: { fontFamily: FONTS.bold, fontSize: 32, letterSpacing: 6 },
  body: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 19 },
  hint: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
});
