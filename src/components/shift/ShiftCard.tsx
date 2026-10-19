import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BadgeCheckIcon from '@/assets/figma/badge-check.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import type { Shift } from '@/types';
import { formatRupees } from '@/utils/format';

import { SHIFT_STRINGS as S } from './shiftStrings';

/** Figma "Shift card" (1:1502). */
export const ShiftCard: FC<{ shift: Shift; onPress?: () => void }> = ({
  shift,
  onPress,
}) => {
  const { colors } = useTheme();
  const isLive = shift.status === 'live';
  const business = shift.isVerified
    ? `${shift.businessName} · ${S.VERIFIED}`
    : shift.businessName;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${shift.title}, ${shift.businessName}`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
      testID={`shift-card-${shift.id}`}
    >
      <View style={styles.row}>
        <Text
          style={[
            styles.status,
            { color: isLive ? colors.success : colors.primary },
          ]}
        >
          {S.STATUS_LABEL[shift.status]}
        </Text>
        <Text style={[styles.distance, { color: colors.textSubtle }]}>
          {S.km(shift.distanceKm)}
        </Text>
      </View>

      <View style={styles.opportunity}>
        <Text style={[styles.title, { color: colors.text }]}>
          {shift.title}
        </Text>
        <View style={styles.business}>
          {shift.isVerified ? (
            <BadgeCheckIcon width={15} height={15} color={colors.primary} />
          ) : null}
          <Text style={[styles.body, styles.flex, { color: colors.textMuted }]}>
            {business}
          </Text>
        </View>
      </View>

      <Text style={[styles.body, { color: colors.textMuted }]}>
        {`${shift.dateLabel} · ${shift.timeLabel} · ${S.hours(
          shift.durationHours,
        )}`}
      </Text>
      <Text style={[styles.meta, { color: colors.textSubtle }]}>
        {`${shift.area} · ${shift.requirement}`}
      </Text>

      <View style={[styles.row, styles.payRow]}>
        <View style={styles.pay}>
          <Text style={[styles.rate, { color: colors.text }]}>
            {formatRupees(shift.hourlyRate)}
            <Text style={[styles.perHour, { color: colors.textSubtle }]}>
              {S.PER_HOUR}
            </Text>
          </Text>
          <Text style={[styles.estimate, { color: colors.textSubtle }]}>
            {S.estimated(
              formatRupees(shift.hourlyRate * shift.durationHours),
            )}
          </Text>
        </View>
        <Text style={[styles.cta, { color: colors.primary }]}>
          {isLive ? S.spotsOpen(shift.spotsOpen) : S.APPLY}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  pressed: { opacity: 0.85 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  status: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 17 },
  distance: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 17 },
  opportunity: { gap: 4 },
  title: { fontFamily: FONTS.regular, fontSize: 18, lineHeight: 26 },
  business: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flex: { flex: 1 },
  body: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 20 },
  meta: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  payRow: { alignItems: 'flex-end' },
  pay: { gap: 1 },
  rate: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 28 },
  perHour: { fontFamily: FONTS.bold, fontSize: 12 },
  estimate: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 17 },
  cta: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 17 },
});
