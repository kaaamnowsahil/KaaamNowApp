import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { formatRupees } from '@/services/liveWork/liveWorkFormat';
import { LIVE_TEXT as S } from '@/services/liveWork/liveWorkStrings';
import { useTheme } from '@/theme/ThemeProvider';

import { LiveCard, LiveText } from './LiveWorkUi';

type Props = {
  round: number;
  maxRounds: number;
  options: number[];
  isTask: boolean;
  busy: boolean;
  /** Countdown text while the Business can still choose; null once the choice is closed. */
  timeLeft: string | null;
  onBoost: (boostMinor: number) => void;
  onRefund: () => void;
};

/** While searching: "Search X of N" with the running search highlighted. */
export const LiveSearchRound: FC<{ round: number; maxRounds: number }> = ({
  round,
  maxRounds,
}) => {
  const { colors } = useTheme();
  const current = Math.min(round, maxRounds);
  return (
    <View style={styles.round} testID="business-live-work-search-round">
      <View style={styles.head}>
        <View style={styles.headTitle}>
          <LiveText tone="title">{S.searching}</LiveText>
        </View>
        <Text
          style={[
            styles.count,
            { color: colors.primary, backgroundColor: colors.primarySoft },
          ]}
        >
          {S.retrySearchCount(current, maxRounds)}
        </Text>
      </View>
      <View style={styles.steps}>
        {Array.from({ length: maxRounds }, (_, i) => (
          <View
            key={i}
            style={[
              styles.step,
              { backgroundColor: i < current ? colors.primary : colors.border },
              i === current - 1 && styles.stepCurrent,
            ]}
          />
        ))}
      </View>
      {current < maxRounds ? (
        <LiveText tone="muted">{S.searchStepHint(maxRounds)}</LiveText>
      ) : null}
    </View>
  );
};

/** Nobody accepted: search X of N, add-on choices and refund; all disabled after the last. */
export const LiveRetryPanel: FC<Props> = ({
  round,
  maxRounds,
  options,
  isTask,
  busy,
  timeLeft,
  onBoost,
  onRefund,
}) => {
  const { colors } = useTheme();
  const open = timeLeft !== null;
  const used = Math.min(round, maxRounds);
  const usedColor = open ? colors.primary : colors.textSubtle;

  return (
    <LiveCard testID="business-live-work-retry">
      <View style={styles.head}>
        <View style={styles.headTitle}>
          <LiveText tone="title">
            {open ? S.retryTitle : S.retryClosedTitle}
          </LiveText>
        </View>
        <Text
          style={[
            styles.count,
            { color: colors.primary, backgroundColor: colors.primarySoft },
          ]}
        >
          {S.retrySearchCount(used, maxRounds)}
        </Text>
      </View>
      <View style={styles.steps}>
        {Array.from({ length: maxRounds }, (_, i) => (
          <View
            key={i}
            style={[
              styles.step,
              { backgroundColor: i < used ? usedColor : colors.border },
            ]}
          />
        ))}
      </View>

      {open ? (
        <View style={[styles.timer, { backgroundColor: colors.fill }]}>
          <Text style={[styles.timerStrong, { color: colors.warning }]}>
            {S.retryTimer(timeLeft)}
          </Text>
          <Text style={[styles.timerNote, { color: colors.textMuted }]}>
            {S.retryAutoRefund}
          </Text>
        </View>
      ) : null}

      <LiveText tone="strong">
        {open
          ? S.retryPickBoost
          : round >= maxRounds
          ? S.retryAllUsed(maxRounds)
          : S.retryTimeUp}
      </LiveText>
      <View style={styles.options}>
        {options.map(option => {
          const disabled = !open || busy;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ disabled }}
              disabled={disabled}
              onPress={() => onBoost(option)}
              testID={`business-live-work-boost-${option}`}
              style={({ pressed }) => [
                styles.option,
                disabled
                  ? { borderColor: colors.border, backgroundColor: colors.fill }
                  : {
                      borderColor: colors.primary,
                      backgroundColor: pressed
                        ? colors.primary
                        : colors.primarySoft,
                    },
              ]}
            >
              {({ pressed }) => {
                const color = disabled
                  ? colors.textSubtle
                  : pressed
                  ? colors.onPrimary
                  : colors.primary;
                return (
                  <>
                    <Text style={[styles.optionAmount, { color }]}>
                      +{formatRupees(option)}
                    </Text>
                    <Text style={[styles.optionUnit, { color }]}>
                      {isTask ? S.retryOnTask : S.retryPerHour}
                    </Text>
                  </>
                );
              }}
            </Pressable>
          );
        })}
      </View>

      {open ? (
        <>
          <LiveText tone="muted">
            {isTask ? S.retryBilledTask : S.retryBilledHourly}
          </LiveText>
          <SecondaryButton
            label={S.retryRefund}
            tone="danger"
            onPress={onRefund}
            disabled={busy}
            testID="business-live-work-retry-refund"
          />
        </>
      ) : (
        <LiveText tone="muted">{S.noWorkers}</LiveText>
      )}
    </LiveCard>
  );
};

const styles = StyleSheet.create({
  round: { gap: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headTitle: { flex: 1 },
  count: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  steps: { flexDirection: 'row', gap: 6 },
  step: { flex: 1, height: 6, borderRadius: 999 },
  stepCurrent: { opacity: 0.55 },
  timer: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  timerStrong: { fontFamily: FONTS.bold, fontSize: 14 },
  timerNote: { fontFamily: FONTS.regular, fontSize: 12 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    flexGrow: 1,
    flexBasis: 84,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 8,
    gap: 2,
  },
  optionAmount: { fontFamily: FONTS.bold, fontSize: 18 },
  optionUnit: { fontFamily: FONTS.regular, fontSize: 11 },
});
