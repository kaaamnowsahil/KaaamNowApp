import { useCallback, type FC } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import CheckIcon from '@/assets/icons/check.svg';
import { ReceiptCard } from '@/components/earnings';
import { PopIn, PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useHardwareBack } from '@/shared/hooks/useHardwareBack';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

import { WITHDRAW_SUCCESS_STRINGS } from './constants';

/**
 * Withdraw → confirmation. Figma: 12 · WORKER — Withdraw earnings: Initiated.
 * No back button; "Back to earnings" and Android back return to the Earnings tab.
 * "Download receipt" shares the receipt text until the API serves a PDF.
 */
export const WithdrawSuccessPage: FC<
  AppScreenProps<typeof ROUTES.withdrawSuccess>
> = ({ navigation, route }) => {
  const receipt = route.params;
  const { colors } = useTheme();
  const amount = formatRupees(receipt.amount);
  const lines = [
    { label: WITHDRAW_SUCCESS_STRINGS.AMOUNT, value: amount },
    { label: WITHDRAW_SUCCESS_STRINGS.TO, value: receipt.destination },
    { label: WITHDRAW_SUCCESS_STRINGS.METHOD, value: receipt.method },
    { label: WITHDRAW_SUCCESS_STRINGS.REFERENCE, value: receipt.reference },
  ];

  const backToEarnings = useCallback(
    () => navigation.popTo(ROUTES.mainTabs, { screen: ROUTES.workerEarnings }),
    [navigation],
  );
  useHardwareBack(backToEarnings);

  const shareReceipt = () =>
    Share.share({
      title: WITHDRAW_SUCCESS_STRINGS.RECEIPT_TITLE,
      message: [
        WITHDRAW_SUCCESS_STRINGS.RECEIPT_TITLE,
        ...lines.map(l => `${l.label}: ${l.value}`),
      ].join('\n'),
    });

  return (
    <FormScreen
      gap={16}
      testID="withdraw-success-page"
      actions={
        <>
          <PrimaryButton
            label={WITHDRAW_SUCCESS_STRINGS.BACK}
            onPress={backToEarnings}
            testID="withdraw-success-back"
          />
          <SecondaryButton
            label={WITHDRAW_SUCCESS_STRINGS.DOWNLOAD}
            onPress={shareReceipt}
            testID="withdraw-success-receipt"
          />
        </>
      }
    >
      <View style={styles.hero}>
        <PopIn style={[styles.disc, { backgroundColor: colors.successSoft }]}>
          <CheckIcon width={32} height={32} color={colors.success} />
        </PopIn>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.text }]}
        >
          {WITHDRAW_SUCCESS_STRINGS.HEADING}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {WITHDRAW_SUCCESS_STRINGS.subtitle(amount, receipt.method)}
        </Text>
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
  subtitle: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18.2 },
});
