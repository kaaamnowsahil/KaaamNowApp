import type { FC } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MapPreview } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useBusinessLiveStore } from '@/services/business/useBusinessLiveStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps, BusinessLiveRequest } from '@/types';

import { findMockAcceptedWorkers } from './mock';

export const BusinessLiveReviewPage: FC<
  AppScreenProps<typeof ROUTES.businessLiveReview>
> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const draft = useBusinessLiveStore(state => state.draft);
  const saveDraft = useBusinessLiveStore(state => state.saveDraft);
  const publishRequest = useBusinessLiveStore(state => state.publishRequest);

  if (!draft) {
    return (
      <FormScreen
        onBack={navigation.goBack}
        title={t('businessLiveCreate.reviewTitle')}
        subtitle={t('businessLiveCreate.reviewSubtitle')}
        testID="business-live-review-page"
      >
        <Text style={[styles.body, { color: colors.textSubtle }]}>
          {t('businessLiveCreate.requestUnavailableBody')}
        </Text>
        <PrimaryButton
          label={t('businessLiveCreate.createRequest')}
          onPress={() => navigation.replace(ROUTES.businessLiveCreate)}
        />
      </FormScreen>
    );
  }

  const workers = Number(draft.workers);
  const hours = Number(draft.hours);
  const rate = Number(draft.hourlyRate);
  const subtotal = workers * hours * rate;
  const fee = Math.round(subtotal * 0.05);
  const total = subtotal + fee;
  const formatAmount = (amount: number) =>
    amount.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const [startHour, startMinute] = draft.startTime.split(':').map(Number);
  const endMinutes = (startHour * 60 + startMinute + hours * 60) % (24 * 60);
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(
    2,
    '0',
  )}:${String(endMinutes % 60).padStart(2, '0')}`;
  const dateLabel = new Intl.DateTimeFormat(i18n.language, {
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  const publish = () => {
    if (!draft.customPayAgreed) {
      Alert.alert(t('businessLiveCreate.customPayAgreementRequired'));
      return;
    }
    const request = publishRequest(draft);
    const mockWorkers = findMockAcceptedWorkers([], request.workers);
    const acceptedWorkers = mockWorkers.slice(0, request.workers);
    const nextRequest: BusinessLiveRequest = {
      ...request,
      acceptedWorkers,
      status:
        acceptedWorkers.length >= request.workers
          ? 'accepted'
          : acceptedWorkers.length > 0
            ? 'partiallyAccepted'
            : 'finding',
    };
    useBusinessLiveStore.setState({ activeRequest: nextRequest, draft: null });

    if (acceptedWorkers.length >= request.workers && acceptedWorkers[0]) {
      navigation.replace(ROUTES.businessLiveAccepted);
      return;
    }
    if (acceptedWorkers.length > 0) {
      navigation.replace(ROUTES.businessLiveStaffing);
      return;
    }
    navigation.replace(ROUTES.businessLiveFinding);
  };

  const toggleAgreement = () =>
    saveDraft({ ...draft, customPayAgreed: !draft.customPayAgreed });

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('businessLiveCreate.reviewTitle')}
      subtitle={t('businessLiveCreate.reviewSubtitle')}
      headerTag={t('businessApplicants.headerTag')}
      gap={12}
      testID="business-live-review-page"
      actions={
        <>
          <PrimaryButton
            label={t('businessLiveCreate.publishRequest')}
            onPress={publish}
            disabled={!draft.customPayAgreed}
            testID="business-live-publish"
          />
          <SecondaryButton
            label={t('businessLiveCreate.editRequest')}
            onPress={navigation.goBack}
          />
        </>
      }
    >
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>{draft.role}</Text>
        <Text style={[styles.body, { color: colors.textSubtle }]}>
          {t(`businessSignup.businessTypes.${draft.category}`)}
        </Text>
        <Text style={[styles.body, { color: colors.textSubtle }]}>
          {t('businessLiveCreate.dateTimeSummary', {
            date: t('businessLiveCreate.today'),
            day: dateLabel,
            start: draft.startTime,
            end: endTime,
            hours,
          })}
        </Text>
        <Text style={[styles.body, { color: colors.textSubtle }]}>
          {draft.responsibilities}
        </Text>
        <Text style={[styles.body, { color: colors.textSubtle }]}>
          {draft.requirement}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('businessLiveCreate.workplace')}
        </Text>
        <Text style={[styles.body, { color: colors.text }]}>
          {draft.location}
        </Text>
        {draft.latitude !== null && draft.longitude !== null ? (
          <Text style={[styles.body, { color: colors.textSubtle }]}>
            {t('businessLiveCreate.gpsCoordinates', {
              latitude: draft.latitude.toFixed(6),
              longitude: draft.longitude.toFixed(6),
            })}
          </Text>
        ) : null}
        <Text style={[styles.body, { color: colors.textSubtle }]}>
          {t('businessLiveCreate.radiusSummary', {
            radius: draft.searchRadiusKm,
          })}
        </Text>
        <Text style={[styles.body, { color: colors.textSubtle }]}>
          {draft.workplaceInstructions}
        </Text>
        <Text style={[styles.body, { color: colors.textSubtle }]}>
          {t('businessLiveCreate.assignmentRule')}
        </Text>
      </View>
      <MapPreview
        variant="pin"
        label={draft.location}
        height={120}
        coordinates={
          draft.latitude !== null && draft.longitude !== null
            ? { latitude: draft.latitude, longitude: draft.longitude }
            : null
        }
      />

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('businessLiveCreate.estimatedCost')}
        </Text>
        <CostLine
          label={t('businessLiveCreate.costCalculation', {
            workers,
            hours,
            rate,
          })}
          value={`₹${formatAmount(subtotal)}`}
          color={colors.textSubtle}
        />
        <CostLine
          label={t('businessLiveCreate.serviceFee')}
          value={`₹${formatAmount(fee)}`}
          color={colors.textSubtle}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <CostLine
          label={t('businessLiveCreate.totalEstimate')}
          value={`₹${formatAmount(total)}`}
          color={colors.text}
          strong
        />
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: draft.customPayAgreed }}
        onPress={toggleAgreement}
        style={styles.agreement}
        testID="business-live-custom-pay-agreed"
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: draft.customPayAgreed
                ? colors.primary
                : colors.border,
              backgroundColor: draft.customPayAgreed
                ? colors.primary
                : colors.surface,
            },
          ]}
        >
          {draft.customPayAgreed ? (
            <Text style={[styles.checkmark, { color: colors.onPrimary }]}>
              ✓
            </Text>
          ) : null}
        </View>
        <Text
          style={[
            styles.body,
            styles.agreementText,
            { color: colors.textSubtle },
          ]}
        >
          {t('businessLiveCreate.customPayAgreement', { rate })}
        </Text>
      </Pressable>
    </FormScreen>
  );
};

const CostLine: FC<{
  label: string;
  value: string;
  color: string;
  strong?: boolean;
}> = ({ label, value, color, strong }) => (
  <View style={styles.costLine}>
    <Text
      style={[
        styles.body,
        { color, fontFamily: strong ? FONTS.semiBold : FONTS.regular },
      ]}
    >
      {label}
    </Text>
    <Text
      style={[
        styles.body,
        { color, fontFamily: strong ? FONTS.semiBold : FONTS.regular },
      ]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 5 },
  title: { fontFamily: FONTS.semiBold, fontSize: 16, lineHeight: 22 },
  sectionTitle: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
  body: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
  costLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 2 },
  agreement: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  agreementText: { flex: 1 },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { fontFamily: FONTS.bold, fontSize: 12, lineHeight: 15 },
});
