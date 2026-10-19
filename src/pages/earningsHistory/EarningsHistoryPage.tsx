import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EarningsRowItem } from '@/components/earnings';
import { SectionHeading } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import type { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

import { EARNINGS_HISTORY_STRINGS as S } from './constants';
import { PAYOUT_MONTHS } from './mock';

/**
 * Earnings → View all earnings. Rows reuse the Figma Earnings (08) list style.
 * - data: mock/earningsHistoryMock.ts
 */
export const EarningsHistoryPage: FC<
  AppScreenProps<typeof ROUTES.earningsHistory>
> = ({ navigation }) => {
  const { colors } = useTheme();
  const isLoading = useMockLoading();

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={S.TITLE}
      gap={12}
      isLoading={isLoading}
      testID="earnings-history-page"
    >
      {PAYOUT_MONTHS.map(month => (
        <View key={month.id} style={styles.month}>
          <SectionHeading title={month.label} />
          <Text style={[styles.total, { color: colors.textSubtle }]}>
            {S.monthTotal(
              formatRupees(month.payouts.reduce((sum, p) => sum + p.amount, 0)),
            )}
          </Text>
          <View>
            {month.payouts.map((p, i) => (
              <EarningsRowItem
                key={p.id}
                title={S.title(p.shiftTitle, p.dateLabel)}
                meta={S.meta(p.businessName, p.hours, formatRupees(p.amount))}
                status={p.status}
                statusLabel={S.STATUS[p.status]}
                isLast={i === month.payouts.length - 1}
              />
            ))}
          </View>
        </View>
      ))}
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  month: { gap: 2, marginBottom: 12 },
  total: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
});
