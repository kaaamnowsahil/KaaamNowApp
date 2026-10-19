import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BadgeCheckIcon from '@/assets/figma/badge-check.svg';
import { OutlineButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import type { Booking, BookingStatus } from '@/types';
import { formatRupees } from '@/utils/format';

import { WORKER_SHIFTS_STRINGS as S } from '../constants';

/** Figma My shifts (08) booking card: status, shift facts, pay, outlined action. */
export const MyShiftCard: FC<{
  booking: Booking;
  onPress: () => void;
  onAction: () => void;
}> = ({ booking, onPress, onAction }) => {
  const { colors } = useTheme();
  const { shift, status } = booking;
  const total = formatRupees(shift.hourlyRate * shift.durationHours);
  const isFaded = status === 'completed' || status === 'cancelled';

  const statusColor: Record<BookingStatus, string> = {
    confirmed: colors.success,
    selected: colors.warning,
    applied: colors.primary,
    completed: colors.textSubtle,
    cancelled: colors.danger,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${shift.title}, ${S.status(status)}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
      testID={`my-shift-${booking.id}`}
    >
      <Text style={[styles.status, { color: statusColor[status] }]}>
        {S.status(status, booking.checkInCode)}
      </Text>

      <Text style={[styles.title, { color: colors.text }]}>{shift.title}</Text>
      <View style={styles.business}>
        {shift.isVerified ? (
          <BadgeCheckIcon width={15} height={15} color={colors.primary} />
        ) : null}
        <Text style={[styles.body, styles.flex, { color: colors.textMuted }]}>
          {shift.isVerified ? S.verified(shift.businessName) : shift.businessName}
        </Text>
      </View>

      <Text style={[styles.meta, { color: colors.textMuted }]}>
        {S.when(shift.dateLabel, shift.timeLabel, shift.durationHours)}
      </Text>
      <Text style={[styles.meta, { color: colors.textSubtle }]}>
        {S.where(shift.area, shift.distanceKm)}
      </Text>

      {status === 'selected' ? (
        <>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {S.offerPay(formatRupees(shift.hourlyRate), total)}
          </Text>
          {booking.confirmBy ? (
            <Text style={[styles.deadline, { color: colors.warning }]}>
              {S.confirmBy(booking.confirmBy)}
            </Text>
          ) : null}
        </>
      ) : (
        <View style={styles.pay}>
          <Text
            style={[
              styles.rate,
              { color: isFaded ? colors.textMuted : colors.text },
            ]}
          >
            {formatRupees(shift.hourlyRate)}
            <Text style={[styles.perHour, { color: colors.textSubtle }]}>
              {S.PER_HOUR}
            </Text>
          </Text>
          <Text style={[styles.estimate, { color: colors.textSubtle }]}>
            {S.estimated(total)}
          </Text>
        </View>
      )}

      <View style={styles.action}>
        <OutlineButton
          label={S.ACTION[status]}
          onPress={onAction}
          testID={`my-shift-action-${booking.id}`}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 4 },
  pressed: { opacity: 0.9 },
  status: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 16.5 },
  title: {
    fontFamily: FONTS.regular,
    fontSize: 18,
    lineHeight: 25.2,
    marginTop: 4,
  },
  business: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flex: { flex: 1 },
  body: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18.2 },
  meta: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  deadline: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 18 },
  pay: { marginTop: 4, gap: 1 },
  rate: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 28 },
  perHour: { fontFamily: FONTS.regular, fontSize: 12 },
  estimate: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
  action: { marginTop: 10 },
});
