import type { FC } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FlowHeading } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useBusinessLiveStore } from '@/services/business/useBusinessLiveStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

export const BusinessLivePaymentPage: FC<
  AppScreenProps<typeof ROUTES.businessLivePayment>
> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const request = useBusinessLiveStore(state => state.activeRequest);
  if (!request) {
    return (
      <FormScreen
        onBack={navigation.goBack}
        title={t('businessApplicants.headerTitle')}
        subtitle={t('businessLiveCreate.liveNow')}
        testID="business-live-payment-page"
      >
        <FlowHeading
          title={t('businessLiveCreate.requestUnavailable')}
          subtitle={t('businessLiveCreate.requestUnavailableBody')}
        />
      </FormScreen>
    );
  }
  const acceptedWorkers = request.acceptedWorkers;
  const hourlyRate = request.hourlyRate;
  const hours = request.hours;
  const subtotal = acceptedWorkers.length * hourlyRate * hours;
  const fee = Math.round(subtotal * 0.05);
  const total = subtotal + fee;
  const date = new Intl.DateTimeFormat(i18n.language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('businessApplicants.headerTitle')}
      subtitle={t('businessLiveCreate.liveNow')}
      headerTag={t('businessLiveCreate.businessTag')}
      gap={12}
      testID="business-live-payment-page"
      actions={
        <>
          <PrimaryButton
            label={t('businessLiveCreate.confirmPayment', {
              amount: formatRupees(total),
            })}
            onPress={() => navigation.navigate(ROUTES.businessPaymentMethod)}
            testID="business-live-confirm-payment"
          />
          <SecondaryButton
            label={t('businessLiveCreate.reviewAttendance')}
            onPress={() =>
              Alert.alert(t('businessLiveCreate.attendanceReviewUnavailable'))
            }
            testID="business-live-review-attendance"
          />
        </>
      }
    >
      <Text style={[styles.overline, { color: colors.primary }]}>
        {t('businessLiveCreate.finalCostOverline')}
      </Text>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
        {t('businessLiveCreate.finalCostTitle')}
      </Text>

      <View style={[styles.summary, { backgroundColor: colors.fill }]}>
        <Text style={[styles.summaryLabel, { color: colors.textSubtle }]}>
          {t('businessLiveCreate.finalCostOverline')}
        </Text>
        <Text style={[styles.total, { color: colors.text }]}>
          {formatRupees(total)}
        </Text>
        <Text style={[styles.summaryMeta, { color: colors.textSubtle }]}>
          {t('businessLiveCreate.finalCostDate', { date })}
        </Text>
      </View>

      <View style={[styles.lineItems, { borderColor: colors.border }]}>
        {acceptedWorkers.map(worker => (
          <Pressable
            key={worker.id}
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate(ROUTES.businessApplicantProfile, {
                applicantId: worker.id,
              })
            }
            style={[
              styles.lineItem,
              { borderBottomColor: colors.border },
            ]}
          >
            <View style={styles.copy}>
              <Text style={[styles.name, { color: colors.text }]}>
                {worker.name}
              </Text>
              <Text style={[styles.meta, { color: colors.textSubtle }]}>
                {hours} × {formatRupees(hourlyRate)} ={' '}
                {formatRupees(hours * hourlyRate)}
              </Text>
            </View>
            <Text style={[styles.chevron, { color: colors.textSubtle }]}>›</Text>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            Alert.alert(t('businessLiveCreate.attendanceReviewUnavailable'))
          }
          style={[styles.lineItem, { borderBottomColor: colors.border }]}
        >
          <View style={styles.copy}>
            <Text style={[styles.name, { color: colors.text }]}>
              {t('businessLiveCreate.platformFee')}
            </Text>
            <Text style={[styles.meta, { color: colors.textSubtle }]}>
              {t('businessLiveCreate.platformFeeMeta', {
                subtotal: formatRupees(subtotal),
                fee: formatRupees(fee),
              })}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textSubtle }]}>›</Text>
        </Pressable>
      </View>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  overline: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    lineHeight: 14,
  },
  title: { fontFamily: FONTS.bold, fontSize: 21, lineHeight: 28 },
  summary: {
    minHeight: 96,
    justifyContent: 'center',
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  summaryLabel: { fontFamily: FONTS.regular, fontSize: 9, lineHeight: 13 },
  total: { fontFamily: FONTS.bold, fontSize: 26, lineHeight: 32 },
  summaryMeta: { fontFamily: FONTS.regular, fontSize: 9, lineHeight: 13 },
  lineItems: { borderTopWidth: StyleSheet.hairlineWidth },
  lineItem: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 7,
  },
  copy: { flex: 1, gap: 1 },
  name: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15 },
  meta: { fontFamily: FONTS.regular, fontSize: 9, lineHeight: 13 },
  chevron: { fontFamily: FONTS.regular, fontSize: 22, lineHeight: 26 },
});
