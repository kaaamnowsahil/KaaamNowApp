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

export const BusinessLiveAcceptedPage: FC<
  AppScreenProps<typeof ROUTES.businessLiveAccepted>
> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const request = useBusinessLiveStore(state => state.activeRequest);
  const acceptedWorkers = request?.acceptedWorkers ?? [];
  const primaryWorker = acceptedWorkers[0];
  const hasMultipleAcceptedWorkers = acceptedWorkers.length > 1;

  const returnToLiveDashboard = () =>
    navigation.navigate(ROUTES.mainTabs, { screen: ROUTES.businessLive });

  const trackWorker = (applicantId: string) =>
    navigation.navigate(ROUTES.businessLiveTracking, { applicantId });

  const messageWorker = () =>
    Alert.alert(t('businessLiveCreate.messageWorkerUnavailable'));

  if (!request) {
    return (
      <FormScreen
        onBack={returnToLiveDashboard}
        title={t('businessApplicants.headerTitle')}
        subtitle={t('businessLiveCreate.liveNow')}
        testID="business-live-accepted-page"
      >
        <FlowHeading
          title={t('businessLiveCreate.requestUnavailable')}
          subtitle={t('businessLiveCreate.requestUnavailableBody')}
        />
        <PrimaryButton
          label={t('businessDashboard.heading')}
          onPress={returnToLiveDashboard}
        />
      </FormScreen>
    );
  }

  const trackPrimaryWorker = () => {
    if (primaryWorker) trackWorker(primaryWorker.id);
  };
  const notificationBadge = hasMultipleAcceptedWorkers
    ? String(acceptedWorkers.length)
    : primaryWorker?.name.charAt(0) ?? 'A';

  return (
    <FormScreen
      onBack={returnToLiveDashboard}
      title={t('businessApplicants.headerTitle')}
      subtitle={t('businessLiveCreate.liveNow')}
      gap={12}
      testID="business-live-accepted-page"
      actions={
        primaryWorker ? (
          <View style={styles.actions}>
            <PrimaryButton
              label={
                hasMultipleAcceptedWorkers
                  ? t('businessLiveCreate.trackAllWorkers')
                  : t('businessLiveCreate.trackWorker', {
                      name: primaryWorker.name.split(' ')[0],
                    })
              }
              onPress={trackPrimaryWorker}
              testID="business-live-track-worker"
            />
            {hasMultipleAcceptedWorkers ? (
              <View style={styles.contactActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={messageWorker}
                  style={({ pressed }) => [
                    styles.contactButton,
                    { borderColor: colors.primary },
                    pressed && styles.pressed,
                  ]}
                  testID="business-live-message-all-workers"
                >
                  <Text style={[styles.contactLabel, { color: colors.primary }]}>
                    {t('businessLiveCreate.messageAllWorkers')}
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
                  testID="business-live-call-all-workers"
                >
                  <Text style={[styles.contactLabel, { color: colors.primary }]}>
                    {t('businessLiveCreate.callAllWorkers')}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <SecondaryButton
                label={t('businessLiveCreate.messageWorker', {
                  name: primaryWorker.name.split(' ')[0],
                })}
                onPress={messageWorker}
                testID="business-live-message-worker"
              />
            )}
          </View>
        ) : null
      }
    >
      {primaryWorker ? (
        <View
          style={[
            styles.notification,
            { backgroundColor: colors.fill, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.notificationAvatar,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[styles.notificationInitial, { color: colors.onPrimary }]}
            >
              {notificationBadge}
            </Text>
          </View>
          <View style={styles.notificationCopy}>
            <Text
              style={[styles.notificationMeta, { color: colors.textSubtle }]}
            >
              {t('businessLiveCreate.notificationSource')}
            </Text>
            <Text style={[styles.notificationTitle, { color: colors.text }]}>
              {hasMultipleAcceptedWorkers
                ? t('businessLiveCreate.workersAcceptedNotification', {
                    count: acceptedWorkers.length,
                  })
                : t('businessLiveCreate.workerAcceptedNotification', {
                    name: primaryWorker.name,
                  })}
            </Text>
            <Text
              style={[styles.notificationMeta, { color: colors.textSubtle }]}
            >
              {hasMultipleAcceptedWorkers
                ? t('businessLiveCreate.workerArrivalMeta', {
                    role: request.role,
                    distance: primaryWorker.distanceKm,
                  })
                : t('businessLiveCreate.workerArrivalMeta', {
                    role: request.role,
                    distance: primaryWorker.distanceKm,
                  })}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.acceptedHeading}>
        <Text style={[styles.overline, { color: colors.success }]}>
          {t('businessLiveCreate.acceptedOverline')}
        </Text>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.text }]}
        >
          {t('businessLiveCreate.acceptedTitle')}
        </Text>
        {primaryWorker ? (
          <Text style={[styles.subtitle, { color: colors.textSubtle }]}>
            {hasMultipleAcceptedWorkers
              ? t('businessLiveCreate.acceptedBodyMultiple', {
                  count: acceptedWorkers.length,
                })
              : t('businessLiveCreate.acceptedBody', {
                  name: primaryWorker.name.split(' ')[0],
                })}
          </Text>
        ) : null}
      </View>

      {primaryWorker ? (
        <View style={styles.statsRow}>
          <View style={[styles.statTile, { backgroundColor: colors.fill }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {t('businessLiveCreate.arrivalMinutes', {
                count: primaryWorker.arrivalMinutes,
              })}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSubtle }]}>
              {t('businessLiveCreate.estimatedArrival')}
            </Text>
          </View>
          <View style={[styles.statTile, { backgroundColor: colors.fill }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {t('businessLiveCreate.distanceKm', {
                distance: primaryWorker.distanceKm,
              })}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSubtle }]}>
              {t('businessLiveCreate.awayFromYou')}
            </Text>
          </View>
        </View>
      ) : null}

      {acceptedWorkers.map(worker => (
        <Pressable
          key={worker.id}
          accessibilityRole="button"
          accessibilityLabel={t('businessLiveCreate.trackWorker', {
            name: worker.name,
          })}
          accessibilityState={{ selected: worker.id === primaryWorker?.id }}
          onPress={() => trackWorker(worker.id)}
          style={({ pressed }) => [
            styles.detailCard,
            {
              backgroundColor:
                worker.id === primaryWorker?.id
                  ? colors.primarySoft
                  : colors.surface,
              borderColor:
                worker.id === primaryWorker?.id
                  ? colors.primary
                  : colors.border,
            },
            pressed && styles.pressed,
          ]}
          testID={`business-live-accepted-worker-${worker.id}`}
        >
          <View style={styles.detailCopy}>
            <Text style={[styles.detailTitle, { color: colors.text }]}>
              {worker.name}
            </Text>
            <Text style={[styles.detailSubtitle, { color: colors.textSubtle }]}>
              {t('businessLiveCreate.workerCredentials', {
                category: worker.category,
                rating: worker.rating.toFixed(1),
              })}
            </Text>
          </View>
          <Text style={[styles.detailStatus, { color: colors.success }]}>
            {t('businessLiveCreate.workerLive')}
          </Text>
          {acceptedWorkers.length > 1 ? (
            <Text
              accessibilityElementsHidden
              style={[styles.chevron, { color: colors.textSubtle }]}
            >
              ›
            </Text>
          ) : null}
        </Pressable>
      ))}

      <View
        style={[
          styles.detailCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.detailCopy}>
          <Text style={[styles.detailTitle, { color: colors.text }]}>
            {request.role}
          </Text>
          <Text style={[styles.detailSubtitle, { color: colors.textSubtle }]}>
            {t('businessLiveCreate.startsOnArrivalHours', {
              hours: request.hours,
            })}
          </Text>
        </View>
        <Text style={[styles.detailStatus, { color: colors.primary }]}>
          {t('businessLiveCreate.workerNow')}
        </Text>
      </View>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  actions: { gap: 8 },
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
  notification: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
  },
  notificationAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationInitial: { fontFamily: FONTS.semiBold, fontSize: 14 },
  notificationCopy: { flex: 1, gap: 1 },
  notificationMeta: { fontFamily: FONTS.regular, fontSize: 9, lineHeight: 12 },
  notificationTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    lineHeight: 15,
  },
  acceptedHeading: { gap: 5 },
  overline: { fontFamily: FONTS.semiBold, fontSize: 10, lineHeight: 14 },
  title: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 27 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statTile: { flex: 1, borderRadius: 14, padding: 12, gap: 2 },
  statValue: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 25 },
  statLabel: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 14 },
  detailCard: {
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
  detailCopy: { flex: 1, gap: 2 },
  detailTitle: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 15 },
  detailSubtitle: { fontFamily: FONTS.regular, fontSize: 9, lineHeight: 13 },
  detailStatus: { fontFamily: FONTS.semiBold, fontSize: 9, lineHeight: 13 },
  chevron: { fontFamily: FONTS.regular, fontSize: 20, lineHeight: 24 },
  pressed: { opacity: 0.75 },
});
