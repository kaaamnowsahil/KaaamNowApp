import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { FlowHeading } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { useBusinessLiveStore } from '@/services/business/useBusinessLiveStore';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { LiveSearchRadius } from './components/LiveSearchRadius';
import {
  BUSINESS_LIVE_SEARCH_MOCK,
  findMockAcceptedWorkers,
  getMockWorkersNotifiedCount,
} from './mock';

export const BusinessLiveFindingPage: FC<
  AppScreenProps<typeof ROUTES.businessLiveFinding>
> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const request = useBusinessLiveStore(state => state.activeRequest);
  const cancelRequest = useBusinessLiveStore(state => state.cancelRequest);
  const publishRequest = useBusinessLiveStore(state => state.publishRequest);
  const acceptWorkers = useBusinessLiveStore(state => state.acceptWorkers);
  const [now, setNow] = useState(Date.now());
  const [handledExpiryAt, setHandledExpiryAt] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (
      request &&
      request.status === 'finding' &&
      now - request.createdAt >=
        BUSINESS_LIVE_SEARCH_MOCK.windowSeconds * 1000 &&
      handledExpiryAt !== request.createdAt
    ) {
      setHandledExpiryAt(request.createdAt);
      const openPositions =
        request.workers - request.acceptedWorkers.length;
      const newlyAcceptedWorkers = findMockAcceptedWorkers(
        request.acceptedWorkers,
        openPositions,
      );
      acceptWorkers(newlyAcceptedWorkers);
      const confirmedWorkers =
        request.acceptedWorkers.length + newlyAcceptedWorkers.length;
      if (confirmedWorkers >= request.workers && request.workers === 1) {
        navigation.replace(ROUTES.businessLiveTracking, {
          applicantId: newlyAcceptedWorkers[0].id,
        });
      } else if (confirmedWorkers >= request.workers) {
        navigation.replace(ROUTES.businessLiveAccepted);
      } else {
        navigation.replace(ROUTES.mainTabs, {
          screen: ROUTES.businessLive,
        });
      }
    }
  }, [acceptWorkers, handledExpiryAt, navigation, now, request]);

  if (!request) {
    return (
      <FormScreen
        onBack={navigation.goBack}
        title={t('businessApplicants.headerTitle')}
        subtitle={t('businessDashboard.liveStatus')}
        headerTag={t('businessApplicants.headerTag')}
        testID="business-live-finding-page"
      >
        <FlowHeading
          title={t('businessLiveCreate.requestUnavailable')}
          subtitle={t('businessLiveCreate.requestUnavailableBody')}
        />
        <PrimaryButton
          label={t('businessLiveCreate.createRequest')}
          onPress={() => navigation.replace(ROUTES.businessLiveCreate)}
        />
      </FormScreen>
    );
  }

  const elapsedSeconds = Math.floor((now - request.createdAt) / 1000);
  const remainingSeconds = Math.max(
    0,
    BUSINESS_LIVE_SEARCH_MOCK.windowSeconds - elapsedSeconds,
  );
  const isExpired = remainingSeconds === 0;
  const progress = remainingSeconds / BUSINESS_LIVE_SEARCH_MOCK.windowSeconds;
  const searchDuration = `${Math.floor(
    BUSINESS_LIVE_SEARCH_MOCK.windowSeconds / 60,
  )
    .toString()
    .padStart(2, '0')}:${(BUSINESS_LIVE_SEARCH_MOCK.windowSeconds % 60)
    .toString()
    .padStart(2, '0')}`;
  const countdown = `${Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}`;

  const switchToScheduled = () => {
    cancelRequest();
    navigation.replace(ROUTES.businessShiftSchedule);
  };

  const retry = () => {
    publishRequest({
      role: request.role,
      category: request.category,
      responsibilities: request.responsibilities,
      requirement: request.requirement,
      location: request.location,
      latitude: request.latitude,
      longitude: request.longitude,
      workplaceInstructions: request.workplaceInstructions,
      workers: String(request.workers),
      hourlyRate: String(request.hourlyRate),
      hours: String(request.hours),
      startTime: request.startTime,
      searchRadiusKm: request.searchRadiusKm,
      customPayAgreed: request.customPayAgreed,
    });
    setNow(Date.now());
  };

  const cancel = () =>
    Alert.alert(
      t('businessLiveCreate.cancelTitle'),
      t('businessLiveCreate.cancelBody'),
      [
        { text: t('businessLiveCreate.keepSearching'), style: 'cancel' },
        {
          text: t('businessLiveCreate.cancelRequest'),
          style: 'destructive',
          onPress: () => {
            cancelRequest();
            navigation.navigate(ROUTES.mainTabs, {
              screen: ROUTES.businessLive,
            });
          },
        },
      ],
    );

  return (
    <FormScreen
      onBack={cancel}
      title={t('businessApplicants.headerTitle')}
      subtitle={t(
        isExpired
          ? 'businessLiveCreate.liveNow'
          : 'businessDashboard.searchingStatus',
      )}
      headerTag={t('businessApplicants.headerTag')}
      gap={14}
      testID="business-live-finding-page"
      actions={
        <>
          {isExpired ? (
            <PrimaryButton
              label={t('businessLiveCreate.postAsShift')}
              onPress={switchToScheduled}
              testID="business-live-switch-scheduled"
            />
          ) : (
            <PrimaryButton
              label={t('businessLiveCreate.switchToScheduled')}
              onPress={switchToScheduled}
              testID="business-live-switch-scheduled"
            />
          )}
          {!isExpired ? (
            <SecondaryButton
              label={t('businessLiveCreate.cancelRequest')}
              onPress={cancel}
              tone="danger"
              testID="business-live-cancel"
            />
          ) : (
            <SecondaryButton
              label={t('businessLiveCreate.retryRequest')}
              onPress={retry}
              testID="business-live-retry"
            />
          )}
        </>
      }
    >
      {isExpired ? (
        <View style={styles.expiredHeading}>
          <View style={styles.expiredOverlineRow}>
            <View
              style={[
                styles.expiredOverlineDot,
                { backgroundColor: colors.primary },
              ]}
            />
            <Text style={[styles.expiredOverline, { color: colors.primary }]}>
              {t('businessLiveCreate.expiredOverline')}
            </Text>
          </View>
          <View
            style={[
              styles.expiredIcon,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Text style={[styles.expiredIconText, { color: colors.primary }]}>
              !
            </Text>
          </View>
          <Text
            accessibilityRole="header"
            style={[styles.expiredTitle, { color: colors.text }]}
          >
            {t('businessLiveCreate.noWorkerTitle')}
          </Text>
          <Text style={[styles.expiredBody, { color: colors.textMuted }]}>
            {t('businessLiveCreate.noWorkerBody')}
          </Text>
        </View>
      ) : (
        <FlowHeading
          overline={t('businessLiveCreate.findingOverline')}
          title={t('businessLiveCreate.findingTitle')}
          subtitle={t('businessLiveCreate.findingRadiusBody', {
            initialRadius: BUSINESS_LIVE_SEARCH_MOCK.initialRadiusKm,
            maxRadius: request.searchRadiusKm,
          })}
          isLarge
        />
      )}
      {!isExpired && request.acceptedWorkers.length > 0 ? (
        <View
          style={[
            styles.acceptedSummary,
            { backgroundColor: colors.fill, borderColor: colors.border },
          ]}
        >
          <View style={styles.acceptedSummaryHeader}>
            <Text style={[styles.acceptedSummaryTitle, { color: colors.text }]}>
              {t('businessLiveCreate.acceptedPositions', {
                accepted: request.acceptedWorkers.length,
                total: request.workers,
              })}
            </Text>
            <Text style={[styles.workerCount, { color: colors.primary }]}>
              {t('businessLiveCreate.findingPositions', {
                count: Math.max(
                  request.workers - request.acceptedWorkers.length,
                  0,
                ),
              })}
            </Text>
          </View>
          {request.acceptedWorkers.map((worker, index) => (
            <View
              key={worker.id}
              style={[
                styles.acceptedWorkerRow,
                index > 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.workerTitle, { color: colors.text }]}>
                {worker.name}
              </Text>
              <Text style={[styles.expiredStatus, { color: colors.success }]}>
                {t('businessLiveCreate.workerConfirmed')}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {!isExpired ? (
        <LiveSearchRadius
          innerRadius={BUSINESS_LIVE_SEARCH_MOCK.initialRadiusKm}
          outerRadius={request.searchRadiusKm}
        />
      ) : null}
      {!isExpired ? (
        <View
          style={[
            styles.timerCard,
            { backgroundColor: colors.fill, borderColor: colors.border },
          ]}
        >
          <View style={styles.timerRow}>
            <Text style={[styles.timer, { color: colors.text }]}>
              {countdown}
            </Text>
            <Text style={[styles.timerMaximum, { color: colors.textSubtle }]}>
              {t('businessLiveCreate.timerMaximum')}
            </Text>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 100,
              now: Math.round(progress * 100),
            }}
            style={[styles.progressTrack, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      ) : null}
      {isExpired ? (
        <View
          style={[
            styles.expiredRequestCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.workerCopy}>
            <Text style={[styles.workerTitle, { color: colors.text }]}>
              {t('businessLiveCreate.liveNow')}
            </Text>
            <Text style={[styles.workerSubtitle, { color: colors.textSubtle }]}>
              {t('businessLiveCreate.expiredAfter', { time: searchDuration })}
            </Text>
          </View>
          <Text style={[styles.expiredStatus, { color: colors.danger }]}>
            {t('businessLiveCreate.expired')}
          </Text>
        </View>
      ) : null}
      {request ? (
        <View
          style={[
            styles.workersCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.workerCopy}>
            <Text style={[styles.workerTitle, { color: colors.text }]}>
              {t('businessLiveCreate.workersNotified')}
            </Text>
            <Text style={[styles.workerSubtitle, { color: colors.textSubtle }]}>
              {t('businessLiveCreate.activeWorkersWithinRadius', {
                count: getMockWorkersNotifiedCount(),
                radius: request.searchRadiusKm,
              })}
            </Text>
          </View>
          {!isExpired ? (
            <Text style={[styles.workerCount, { color: colors.success }]}>
              {getMockWorkersNotifiedCount()}
            </Text>
          ) : null}
        </View>
      ) : null}
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  expiredHeading: { gap: 12 },
  expiredOverlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  expiredOverlineDot: { width: 6, height: 6, borderRadius: 3 },
  expiredOverline: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    lineHeight: 15,
  },
  expiredIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiredIconText: { fontFamily: FONTS.bold, fontSize: 26, lineHeight: 32 },
  expiredTitle: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 27 },
  expiredBody: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 19 },
  expiredRequestCard: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  expiredStatus: { fontFamily: FONTS.semiBold, fontSize: 10, lineHeight: 14 },
  timerCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timer: { fontFamily: FONTS.bold, fontSize: 24, lineHeight: 30 },
  timerMaximum: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 14 },
  progressTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  workersCard: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  workerCopy: { flex: 1, gap: 1 },
  workerTitle: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 16 },
  workerSubtitle: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 14 },
  workerCount: { fontFamily: FONTS.semiBold, fontSize: 10, lineHeight: 14 },
  acceptedSummary: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  acceptedSummaryHeader: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  acceptedSummaryTitle: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  acceptedWorkerRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
