import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import ShieldCheckIcon from '@/assets/icons/shield-check.svg';
import { PrimaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

import { PayoutOptionRow } from './components';
import {
  BALANCE,
  DEFAULT_OPTION_ID,
  MOCK_REFERENCE,
  PAYOUT_OPTIONS,
} from './mock';

/**
 * Earnings → Withdraw. Figma: 12 · WORKER — Withdraw earnings: Choose account.
 * Saved accounts withdraw straight away; "Add …" options continue to Payout account.
 * - data: mock/withdrawMock.ts
 */
export const WithdrawPage: FC<AppScreenProps<typeof ROUTES.withdraw>> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isLoading = useMockLoading();
  const [selectedId, setSelectedId] = useState(DEFAULT_OPTION_ID);
  const selected = PAYOUT_OPTIONS.find(o => o.id === selectedId);
  const amount = formatRupees(BALANCE.available);

  const submit = () => {
    if (!selected?.destination || !selected.method) {
      navigation.navigate(ROUTES.payoutAccount);
      return;
    }
    navigation.replace(ROUTES.withdrawSuccess, {
      amount: BALANCE.available,
      destination: selected.destination,
      method: selected.method,
      reference: MOCK_REFERENCE,
    });
  };

  return (
    <FormScreen
      onBack={navigation.goBack}
      backVariant="plain"
      title={t('withdraw.title')}
      gap={14}
      isLoading={isLoading}
      testID="withdraw-page"
      actions={
        <PrimaryButton
          label={
            selected?.destination
              ? t('withdraw.withdrawAmount', { amount })
              : t('withdraw.continue')
          }
          onPress={submit}
          testID="withdraw-submit"
        />
      }
    >
      <View
        style={[
          styles.balance,
          { backgroundColor: colors.fill, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.small, { color: colors.textSubtle }]}>
          {t('withdraw.available')}
        </Text>
        <Text style={[styles.amount, { color: colors.text }]}>{amount}</Text>
        <Text style={[styles.small, { color: colors.textMuted }]}>
          {t('withdraw.fromShifts', { count: BALANCE.completedShifts })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.overline, { color: colors.textSubtle }]}>
          {t('withdraw.withdrawTo')}
        </Text>
        <View
          accessibilityRole="radiogroup"
          style={[
            styles.options,
            { backgroundColor: colors.fill, borderColor: colors.border },
          ]}
        >
          {PAYOUT_OPTIONS.map((option, i) => (
            <PayoutOptionRow
              key={option.id}
              option={option}
              selected={option.id === selectedId}
              isLast={i === PAYOUT_OPTIONS.length - 1}
              onPress={() => setSelectedId(option.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.note}>
        <ShieldCheckIcon width={14} height={14} color={colors.success} />
        <Text style={[styles.small, { color: colors.textSubtle }]}>
          {t('withdraw.payoutTime')}
        </Text>
      </View>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  balance: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 4,
  },
  small: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 17 },
  amount: { fontFamily: FONTS.bold, fontSize: 26, lineHeight: 32 },
  section: { gap: 10 },
  overline: {
    fontFamily: FONTS.semiBold,
    fontSize: 10.5,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  options: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
