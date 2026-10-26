import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BadgeCheckIcon from '@/assets/figma/badge-check.svg';
import { FONTS } from '@/constants/fonts';
import { formatDateLabel } from '@/services/shifts/shiftMappers';
import { useTheme } from '@/theme/ThemeProvider';
import type { BusinessApplicant } from '@/types';

import { BOOKED_WORKERS_STRINGS as S } from '../constants/bookedWorkersStrings';
import { WorkerAvatar } from './WorkerAvatar';

const pad = (value: number) => String(value).padStart(2, '0');
const formatClock = (iso: string) => {
  const date = new Date(iso);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const leftLabel = (applicant: BusinessApplicant) =>
  applicant.assignmentId
    ? S.CANCELLED_BOOKING
    : applicant.applicationStatus === 'declined'
      ? S.DECLINED_OFFER
      : S.WITHDREW;

/** One booked worker (or one who withdrew): identity, rating, distance, and links. */
export const BusinessApplicantRow: FC<{
  applicant: BusinessApplicant;
  /** Worker withdrew, cancelled their booking or declined the offer. */
  left?: boolean;
  onOpenProfile?: () => void;
  onOpenBooking?: () => void;
}> = ({ applicant, left, onOpenProfile, onOpenBooking }) => {
  const { colors } = useTheme();
  const meta = [
    left && applicant.respondedAt
      ? `${formatDateLabel(applicant.respondedAt)}, ${formatClock(applicant.respondedAt)}`
      : '',
    applicant.ratingCount ? S.rating(applicant.rating, applicant.ratingCount) : S.NEW_WORKER,
    S.shiftsDone(applicant.completedShifts ?? 0),
    !left && applicant.distanceKm != null ? S.away(applicant.distanceKm) : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View
      style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}
      testID={`booked-worker-${applicant.id}`}
    >
      <View style={styles.top}>
        <WorkerAvatar name={applicant.name} photoUrl={applicant.photoUrl} />
        <View style={styles.copy}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={[styles.name, { color: colors.text }]}>
              {applicant.name}
            </Text>
            {applicant.isVerified ? (
              <BadgeCheckIcon width={16} height={16} color={colors.success} />
            ) : null}
          </View>
          <Text numberOfLines={1} style={[styles.meta, { color: colors.textSubtle }]}>
            {meta}
          </Text>
        </View>
        <Text
          style={[
            styles.pill,
            left
              ? { color: colors.danger, backgroundColor: colors.dangerSoft }
              : { color: colors.success, backgroundColor: colors.successSoft },
          ]}
        >
          {left ? leftLabel(applicant) : S.BOOKED}
        </Text>
      </View>
      <View style={[styles.actions, { borderTopColor: colors.border }]}>
        {onOpenProfile ? (
          <Pressable
            accessibilityRole="button"
            onPress={onOpenProfile}
            style={[styles.action, { borderColor: colors.primary }]}
          >
            <Text style={[styles.actionText, { color: colors.primary }]}>{S.VIEW_PROFILE}</Text>
          </Pressable>
        ) : null}
        {onOpenBooking && !left ? (
          <Pressable
            accessibilityRole="button"
            onPress={onOpenBooking}
            style={[styles.action, { borderColor: colors.primary, backgroundColor: colors.primary }]}
          >
            <Text style={[styles.actionText, { color: colors.onPrimary }]}>{S.VIEW_BOOKING}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 12, gap: 12 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1, fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 21 },
  meta: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
  pill: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    lineHeight: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  action: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
  },
  actionText: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
});
