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

import { WITHDRAW_SUCCESS_STRINGS as S } from './constants';

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
    { label: S.AMOUNT, value: amount },
    { label: S.TO, value: receipt.destination },
    { label: S.METHOD, value: receipt.method },
    { label: S.REFERENCE, value: receipt.reference },
  ];

  const backToEarnings = useCallback(
    () => navigation.popTo(ROUTES.mainTabs, { screen: ROUTES.workerEarnings }),
    [navigation],
  );
  useHardwareBack(backToEarnings);

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
          <PrimaryButton
            label={S.BACK}
            onPress={backToEarnings}
            testID="withdraw-success-back"
          />
          <SecondaryButton
            label={S.DOWNLOAD}
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
          {S.HEADING}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {S.subtitle(amount, receipt.method)}
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
