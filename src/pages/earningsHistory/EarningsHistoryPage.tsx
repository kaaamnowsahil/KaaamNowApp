import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import WalletIcon from '@/assets/figma/wallet.svg';
import { EarningsRowItem } from '@/components/earnings';
import { EmptyState, SectionHeading } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { WORKER_EARNINGS_STRINGS as S } from '@/pages/workerEarnings/constants';
import { earningsApi, type LedgerEntry } from '@/services/earnings/earningsApi';
import { formatDateLabel, fromMinor } from '@/services/shifts/shiftMappers';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type MonthGroup = { key: string; label: string; earned: number; entries: LedgerEntry[] };

/** Ledger entries arrive newest first; group them by calendar month. */
const groupByMonth = (entries: LedgerEntry[]): MonthGroup[] => {
  const groups: MonthGroup[] = [];
  for (const entry of entries) {
    const date = new Date(entry.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    let group = groups.find(item => item.key === key);
    if (!group) {
      group = {
        key,
        label: `${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
        earned: 0,
        entries: [],
      };
      groups.push(group);
    }
    if (entry.amount_minor > 0) group.earned += entry.amount_minor;
    group.entries.push(entry);
  }
  return groups;
};

const signedRupees = (minor: number) =>
  `${minor < 0 ? '−' : '+'}${formatRupees(fromMinor(Math.abs(minor)))}`;

/**
 * Earnings → View all earnings, grouped by month.
 * - data: GET /worker/earnings/entries
 */
export const EarningsHistoryPage: FC<
  AppScreenProps<typeof ROUTES.earningsHistory>
> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const query = useApiQuery(() => earningsApi.entries(), []);
  const months = groupByMonth(query.data?.items ?? []);

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('earningsHistory.title')}
      gap={12}
      isLoading={query.isLoading}
      fillLastBlock={months.length === 0}
      testID="earnings-history-page"
    >
      {months.length === 0 ? (
        <EmptyState icon={WalletIcon} title={t('earningsHistory.title')} body={S.EMPTY} />
      ) : null}
      {months.map(month => (
        <View key={month.key} style={styles.month}>
          <SectionHeading title={month.label} />
          <Text style={[styles.total, { color: colors.textSubtle }]}>
            {t('earningsHistory.monthTotal', {
              total: formatRupees(fromMinor(month.earned)),
            })}
          </Text>
          <View>
            {month.entries.map((entry, i) => {
              const title = entry.description || S.ENTRY_TYPE[entry.entry_type];
              const dateLabel = formatDateLabel(entry.created_at);
              const status = entry.amount_minor < 0 ? 'failed' : 'completed';
              return (
                <EarningsRowItem
                  key={entry.id}
                  title={title}
                  meta={`${dateLabel} · ${signedRupees(entry.amount_minor)}`}
                  status={status}
                  statusLabel={S.ENTRY_TYPE[entry.entry_type]}
                  isLast={i === month.entries.length - 1}
                  onPress={() =>
                    navigation.navigate(ROUTES.workerEarningDetail, {
                      earning: {
                        id: entry.id,
                        title,
                        amount: fromMinor(entry.amount_minor),
                        status,
                        dateLabel,
                      },
                    })
                  }
                />
              );
            })}
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
