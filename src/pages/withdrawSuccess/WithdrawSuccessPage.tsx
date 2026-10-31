import { useCallback, type FC } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import CheckIcon from '@/assets/icons/check.svg';
import ClockIcon from '@/assets/icons/clock.svg';
import AlertIcon from '@/assets/icons/triangle-alert.svg';
import { ReceiptCard } from '@/components/earnings';
import {
  BodyNote,
  PopIn,
  PrimaryButton,
  SecondaryButton,
} from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { tabHome } from '@/route/tabRoutes';
import { FormScreen } from '@/layout/FormScreen';
import { earningsApi } from '@/services/earnings/earningsApi';
import { withdrawalTone } from '@/services/earnings/withdrawLogic';
import { fromMinor } from '@/services/shifts/shiftMappers';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useHardwareBack } from '@/shared/hooks/useHardwareBack';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

import { WITHDRAW_SUCCESS_STRINGS as S } from './constants';

const ICONS = { pending: ClockIcon, paid: CheckIcon, failed: AlertIcon };

/**
 * Withdraw → result. Figma: 12 · WORKER — Withdraw earnings: Initiated.
 * Shows the server's withdrawal record and re-reads it on focus; the route's
 * `withdrawal` param only fills the first frame.
 * No back button; "Back to earnings" and Android back return to the Earnings tab.
 */
export const WithdrawSuccessPage: FC<
  AppScreenProps<typeof ROUTES.withdrawSuccess>
> = ({ navigation, route }) => {
  const { withdrawalId, withdrawal: passed } = route.params;
  const { colors } = useTheme();
  const query = useApiQuery(
    () => earningsApi.withdrawal(withdrawalId),
    [withdrawalId],
  );
  const withdrawal =
    query.data ?? (passed?.id === withdrawalId ? passed : null);

  const backToEarnings = useCallback(
    () => navigation.popTo(ROUTES.mainTabs, tabHome(ROUTES.workerEarnings)),
    [navigation],
  );
  useHardwareBack(backToEarnings);

  const back = (
    <PrimaryButton
      label={S.BACK}
      onPress={backToEarnings}
      testID="withdraw-success-back"
    />
  );

  if (!withdrawal) {
    return (
      <FormScreen
        gap={16}
        isLoading={query.isLoading}
        testID="withdraw-success-page"
        actions={back}
      >
        <BodyNote>{query.error || S.NOT_FOUND}</BodyNote>
      </FormScreen>
    );
  }

  const tone = withdrawalTone(withdrawal.status);
  const Icon = ICONS[tone];
  const amount = formatRupees(fromMinor(withdrawal.amount_minor));
  const heading = {
    pending: S.HEADING,
    paid: S.PAID_HEADING,
    failed: S.FAILED_HEADING,
  }[tone];
  const status = {
    pending: S.STATUS_PROCESSING,
    paid: S.STATUS_PAID,
    failed: S.STATUS_FAILED,
  }[tone];
  const lines = [
    { label: S.AMOUNT, value: amount },
    { label: S.TO, value: withdrawal.payout_display },
    { label: S.REFERENCE, value: withdrawal.reference },
    { label: S.STATUS, value: status },
  ];

  const shareReceipt = () =>
    Share.share({
      title: S.RECEIPT_TITLE,
      message: [
        S.RECEIPT_TITLE,
        ...lines.map(l => `${l.label}: ${l.value}`),
      ].join('\n'),
    });

  return (
    <FormScreen
      gap={16}
      testID="withdraw-success-page"
      actions={
        <>
          {back}
          <SecondaryButton
            label={S.DOWNLOAD}
            onPress={shareReceipt}
            testID="withdraw-success-receipt"
          />
        </>
      }
    >
      <View style={styles.hero}>
        <PopIn
          style={[
            styles.disc,
            {
              backgroundColor:
                tone === 'failed' ? colors.dangerSoft : colors.successSoft,
            },
          ]}
        >
          <Icon
            width={32}
            height={32}
            color={tone === 'failed' ? colors.danger : colors.success}
          />
        </PopIn>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.text }]}
        >
          {heading}
        </Text>
        {tone === 'paid' ? null : (
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {tone === 'failed' ? S.FAILED_BODY : S.PAYOUT_TIME}
          </Text>
        )}
      </View>
      <ReceiptCard lines={lines} />
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 6, marginTop: 20 },
  disc: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 28 },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 18.2,
    textAlign: 'center',
  },
});
