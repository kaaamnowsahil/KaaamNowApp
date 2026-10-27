import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BadgeCheckIcon from '@/assets/figma/badge-check.svg';
import InfoIcon from '@/assets/icons/info.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import type { Booking, MyShiftStatus } from '@/types';
import { formatRupees } from '@/utils/format';

import type { SelectionAction } from '../hooks/useWorkerShifts';

/** My shifts booking card; same layout as the web card. */
export const MyShiftCard: FC<{
  booking: Booking;
  onPress: () => void;
  /** Set while this card's confirm or decline request is running. */
  pendingAction?: SelectionAction;
  busy?: boolean;
  onSelection: (action: SelectionAction) => void;
}> = ({ booking, onPress, pendingAction, busy, onSelection }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { shift, status } = booking;
  const translatedStatus = t(`workerShifts.status.${status}`);

  const closed = { color: colors.danger, background: colors.dangerSoft };
  const pill: Record<MyShiftStatus, { color: string; background: string }> = {
    confirmed: { color: colors.success, background: colors.successSoft },
    selected: { color: colors.warning, background: colors.primarySoft },
    applied: { color: colors.primary, background: colors.primarySoft },
    completed: { color: colors.textMuted, background: colors.primarySoft },
    cancelled: { color: colors.textMuted, background: colors.primarySoft },
    declined: closed,
    rejected: closed,
    withdrawn: closed,
    expired: closed,
  };

  const selectionButton = (action: SelectionAction) => (
    <Pressable
      key={action}
      accessibilityRole="button"
      disabled={busy}
      onPress={() => onSelection(action)}
      style={({ pressed }) => [
        styles.selection,
        { backgroundColor: colors.primary, borderColor: colors.primary },
        (busy || pressed) && styles.dimmed,
      ]}
      testID={`my-shift-${action}-${booking.id}`}
    >
      <Text style={[styles.selectionLabel, { color: colors.onPrimary }]}>
        {pendingAction === action
          ? t('workerShifts.actions.working')
          : t(`workerShifts.actions.${action}Selection`)}
      </Text>
    </Pressable>
  );

  const business = [
    shift.businessName,
    shift.isVerified ? t('workerShifts.verifiedTag') : null,
    booking.businessRating
      ? `${booking.businessRating.avg.toFixed(1)} (${
          booking.businessRating.count
        })`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${shift.title}, ${translatedStatus}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
      testID={`my-shift-${booking.id}`}
    >
      <View style={styles.topline}>
        <Text
          style={[
            styles.pill,
            {
              color: pill[status].color,
              backgroundColor: pill[status].background,
            },
          ]}
        >
          {translatedStatus}
        </Text>
        <View style={styles.toplineEnd}>
          <Text
            style={[styles.category, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {shift.requirement}
          </Text>
          <View style={[styles.info, { backgroundColor: colors.primarySoft }]}>
            <InfoIcon width={16} height={16} color={colors.primary} />
          </View>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{shift.title}</Text>
      <View style={styles.business}>
        {shift.isVerified ? (
          <BadgeCheckIcon width={15} height={15} color={colors.success} />
        ) : null}
        <Text style={[styles.meta, styles.flex, { color: colors.textMuted }]}>
          {business}
        </Text>
      </View>

      <Text style={[styles.meta, { color: colors.textMuted }]}>
        {t('workerShifts.when', {
          date: shift.dateLabel,
          time: shift.timeLabel,
          hours: shift.durationHours,
        })}
      </Text>
      <Text style={[styles.meta, { color: colors.textMuted }]}>
        {`${shift.area} · ${t('workerShifts.distance', {
          km: shift.distanceKm,
        })}`}
      </Text>
      {booking.statusTime ? (
        <Text style={[styles.meta, { color: colors.textSubtle }]}>
          {t(`workerShifts.times.${booking.statusTime.key}`, {
            time: booking.statusTime.at,
          })}
        </Text>
      ) : null}
      {status === 'selected' && booking.confirmBy ? (
        <Text style={[styles.deadline, { color: colors.warning }]}>
          {t('workerShifts.confirmBy', { when: booking.confirmBy })}
        </Text>
      ) : null}

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.pay, { color: colors.text }]}>
          <Text style={styles.rate}>{formatRupees(shift.hourlyRate)}</Text>
          {` ${t('workerShifts.perHour')} · ${t('workerShifts.estimated', {
            amount: formatRupees(
              booking.estimatedPay ?? shift.hourlyRate * shift.durationHours,
            ),
          })}`}
        </Text>
        {status === 'selected' && shift.applicationId ? (
          <View style={styles.selectionRow}>
            {selectionButton('confirm')}
            {selectionButton('decline')}
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={onPress}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            testID={`my-shift-action-${booking.id}`}
          >
            <Text style={[styles.actionLabel, { color: colors.primary }]}>
              {t('workerShifts.actions.viewDetails')}
            </Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 4 },
  pressed: { opacity: 0.8 },
  topline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  pill: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontFamily: FONTS.bold,
    fontSize: 12,
    lineHeight: 16,
  },
  toplineEnd: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    flexShrink: 1,
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  info: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: FONTS.semiBold, fontSize: 18, lineHeight: 26 },
  business: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flex: { flex: 1 },
  meta: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 20 },
  deadline: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 20 },
  footer: { borderTopWidth: 1, marginTop: 8, paddingTop: 12, gap: 8 },
  pay: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 26 },
  rate: { fontFamily: FONTS.bold, fontSize: 20 },
  action: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionLabel: { fontFamily: FONTS.semiBold, fontSize: 15 },
  selectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 10,
  },
  selection: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionLabel: { fontFamily: FONTS.semiBold, fontSize: 14 },
  dimmed: { opacity: 0.65 },
});
