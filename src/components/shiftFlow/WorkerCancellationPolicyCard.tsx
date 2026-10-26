import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TextButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';

import { WORKER_CANCELLATION_STRINGS as S } from './workerCancellationStrings';

/** Worker cancellation tiers from GET /catalog/cancellation-policy, plus the terms link. */
export const WorkerCancellationPolicyCard: FC<{ onReadTerms: () => void }> = ({
  onReadTerms,
}) => {
  const { colors } = useTheme();
  const policy = useApiQuery(() => shiftsApi.cancellationPolicy(), []);
  const workerTiers = (policy.data?.tiers ?? []).filter(tier => tier.party === 'worker');
  const rows = [
    ...workerTiers
      .filter(tier => tier.event === 'cancel')
      .sort((a, b) => b.hours_from - a.hours_from)
      .map(tier => ({ label: S.tierWindow(tier.hours_from, tier.hours_to), tier })),
    ...workerTiers
      .filter(tier => tier.event === 'no_show')
      .map(tier => ({ label: S.NO_SHOW, tier })),
  ];

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID="worker-cancellation-policy"
    >
      <Text style={[styles.title, { color: colors.text }]}>{S.TITLE}</Text>
      <Text style={[styles.note, { color: colors.textMuted }]}>{S.INTRO}</Text>

      {policy.error ? (
        <Text style={[styles.note, { color: colors.danger }]}>{S.LOAD_FAILED}</Text>
      ) : null}

      {rows.length ? (
        <View style={[styles.tiers, { borderColor: colors.border }]}>
          {rows.map(({ label, tier }, index) => (
            <View
              key={`${tier.event}-${tier.hours_from}`}
              style={[
                styles.tier,
                index > 0 && [styles.tierDivider, { borderTopColor: colors.border }],
              ]}
            >
              <Text style={[styles.window, { color: colors.textMuted }]}>{label}</Text>
              <Text style={[styles.fee, { color: colors.text }]}>{S.tierFee(tier)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {policy.data ? (
        <View style={styles.points}>
          {[
            S.strikes(
              policy.data.strikes_to_limit,
              policy.data.strike_window_days,
              policy.data.limit_days,
              policy.data.strikes_to_ban,
            ),
            S.WALLET,
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
          testID="worker-read-terms"
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
  fee: { flex: 1, fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 18, textAlign: 'right' },
  points: { gap: 4 },
  point: { flexDirection: 'row', gap: 6 },
  pointText: { flex: 1 },
  agree: { borderTopWidth: 1, paddingTop: 10, gap: 4, alignItems: 'flex-start' },
});
