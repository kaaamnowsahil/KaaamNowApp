import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import CheckIcon from '@/assets/icons/check.svg';
import { SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

export const WorkerEarningDetailPage: FC<
  AppScreenProps<typeof ROUTES.workerEarningDetail>
> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { earning } = route.params;
  const isCompleted = earning.status === 'completed';
  const statusColor =
    earning.status === 'completed'
      ? colors.success
      : earning.status === 'failed'
        ? colors.danger
        : colors.warning;
  const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('workerEarnings.detailTitle')}
      gap={14}
      testID="worker-earning-detail-page"
      actions={
        <SecondaryButton
          label={t('earningsHistory.title')}
          onPress={navigation.goBack}
          testID="worker-earning-detail-history"
        />
      }
    >
      <View style={styles.summary}>
        <View
          style={[
            styles.statusIcon,
            {
              backgroundColor: isCompleted
                ? colors.successSoft
                : earning.status === 'failed'
                  ? colors.dangerSoft
                  : colors.fill,
            },
          ]}
        >
          {isCompleted ? (
            <CheckIcon width={22} height={22} color={colors.success} />
          ) : (
            <Text style={[styles.pendingIcon, { color: colors.warning }]}>!</Text>
          )}
        </View>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatRupees(earning.amount)}
        </Text>
        <Text
          style={[
            styles.status,
            { color: statusColor },
          ]}
        >
          {t(`workerEarnings.status.${earning.status}`)}
        </Text>
      </View>

      <View
        style={[
          styles.details,
          { backgroundColor: colors.fill, borderColor: colors.border },
        ]}
      >
        <Detail label={t('workerEarningDetail.shift')} value={earning.title} />
        {earning.businessName ? (
          <Detail
            label={t('workerEarningDetail.business')}
            value={earning.businessName}
          />
        ) : null}
        {earning.dateLabel ? (
          <Detail
            label={t('workerEarningDetail.date')}
            value={earning.dateLabel}
          />
        ) : null}
        {earning.hours !== undefined && earning.hours > 0 ? (
          <Detail
            label={t('workerEarningDetail.hours')}
            value={t('workerEarningDetail.hoursValue', {
              hours: earning.hours,
            })}
          />
        ) : null}
        {earning.rate !== undefined && earning.rate > 0 ? (
          <Detail
            label={t('workerEarningDetail.rate')}
            value={`${formatRupees(earning.rate)} / ${t(
              'workerEarningDetail.hour',
            )}`}
          />
        ) : null}
        {earning.shifts !== undefined && earning.shifts > 0 ? (
          <Detail
            label={t('workerEarningDetail.shifts')}
            value={String(earning.shifts)}
          />
        ) : null}
        {earning.method ? (
          <Detail
            label={t('workerEarningDetail.method')}
            value={earning.method}
          />
        ) : null}
        {earning.destination ? (
          <Detail
            label={t('workerEarningDetail.destination')}
            value={earning.destination}
          />
        ) : null}
        {earning.requestedAt ? (
          <Detail
            label={t('workerEarningDetail.requestedAt')}
            value={formatDateTime(earning.requestedAt)}
          />
        ) : null}
        {earning.processedAt ? (
          <Detail
            label={t('workerEarningDetail.processedAt')}
            value={formatDateTime(earning.processedAt)}
          />
        ) : null}
        {earning.failureReason ? (
          <Detail
            label={t('workerEarningDetail.failureReason')}
            value={earning.failureReason}
          />
        ) : null}
        <Detail
          label={t('workerEarningDetail.reference')}
          value={earning.reference ?? earning.id}
        />
      </View>
    </FormScreen>
  );
};

const Detail: FC<{ label: string; value: string }> = ({ label, value }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.detail, { borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.textSubtle }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  summary: { alignItems: 'center', gap: 5, paddingVertical: 8 },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  amount: { fontFamily: FONTS.bold, fontSize: 26, lineHeight: 32 },
  pendingIcon: { fontFamily: FONTS.bold, fontSize: 22 },
  status: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 16 },
  details: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12 },
  detail: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 15 },
  value: {
    flexShrink: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'right',
  },
});
