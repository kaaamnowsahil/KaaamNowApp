import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FlowHeading } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useBusinessLiveStore } from '@/services/business/useBusinessLiveStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

export const BusinessLiveStaffingPage: FC<
  AppScreenProps<typeof ROUTES.businessLiveStaffing>
> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const request = useBusinessLiveStore(state => state.activeRequest);
  const resumeFinding = useBusinessLiveStore(state => state.resumeFinding);

  if (!request || request.acceptedWorkers.length === 0) {
    return (
      <FormScreen
        onBack={navigation.goBack}
        title={t('businessApplicants.headerTitle')}
        subtitle={t('businessLiveCreate.liveNow')}
        testID="business-live-staffing-page"
      >
        <FlowHeading
          title={t('businessLiveCreate.requestUnavailable')}
          subtitle={t('businessLiveCreate.requestUnavailableBody')}
        />
        <PrimaryButton
          label={t('businessDashboard.heading')}
          onPress={() =>
            navigation.navigate(ROUTES.mainTabs, {
              screen: ROUTES.businessLive,
            })
          }
        />
      </FormScreen>
    );
  }

  const acceptedWorkers = request.acceptedWorkers;
  const openPositions = Math.max(request.workers - acceptedWorkers.length, 0);
  const findRemainingWorkers = () => {
    resumeFinding();
    navigation.navigate(ROUTES.businessLiveFinding);
  };

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('businessApplicants.headerTitle')}
      subtitle={t('businessLiveCreate.liveNow')}
      gap={12}
      testID="business-live-staffing-page"
      actions={
        <View style={styles.actions}>
          <PrimaryButton
            label={t('businessLiveCreate.notifyNearbyWorkers')}
            onPress={findRemainingWorkers}
            disabled={openPositions === 0}
            testID="business-live-notify-nearby"
          />
          <SecondaryButton
            label={t('businessLiveCreate.manageLiveActions')}
            onPress={() => navigation.navigate(ROUTES.businessLivePayment)}
            testID="business-live-manage-actions"
          />
        </View>
      }
    >
      <View style={styles.staffingHeading}>
        <Text style={[styles.overline, { color: colors.primary }]}>
          {t('businessLiveCreate.partiallyStaffed')}
        </Text>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          {request.role} · {t('businessLiveCreate.liveLabel')}
        </Text>
      </View>
      <View style={styles.metrics}>
        <View style={[styles.metric, { backgroundColor: colors.fill }]}>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {acceptedWorkers.length} / {request.workers}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSubtle }]}>
            {t('businessLiveCreate.confirmedLabel')}
          </Text>
        </View>
        <View style={[styles.metric, { backgroundColor: colors.fill }]}>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {openPositions}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSubtle }]}>
            {t('businessLiveCreate.openPosition')}
          </Text>
        </View>
      </View>
      <View style={[styles.roster, { borderColor: colors.border }]}>
        {acceptedWorkers.map((worker, index) => (
          <Pressable
            key={worker.id}
            accessibilityRole="button"
            accessibilityLabel={t('businessLiveCreate.trackWorker', {
              name: worker.name,
            })}
            onPress={() =>
              navigation.navigate(ROUTES.businessLiveTracking, {
                applicantId: worker.id,
              })
            }
            style={[
              styles.rosterRow,
              index > 0 && {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
              },
            ]}
          >
            <View style={styles.rosterCopy}>
              <Text style={[styles.workerName, { color: colors.text }]}>
                {worker.name}
              </Text>
              <Text style={[styles.workerMeta, { color: colors.textSubtle }]}>
                {t('businessLiveCreate.workerCredentials', {
                  category: worker.category,
                  rating: worker.rating.toFixed(1),
                })}
              </Text>
            </View>
            <Text style={[styles.workerStatus, { color: colors.success }]}>
              {t('businessLiveCreate.workerConfirmed')}
            </Text>
            <Text
              accessibilityElementsHidden
              style={[styles.rowChevron, { color: colors.textSubtle }]}
            >
              ›
            </Text>
          </Pressable>
        ))}
        {openPositions > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('businessLiveCreate.findRemainingWorkers', {
              count: openPositions,
            })}
            onPress={findRemainingWorkers}
            style={[
              styles.rosterRow,
              {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
              },
            ]}
          >
            <View style={styles.rosterCopy}>
              <Text style={[styles.workerName, { color: colors.text }]}>
                {t('businessLiveCreate.openPosition')}
              </Text>
              <Text style={[styles.workerMeta, { color: colors.textSubtle }]}>
                {t('businessLiveCreate.eligibleWorkersNeeded', {
                  count: openPositions,
                })}
              </Text>
            </View>
            <Text style={[styles.openStatus, { color: colors.primary }]}>
              {t('businessLiveCreate.openLabel')}
            </Text>
            <Text
              accessibilityElementsHidden
              style={[styles.rowChevron, { color: colors.textSubtle }]}
            >
              ›
            </Text>
          </Pressable>
        ) : null}
      </View>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  staffingHeading: { gap: 4 },
  overline: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    lineHeight: 14,
  },
  title: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 27 },
  metrics: { flexDirection: 'row', gap: 10 },
  metric: {
    flex: 1,
    minHeight: 58,
    justifyContent: 'center',
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  metricValue: { fontFamily: FONTS.bold, fontSize: 18, lineHeight: 24 },
  metricLabel: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 14 },
  roster: { borderTopWidth: StyleSheet.hairlineWidth },
  rosterRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 7,
  },
  rosterCopy: { flex: 1, gap: 1 },
  workerName: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16 },
  workerMeta: { fontFamily: FONTS.regular, fontSize: 9, lineHeight: 13 },
  workerStatus: { fontFamily: FONTS.semiBold, fontSize: 9, lineHeight: 13 },
  rowChevron: { fontFamily: FONTS.regular, fontSize: 20, lineHeight: 24 },
  openStatus: { fontFamily: FONTS.semiBold, fontSize: 9, lineHeight: 13 },
  actions: { gap: 8 },
});
