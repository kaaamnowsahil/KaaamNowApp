import type { FC } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FlowHeading, MapPreview } from '@/components/shiftFlow';
import { PrimaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useBusinessLiveStore } from '@/services/business/useBusinessLiveStore';
import { useBusinessPaymentStore } from '@/services/business/useBusinessPaymentStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

export const BusinessLiveTrackingPage: FC<
  AppScreenProps<typeof ROUTES.businessLiveTracking>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const request = useBusinessLiveStore(state => state.activeRequest);
  const reachedWorkerIds = useBusinessPaymentStore(
    state => state.reachedWorkerIds,
  );
  const completedWorkerIds = useBusinessPaymentStore(
    state => state.completedWorkerIds,
  );
  const markWorkerReached = useBusinessPaymentStore(
    state => state.markWorkerReached,
  );
  const markWorkerCompleted = useBusinessPaymentStore(
    state => state.markWorkerCompleted,
  );
  const acceptedWorkers = request?.acceptedWorkers ?? [];
  const requestedIndex = route.params?.applicantId
    ? acceptedWorkers.findIndex(item => item.id === route.params?.applicantId)
    : 0;
  const workerIndex = requestedIndex < 0 ? -1 : requestedIndex;
  const worker = workerIndex < 0 ? undefined : acceptedWorkers[workerIndex];
  const previousWorker = acceptedWorkers[workerIndex - 1];
  const nextWorker = acceptedWorkers[workerIndex + 1];

  if (!worker) {
    return (
      <FormScreen
        onBack={navigation.goBack}
        title={t('businessApplicants.headerTitle')}
        subtitle={t('businessLiveCreate.liveNow')}
        testID="business-live-tracking-page"
      >
        <FlowHeading
          title={t('businessLiveCreate.workerTrackingUnavailable')}
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

  const firstName = worker.name.split(' ')[0];
  const workerReached = reachedWorkerIds.includes(worker.id);
  const workerCompleted = completedWorkerIds.includes(worker.id);
  const handleShiftProgress = () => {
    if (!workerReached) {
      markWorkerReached(worker.id);
      return;
    }
    if (!workerCompleted) markWorkerCompleted(worker.id);
    navigation.navigate(ROUTES.businessLivePayment);
  };

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('businessApplicants.headerTitle')}
      subtitle={t('businessLiveCreate.liveNow')}
      headerTag={t('businessLiveCreate.businessTag')}
      gap={12}
      testID="business-live-tracking-page"
      actions={
        <View style={styles.actionGroup}>
          <PrimaryButton
            label={
              workerCompleted
                ? t('businessLiveCreate.goToPayment')
                : workerReached
                  ? t('businessLiveCreate.completeShift')
                  : t('businessLiveCreate.markWorkerReached', {
                      name: firstName,
                    })
            }
            onPress={handleShiftProgress}
            testID="business-live-worker-progress"
          />
          <View style={styles.contactActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                Alert.alert(t('businessLiveCreate.messageWorkerUnavailable'))
              }
              style={({ pressed }) => [
                styles.contactButton,
                { borderColor: colors.primary },
                pressed && styles.pressed,
              ]}
              testID="business-live-message-worker"
            >
              <Text style={[styles.contactLabel, { color: colors.primary }]}>
                {t('businessLiveCreate.messageWorker', { name: firstName })}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                Alert.alert(t('businessLiveCreate.callWorkerUnavailable'))
              }
              style={({ pressed }) => [
                styles.contactButton,
                { borderColor: colors.primary },
                pressed && styles.pressed,
              ]}
              testID="business-live-call-worker"
            >
              <Text style={[styles.contactLabel, { color: colors.primary }]}>
                {t('businessLiveCreate.callWorker', { name: firstName })}
              </Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <FlowHeading
        overline={t('businessLiveCreate.acceptedOverline')}
        tone="success"
        title={t('businessLiveCreate.trackingTitle', { name: firstName })}
      />
      {acceptedWorkers.length > 1 ? (
        <View style={styles.workerNavigation}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              previousWorker
                ? t('businessLiveCreate.trackWorker', {
                    name: previousWorker.name,
                  })
                : undefined
            }
            accessibilityState={{ disabled: !previousWorker }}
            disabled={!previousWorker}
            onPress={() =>
              previousWorker &&
              navigation.setParams({ applicantId: previousWorker.id })
            }
            style={[
              styles.navigationArrow,
              { borderColor: colors.border },
              !previousWorker && styles.disabledArrow,
            ]}
            testID="business-live-track-previous"
          >
            <Text style={[styles.arrowText, { color: colors.text }]}>‹</Text>
          </Pressable>
          <Text
            accessibilityRole="text"
            style={[styles.workerPosition, { color: colors.textSubtle }]}
          >
            {workerIndex + 1} / {acceptedWorkers.length}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              nextWorker
                ? t('businessLiveCreate.trackWorker', {
                    name: nextWorker.name,
                  })
                : undefined
            }
            accessibilityState={{ disabled: !nextWorker }}
            disabled={!nextWorker}
            onPress={() =>
              nextWorker &&
              navigation.setParams({ applicantId: nextWorker.id })
            }
            style={[
              styles.navigationArrow,
              { borderColor: colors.border },
              !nextWorker && styles.disabledArrow,
            ]}
            testID="business-live-track-next"
          >
            <Text style={[styles.arrowText, { color: colors.text }]}>›</Text>
          </Pressable>
        </View>
      ) : null}
      <MapPreview variant="route" height={190} />
      <View style={styles.statsRow}>
        <View style={[styles.statTile, { backgroundColor: colors.fill }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {t('businessLiveCreate.arrivalMinutes', {
              count: worker.arrivalMinutes,
            })}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSubtle }]}>
            {t('businessLiveCreate.estimatedArrival')}
          </Text>
        </View>
        <View style={[styles.statTile, { backgroundColor: colors.fill }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {t('businessLiveCreate.distanceKm', {
              distance: worker.distanceKm,
            })}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSubtle }]}>
            {t('businessLiveCreate.awayFromYou')}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.workerCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.workerCopy}>
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
          {t('businessLiveCreate.workerLive')}
        </Text>
      </View>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  workerNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionGroup: { gap: 8 },
  contactActions: { flexDirection: 'row', gap: 8 },
  contactButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  contactLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    textAlign: 'center',
  },
  pressed: { opacity: 0.7 },
  navigationArrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 18,
  },
  disabledArrow: { opacity: 0.35 },
  arrowText: { fontFamily: FONTS.regular, fontSize: 24, lineHeight: 28 },
  workerPosition: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 16 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statTile: { flex: 1, borderRadius: 14, padding: 12, gap: 2 },
  statValue: { fontFamily: FONTS.bold, fontSize: 18, lineHeight: 24 },
  statLabel: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 14 },
  workerCard: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  workerCopy: { flex: 1, gap: 2 },
  workerName: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 15 },
  workerMeta: { fontFamily: FONTS.regular, fontSize: 9, lineHeight: 13 },
  workerStatus: { fontFamily: FONTS.semiBold, fontSize: 9, lineHeight: 13 },
});
