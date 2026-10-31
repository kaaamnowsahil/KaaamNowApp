import type { FC, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { tr } from '@/services/i18n/tr';

import { FONTS } from '@/constants/fonts';
import {
  formatMinutes,
  formatPct,
  formatRupees,
} from '@/services/liveWork/liveWorkFormat';
import { LIVE_TEXT as S } from '@/services/liveWork/liveWorkStrings';
import type {
  LiveExtensionQuote,
  LivePriceBreakdown,
} from '@/services/liveWork/liveWorkTypes';
import { useTheme } from '@/theme/ThemeProvider';

export const LiveCard: FC<{ children: ReactNode; testID?: string }> = ({
  children,
  testID,
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
};

export const LiveText: FC<{
  children: ReactNode;
  tone?: 'default' | 'muted' | 'label' | 'danger' | 'title' | 'strong';
  testID?: string;
}> = ({ children, tone = 'default', testID }) => {
  const { colors } = useTheme();
  const color =
    tone === 'muted'
      ? colors.textSubtle
      : tone === 'label'
      ? colors.primary
      : tone === 'danger'
      ? colors.danger
      : colors.text;
  return (
    <Text
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}
      style={[styles[tone === 'default' ? 'body' : tone], { color }]}
      testID={testID}
    >
      {children}
    </Text>
  );
};

export const PriceRow: FC<{
  label: string;
  value: string;
  strong?: boolean;
}> = ({ label, value, strong }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
      <Text
        style={[strong ? styles.strong : styles.body, { color: colors.text }]}
      >
        {value}
      </Text>
    </View>
  );
};

/** Base, commission and tax shown separately; the total is exactly what the server charges. */
export const LivePriceBreakdownCard: FC<{ price: LivePriceBreakdown }> = ({
  price,
}) => {
  const isTask = price.pricing_mode === 'task';
  const workers = price.workers_required ?? 1;
  return (
    <LiveCard testID="live-price-breakdown">
      <LiveText tone="title">{S.priceTitle}</LiveText>
      <PriceRow
        label={
          isTask
            ? tr('taskPricing.taskLine')
            : S.baseLine(
                formatRupees(price.hourly_rate_minor),
                formatMinutes(price.reserved_minutes),
              )
        }
        value={formatRupees(price.base_amount_minor)}
      />
      <PriceRow
        label={S.commissionLine(formatPct(price.commission_pct))}
        value={formatRupees(price.commission_minor)}
      />
      {price.promo_discount_minor > 0 ? (
        <PriceRow
          label={S.couponLine(price.promo_code ?? '')}
          value={`−${formatRupees(price.promo_discount_minor)}`}
        />
      ) : null}
      <PriceRow
        label={S.gatewayLine}
        value={formatRupees(price.tax_minor)}
      />
      <PriceRow
        label={S.total}
        strong
        value={formatRupees(price.total_minor)}
      />
      {workers > 1 ? (
        <LiveText tone="strong" testID="live-per-worker-total">
          {S.perWorkerTotal(
            formatRupees(price.total_minor),
            workers,
            formatRupees(
              price.booking_total_minor ?? price.total_minor * workers,
            ),
          )}
        </LiveText>
      ) : null}
      {isTask ? (
        <LiveText tone="muted">{tr('taskPricing.taskNote')}</LiveText>
      ) : (
        <>
          <LiveText tone="muted">{S.reservedNote}</LiveText>
          <LiveText tone="muted">
            {S.extensionNote(
              formatRupees(price.extension_rate_minor),
              formatPct(price.extension_surcharge_pct),
            )}
          </LiveText>
        </>
      )}
    </LiveCard>
  );
};

/** Workers to book: − count +, bounded by 1 and the server's limit once known. */
export const WorkerCountStepper: FC<{
  value: number;
  max: number | null;
  disabled?: boolean;
  error?: string;
  /** Shown under the stepper for more than one Worker; ``null`` hides it. */
  hint?: string | null;
  testID?: string;
  onChange: (value: number) => void;
}> = ({
  value,
  max,
  disabled,
  error,
  hint = S.workersHint,
  testID = 'live-workers',
  onChange,
}) => {
  const { colors } = useTheme();
  const step = (label: string, symbol: string, next: number, off: boolean) => (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: off }}
      disabled={off}
      hitSlop={6}
      onPress={() => onChange(next)}
      style={[
        styles.stepButton,
        { borderColor: colors.border },
        off && styles.stepOff,
      ]}
      testID={`${testID}-${symbol === '+' ? 'more' : 'fewer'}`}
    >
      <Text style={[styles.title, { color: colors.text }]}>{symbol}</Text>
    </Pressable>
  );
  return (
    <View style={styles.stack} testID={`${testID}-stepper`}>
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>
        {S.workersLabel}
      </Text>
      <View style={styles.stepper}>
        {step(S.workersFewer, '−', value - 1, Boolean(disabled) || value <= 1)}
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.title, styles.stepValue, { color: colors.text }]}
          testID={`${testID}-value`}
        >
          {value}
        </Text>
        {step(
          S.workersMore,
          '+',
          value + 1,
          Boolean(disabled) || (max !== null && value >= max),
        )}
      </View>
      {value > 1 && hint ? <LiveText tone="muted">{hint}</LiveText> : null}
      {error ? <LiveText tone="danger">{error}</LiveText> : null}
    </View>
  );
};

export const LiveExtensionBreakdown: FC<{ quote: LiveExtensionQuote }> = ({
  quote,
}) => (
  <View style={styles.stack}>
    <PriceRow
      label={S.extOriginal}
      value={formatMinutes(quote.original_minutes)}
    />
    <PriceRow
      label={S.extAdditional}
      value={formatMinutes(quote.additional_minutes)}
    />
    <PriceRow
      label={S.extBaseRate}
      value={`${formatRupees(quote.base_rate_minor)}/h`}
    />
    <PriceRow label={S.extSurcharge} value={formatPct(quote.surcharge_pct)} />
    <PriceRow
      label={S.extRate}
      value={`${formatRupees(quote.extension_rate_minor)}/h`}
    />
    <PriceRow
      label={S.extBase}
      value={formatRupees(quote.additional_base_minor)}
    />
    <PriceRow
      label={S.commissionLine(formatPct(quote.commission_pct))}
      value={formatRupees(quote.commission_minor)}
    />
    <PriceRow
      label={S.gatewayLine}
      value={formatRupees(quote.tax_minor)}
    />
    <PriceRow
      label={S.extPay}
      strong
      value={formatRupees(quote.additional_total_minor)}
    />
    <PriceRow
      label={S.extRevisedDuration}
      value={formatMinutes(quote.revised_minutes)}
    />
    <PriceRow
      label={S.extRevisedTotal}
      value={formatRupees(quote.revised_total_minor)}
    />
  </View>
);

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
  stack: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  body: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 21 },
  muted: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  danger: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 19 },
  title: { fontFamily: FONTS.bold, fontSize: 17, lineHeight: 24 },
  strong: { fontFamily: FONTS.bold, fontSize: 15, lineHeight: 22 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepOff: { opacity: 0.4 },
  stepButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { minWidth: 28, textAlign: 'center' },
});
