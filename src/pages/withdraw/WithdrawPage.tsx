import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import WalletIcon from '@/assets/figma/wallet.svg';
import ShieldCheckIcon from '@/assets/icons/shield-check.svg';
import { BodyNote, IconField, PrimaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import type { PayoutAccount } from '@/services/earnings/earningsApi';
import { canWithdraw } from '@/services/earnings/withdrawLogic';
import { fromMinor } from '@/services/shifts/shiftMappers';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

import { PayoutOptionRow, type PayoutOption } from './components';
import { useWithdraw } from './hooks/useWithdraw';

const TYPE_TITLES = {
  upi: 'withdraw.options.upiTitle',
  paytm: 'withdraw.options.paytmTitle',
  bank: 'withdraw.options.bankTitle',
} as const;

const ADD_OPTION_ID = 'add-upi';

const accountDetail = (account: PayoutAccount) =>
  account.upi_id ||
  account.paytm_phone ||
  (account.bank_account_last4
    ? `••••${account.bank_account_last4}`
    : account.display);

/**
 * Earnings → Withdraw. Figma: 12 · WORKER — Withdraw earnings: Choose account.
 * Withdraws to a saved payout account; "Add new UPI ID" opens Payout account.
 * - data: hooks/useWithdraw.ts
 */
export const WithdrawPage: FC<AppScreenProps<typeof ROUTES.withdraw>> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const withdraw = useWithdraw(withdrawal =>
    navigation.replace(ROUTES.withdrawSuccess, {
      withdrawalId: withdrawal.id,
      withdrawal,
    }),
  );
  const summary = withdraw.data?.summary;
  const accounts = withdraw.data?.accounts ?? [];
  const available = Math.max(summary?.available_minor ?? 0, 0);
  const minimum = formatRupees(fromMinor(summary?.min_withdrawal_minor ?? 0));
  const eligible = summary
    ? canWithdraw(summary.available_minor, summary.min_withdrawal_minor)
    : false;
  const ready = eligible && accounts.length > 0;

  const amountMessage = (key: string) =>
    t(`withdraw.${key}`, {
      amount: key === 'belowMin' ? minimum : formatRupees(fromMinor(available)),
    });
  const fieldMessage = withdraw.problem
    ? amountMessage(withdraw.problem)
    : undefined;
  const submitError = withdraw.submitError;
  const submitMessage = submitError
    ? 'key' in submitError
      ? amountMessage(submitError.key)
      : submitError.text
    : '';

  const options: PayoutOption[] = [
    ...accounts.map(account => ({
      id: account.id,
      initial: account.account_type.charAt(0).toUpperCase(),
      title: t(TYPE_TITLES[account.account_type]),
      caption: accountDetail(account),
    })),
    {
      id: ADD_OPTION_ID,
      title: t('withdraw.options.addUpiTitle'),
      caption: t('withdraw.options.addAnother'),
    },
  ];
  const openPayoutAccount = () => navigation.navigate(ROUTES.payoutAccount);

  const action = withdraw.loadError ? (
    <PrimaryButton
      label={t('withdraw.retry')}
      onPress={withdraw.reload}
      testID="withdraw-retry"
    />
  ) : ready ? (
    <PrimaryButton
      label={
        withdraw.isSubmitting
          ? t('withdraw.withdrawing')
          : t('withdraw.continue')
      }
      disabled={withdraw.isSubmitting}
      onPress={withdraw.submit}
      testID="withdraw-submit"
    />
  ) : eligible ? (
    <PrimaryButton
      label={t('withdraw.addAccount')}
      onPress={openPayoutAccount}
      testID="withdraw-add-account"
    />
  ) : (
    <PrimaryButton
      label={t('withdrawSuccess.back')}
      onPress={navigation.goBack}
      testID="withdraw-back"
    />
  );

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('withdraw.title')}
      gap={14}
      isLoading={withdraw.isLoading}
      testID="withdraw-page"
      actions={action}
    >
      {withdraw.loadError && !summary ? (
        <BodyNote>{withdraw.loadError}</BodyNote>
      ) : summary ? (
        <>
          <View
            style={[
              styles.balance,
              { backgroundColor: colors.fill, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.small, { color: colors.textSubtle }]}>
              {t('withdraw.available')}
            </Text>
            <Text style={[styles.amount, { color: colors.text }]}>
              {formatRupees(fromMinor(available))}
            </Text>
            <Text style={[styles.small, { color: colors.textMuted }]}>
              {t('withdraw.fromShifts', { count: summary.completed_shifts })}
            </Text>
          </View>

          {!eligible ? (
            <BodyNote>
              {t('withdraw.nothingToWithdraw', { amount: minimum })}
            </BodyNote>
          ) : null}
          {eligible && accounts.length === 0 ? (
            <BodyNote>{t('withdraw.noAccounts')}</BodyNote>
          ) : null}

          {ready ? (
            <>
              <IconField
                label={t('withdraw.amountLabel')}
                icon={WalletIcon}
                prefix="₹"
                value={withdraw.amountText}
                onChangeText={withdraw.setAmountText}
                keyboardType="decimal-pad"
                error={fieldMessage}
                testID="withdraw-amount"
              />
              <Text style={[styles.small, { color: colors.textSubtle }]}>
                {t('withdraw.amountHelper', { amount: minimum })}
              </Text>

              <View style={styles.section}>
                <Text style={[styles.overline, { color: colors.textSubtle }]}>
                  {t('withdraw.withdrawTo')}
                </Text>
                <View
                  accessibilityRole="radiogroup"
                  style={[
                    styles.options,
                    {
                      backgroundColor: colors.fill,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {options.map((option, i) => (
                    <PayoutOptionRow
                      key={option.id}
                      option={option}
                      selected={option.id === withdraw.accountId}
                      isLast={i === options.length - 1}
                      onPress={() =>
                        option.id === ADD_OPTION_ID
                          ? openPayoutAccount()
                          : withdraw.setAccountId(option.id)
                      }
                    />
                  ))}
                </View>
              </View>

              {submitMessage && submitMessage !== fieldMessage ? (
                <Text
                  accessibilityRole="alert"
                  style={[styles.error, { color: colors.danger }]}
                  testID="withdraw-error"
                >
                  {submitMessage}
                </Text>
              ) : null}

              <View style={styles.note}>
                <ShieldCheckIcon
                  width={14}
                  height={14}
                  color={colors.success}
                />
                <Text style={[styles.small, { color: colors.textSubtle }]}>
                  {t('withdraw.payoutTime')}
                </Text>
              </View>
            </>
          ) : null}
        </>
      ) : null}
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
  error: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
