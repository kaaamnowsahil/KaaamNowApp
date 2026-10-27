import type { FC, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
}) => (
  <LiveCard testID="live-price-breakdown">
    <LiveText tone="title">{S.priceTitle}</LiveText>
    <PriceRow
      label={S.baseLine(
        formatRupees(price.hourly_rate_minor),
        formatMinutes(price.reserved_minutes),
      )}
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
      label={`${price.tax_label} (${formatPct(price.tax_pct)})`}
      value={formatRupees(price.tax_minor)}
    />
    <LiveText tone="muted">{price.tax_base_description}</LiveText>
    <PriceRow label={S.total} strong value={formatRupees(price.total_minor)} />
    <LiveText tone="muted">{S.reservedNote}</LiveText>
    <LiveText tone="muted">
      {S.extensionNote(
        formatRupees(price.extension_rate_minor),
        formatPct(price.extension_surcharge_pct),
      )}
    </LiveText>
  </LiveCard>
);

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
      label={`${quote.tax_label} (${formatPct(quote.tax_pct)})`}
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
});
