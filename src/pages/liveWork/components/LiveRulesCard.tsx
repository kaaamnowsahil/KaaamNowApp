import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { WORKER_CANCELLATION_STRINGS as W } from '@/components/shiftFlow/workerCancellationStrings';
import { TextButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { tr } from '@/services/i18n/tr';
import {
  shiftsApi,
  type CancellationPolicy,
  type CancellationTier,
} from '@/services/shifts/shiftsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`liveRules.${key}`, values);

const DEFAULT_STOP_SHARE_PCT = 80;

type Row = { id: string; when: string; result: string };

function liveTier(
  policy: CancellationPolicy,
  party: CancellationTier['party'],
  event: CancellationTier['event'],
) {
  return policy.tiers.find(
    tier =>
      tier.party === party &&
      tier.event === event &&
      tier.hours_from <= 0 &&
      (tier.hours_to == null || tier.hours_to > 0),
  );
}

function businessRows(policy: CancellationPolicy, isTask: boolean): Row[] {
  return [
    {
      id: 'before-code',
      when: k('bBeforeAccept'),
      result: k('bBeforeAcceptResult'),
    },
    {
      id: 'worker-before-start',
      when: k('bWorkerBeforeStart'),
      result: k('bWorkerBeforeStartResult'),
    },
    {
      id: 'done',
      when: k('bDone'),
      result: isTask ? k('bDoneTask') : k('bDoneHourly'),
    },
    {
      id: 'force',
      when: k('bForce'),
      result: k('payPct', { pct: 100 }),
    },
    {
      id: 'worker-force',
      when: k('bWorkerForce'),
      result: k('bWorkerForceResult'),
    },
  ];
}

function workerRows(
  policy: CancellationPolicy,
  isTask: boolean,
  share: number,
): Row[] {
  const cancel = liveTier(policy, 'worker', 'cancel');
  const walkOff = liveTier(policy, 'worker', 'walk_off');
  return [
    {
      id: 'cancel',
      when: k('wCancel'),
      result: cancel ? W.tierFee(cancel) : W.FREE,
    },
    {
      id: 'business-cancel',
      when: k('wBusinessCancel'),
      result: k('wNoPay'),
    },
    {
      id: 'done',
      when: k('wDone'),
      result: isTask ? k('wDoneTask') : k('wDoneHourly'),
    },
    {
      id: 'force',
      when: k('wForce'),
      result:
        walkOff && walkOff.strike_weight > 0
          ? `${k('wNoPay')} + ${W.strike(walkOff.strike_weight)}`
          : k('wNoPay'),
    },
    {
      id: 'business-force',
      when: k('wBusinessForce'),
      result: k('wSharePct', { pct: share }),
    },
  ];
}

/** Live Work rules for one side, built from GET /catalog/cancellation-policy (rules §12). */
export const LiveRulesCard: FC<{
  audience: 'business' | 'worker';
  isTask: boolean;
  onReadTerms: () => void;
}> = ({ audience, isTask, onReadTerms }) => {
  const { colors } = useTheme();
  const policy = useApiQuery(() => shiftsApi.cancellationPolicy(), []);
  const data = policy.data;
  const share = data?.business_stop_worker_share_pct ?? DEFAULT_STOP_SHARE_PCT;
  const rows = data
    ? audience === 'business'
      ? businessRows(data, isTask)
      : workerRows(data, isTask, share)
    : [];
  const points = data
    ? [
        k('noCodeToCancel'),
        ...(audience === 'worker'
          ? [
              W.strikes(
                data.strikes_to_limit,
                data.strike_window_days,
                data.limit_days,
                data.strikes_to_ban,
              ),
              W.WALLET,
            ]
          : [k('voucherDays', { days: data.voucher_valid_days })]),
      ]
    : [];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      testID="live-rules"
    >
      <Text style={[styles.title, { color: colors.text }]}>{k('title')}</Text>
      <Text style={[styles.note, { color: colors.textMuted }]}>
        {k('intro')}
      </Text>

      {policy.error ? (
        <Text style={[styles.note, { color: colors.danger }]}>
          {W.LOAD_FAILED}
        </Text>
      ) : null}

      {rows.length ? (
        <View style={[styles.rows, { borderColor: colors.border }]}>
          {rows.map((row, index) => (
            <View
              key={row.id}
              style={[
                styles.row,
                index > 0 && [
                  styles.divider,
                  { borderTopColor: colors.border },
                ],
              ]}
            >
              <Text style={[styles.when, { color: colors.textMuted }]}>
                {row.when}
              </Text>
              <Text style={[styles.result, { color: colors.text }]}>
                {row.result}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {points.map(point => (
        <View key={point} style={styles.point}>
          <Text style={[styles.note, { color: colors.textMuted }]}>•</Text>
          <Text
            style={[styles.note, styles.pointText, { color: colors.textMuted }]}
          >
            {point}
          </Text>
        </View>
      ))}

      <TextButton
        label={W.READ_TERMS}
        onPress={onReadTerms}
        testID="live-rules-terms"
        tone="primary"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    alignItems: 'stretch',
  },
  title: { fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 21 },
  note: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  rows: { borderWidth: 1, borderRadius: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  divider: { borderTopWidth: 1 },
  when: { flex: 1, fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  result: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'right',
  },
  point: { flexDirection: 'row', gap: 6 },
  pointText: { flex: 1 },
});
