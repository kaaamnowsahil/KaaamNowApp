import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TextButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';

import { SHIFT_REVIEW_STRINGS as S } from '../constants/shiftReviewStrings';

/** Business cancellation tiers from GET /catalog/cancellation-policy, plus the terms link. */
export const CancellationPolicyCard: FC<{ onReadTerms: () => void }> = ({ onReadTerms }) => {
  const { colors } = useTheme();
  const policy = useApiQuery(() => shiftsApi.cancellationPolicy(), []);
  const tiers = (policy.data?.tiers ?? [])
    .filter(tier => tier.party === 'business' && tier.event === 'cancel')
    .sort((a, b) => b.hours_from - a.hours_from);
  const voucherHours = policy.data?.tiers.find(
    tier => tier.party === 'worker' && tier.event === 'cancel' && tier.business_voucher,
  )?.hours_to;

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID="business-shift-cancellation-policy"
    >
      <Text style={[styles.title, { color: colors.text }]}>{S.CANCELLATION_TITLE}</Text>
      <Text style={[styles.note, { color: colors.textMuted }]}>{S.CANCELLATION_INTRO}</Text>

      {policy.error ? (
        <Text style={[styles.note, { color: colors.danger }]}>{S.CANCELLATION_LOAD_FAILED}</Text>
      ) : null}

      {tiers.length ? (
        <View style={[styles.tiers, { borderColor: colors.border }]}>
          {tiers.map((tier, index) => (
            <View
              key={tier.hours_from}
              style={[
                styles.tier,
                index > 0 && [styles.tierDivider, { borderTopColor: colors.border }],
              ]}
            >
              <Text style={[styles.window, { color: colors.textMuted }]}>
                {S.tierWindow(tier.hours_from, tier.hours_to)}
              </Text>
              <Text style={[styles.feeValue, { color: colors.text }]}>
                {tier.booking_pct > 0 ? S.tierFee(tier.booking_pct) : S.TIER_FREE}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {policy.data ? (
        <View
          style={[
            styles.callout,
            { backgroundColor: colors.successSoft, borderColor: colors.success },
          ]}
          testID="business-shift-unfilled-voucher"
        >
          <Text style={[styles.note, { color: colors.text }]}>
            {S.unfilledSeats(
              policy.data.unfilled_cutoff_hours,
              policy.data.voucher_valid_days,
            )}
          </Text>
        </View>
      ) : null}

      {policy.data ? (
        <View style={styles.points}>
          {[
            S.CANCELLATION_FREE_UNBOOKED,
            S.CANCELLATION_GATEWAY,
            ...(voucherHours != null
              ? [S.workerCancelVoucher(voucherHours, policy.data.voucher_valid_days)]
              : []),
          ].map(point => (
            <View key={point} style={styles.point}>
              <Text style={[styles.note, { color: colors.textMuted }]}>•</Text>
              <Text style={[styles.note, styles.pointText, { color: colors.textMuted }]}>
                {point}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={[styles.agree, { borderTopColor: colors.border }]}>
        <Text style={[styles.note, { color: colors.textSubtle }]}>{S.TERMS_AGREE}</Text>
        <TextButton
          label={S.READ_TERMS}
          onPress={onReadTerms}
          testID="business-shift-read-terms"
          tone="primary"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  title: { fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 21 },
  note: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  tiers: { borderWidth: 1, borderRadius: 10 },
  tier: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  tierDivider: { borderTopWidth: 1 },
  window: { flex: 1, fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  feeValue: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 18, textAlign: 'right' },
  callout: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  points: { gap: 4 },
  point: { flexDirection: 'row', gap: 6 },
  pointText: { flex: 1 },
  agree: { borderTopWidth: 1, paddingTop: 10, gap: 4, alignItems: 'flex-start' },
});
