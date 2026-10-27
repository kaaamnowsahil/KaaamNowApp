import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { BottomSheet, PrimaryButton, TextButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import type { ShiftCancelPreview } from '@/services/shifts/shiftsApi';
import { useTheme } from '@/theme/ThemeProvider';
import { formatRupees } from '@/utils/format';

const money = (minor: number) => formatRupees(Math.round(minor / 100));

const previewText = (preview: ShiftCancelPreview) =>
  preview.fee_minor > 0
    ? `${preview.booked_workers} booked worker(s). Cancellation fee ${money(
        preview.fee_minor,
      )}. Refund: ${money(preview.business_refund_minor)}.`
    : `${
        preview.booked_workers
      } booked worker(s). No fee; full refund of ${money(
        preview.business_refund_minor,
      )}.`;

/** Confirms cancelling a shift; mirrors web `BusinessShiftCancelDialog`. Mount only while open. */
export const BusinessShiftCancelSheet: FC<{
  cutoffHours: number;
  preview: ShiftCancelPreview | null;
  error: string;
  isCancelling: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ cutoffHours, preview, error, isCancelling, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <BottomSheet
      title={t('businessShifts.confirmCancelTitle')}
      subtitle={
        preview
          ? previewText(preview)
          : t('businessShifts.confirmCancelBody', { hours: cutoffHours })
      }
      onClose={onClose}
      closeLabel={t('businessShifts.keepShift')}
      testID="business-shift-cancel-sheet"
    >
      <View style={styles.actions}>
        {error ? (
          <Text
            accessibilityRole="alert"
            style={[styles.error, { color: colors.danger }]}
          >
            {error}
          </Text>
        ) : null}
        <PrimaryButton
          label={
            isCancelling
              ? t('businessShifts.cancelling')
              : t('businessShifts.confirmCancel')
          }
          tone="danger"
          disabled={isCancelling}
          onPress={onConfirm}
        />
        <TextButton label={t('businessShifts.keepShift')} onPress={onClose} />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  actions: { gap: 12, marginTop: 8 },
  error: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
});
