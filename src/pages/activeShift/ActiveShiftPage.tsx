import { useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import {
  DetailRow,
  FlowHeading,
  InfoCallout,
  MapPreview,
  PinSheet,
  StatTiles,
} from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useShiftAction } from '@/services/shifts/useShiftFlow';
import { useEmergency } from '@/services/support/useEmergency';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import KeyRoundIcon from '@/assets/icons/key-round.svg';
import TriangleAlertIcon from '@/assets/icons/triangle-alert.svg';
import { formatClock, formatRupees, splitTimeRange } from '@/utils/format';

import { ACTIVE_SHIFT_STRINGS } from './constants/activeShiftStrings';
import { useActiveShift } from './hooks/useActiveShift';

/**
 * Live shift step 6. Figma: Live · Active shift (light/dark).
 * Ending before the effective end needs the PIN shown on the business app;
 * extension requests and the business's early-end PIN appear inline (not in Figma).
 * - timer + polling: hooks/useActiveShift.ts
 * - data: GET /assignments/{id}, GET /assignments/{id}/contact
 */
export const ActiveShiftPage: FC<AppScreenProps<typeof ROUTES.activeShift>> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { shift } = route.params;
  const assignmentId = shift.assignmentId ?? '';
  const { colors } = useTheme();
  const a = useActiveShift(shift.assignmentId);
  const action = useShiftAction();
  const emergency = useEmergency(shift.assignmentId);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const times = splitTimeRange(shift.timeLabel);
  const detail = a.detail;
  const extension = detail?.pending_extension;
  const pinForBusiness =
    detail?.early_end_requested_by === 'business' ? detail.early_end_pin : null;
  const status = detail?.status;
  const isTask = (detail?.shift.pricing_mode ?? shift.pricingMode) === 'task';
  const awaitingPin =
    !isTask &&
    detail?.can_end === false &&
    detail.early_end_requested_by === 'worker';

  useEffect(() => {
    if (status !== 'checked_out') return;
    Alert.alert(ACTIVE_SHIFT_STRINGS.ENDED_TITLE, ACTIVE_SHIFT_STRINGS.ENDED_BODY, [
      {
        text: ACTIVE_SHIFT_STRINGS.OK,
        onPress: () =>
          navigation.replace(ROUTES.shiftComplete, {
            shift: { ...shift, assignmentStatus: status },
          }),
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const endEarly = (pin: string) =>
    action.run(
      () => shiftsApi.endEarly('worker', assignmentId, pin),
      next => {
        setIsPinOpen(false);
        navigation.replace(ROUTES.shiftComplete, {
          shift: { ...shift, assignmentStatus: next.status },
        });
      },
      ACTIVE_SHIFT_STRINGS.END_FAILED,
    );

  const answerExtension = (accept: boolean) =>
    extension &&
    action.run(
      () =>
        accept
          ? shiftsApi.acceptExtension(assignmentId, extension.id)
          : shiftsApi.declineExtension(assignmentId, extension.id),
      a.setDetail,
      ACTIVE_SHIFT_STRINGS.EXTENSION_FAILED,
    );

  return (
    <>
      <FormScreen
        busy={action.busy || emergency.busy}
        onBack={navigation.goBack}
        title={t('workerFlow.shiftSecured.headerTitle')}
        compactTitle
        headerTag={t('workerFlow.checkIn.headerRight')}
        gap={12}
        isLoading={a.isLoading}
        testID="active-shift-page"
        actions={
          <>
            <PrimaryButton
              label={
                isTask
                  ? t('taskPricing.finishTask')
                  : t('workerFlow.activeShift.checkOut')
              }
              onPress={() => navigation.navigate(ROUTES.finishShift, { shift })}
              testID="active-shift-check-out"
            />
            {awaitingPin ? (
              <SecondaryButton
                label={ACTIVE_SHIFT_STRINGS.END_EARLY}
                icon={KeyRoundIcon}
                disabled={action.busy || !assignmentId}
                onPress={() => setIsPinOpen(true)}
                testID="active-shift-end-early"
              />
            ) : null}
            <SecondaryButton
              label={ACTIVE_SHIFT_STRINGS.EMERGENCY}
              tone="danger"
              icon={TriangleAlertIcon}
              disabled={emergency.busy || !emergency.isAvailable}
              onPress={emergency.trigger}
              testID="active-shift-emergency"
            />
          </>
        }
      >
        <FlowHeading
          overline={t('workerFlow.activeShift.overline')}
          title={t('workerFlow.activeShift.heading')}
          subtitle={t('workerFlow.activeShift.subtitle', {
            role: shift.title,
            code: a.reference,
          })}
        />
        {extension ? (
          <View style={[styles.card, { borderColor: colors.primary }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {ACTIVE_SHIFT_STRINGS.extensionTitle(extension.extra_minutes)}
            </Text>
            <Text style={[styles.cardBody, { color: colors.textMuted }]}>
              {ACTIVE_SHIFT_STRINGS.EXTENSION_BODY}
            </Text>
            <PrimaryButton
              label={ACTIVE_SHIFT_STRINGS.ACCEPT}
              disabled={action.busy}
              onPress={() => answerExtension(true)}
              testID="active-shift-extension-accept"
            />
            <SecondaryButton
              label={ACTIVE_SHIFT_STRINGS.DECLINE}
              disabled={action.busy}
              onPress={() => answerExtension(false)}
              testID="active-shift-extension-decline"
            />
          </View>
        ) : null}
        {pinForBusiness ? (
          <InfoCallout text={ACTIVE_SHIFT_STRINGS.pinForBusiness(pinForBusiness)} />
        ) : null}
        <MapPreview
          variant="pin"
          label={t('workerFlow.activeShift.mapLabel', {
            distance: shift.distanceKm,
          })}
        />
        <StatTiles
          items={[
            { value: times.start, label: t('workerFlow.activeShift.shiftStart') },
            isTask
              ? {
                  value: formatRupees(shift.estimatedPay ?? 0),
                  label: t('taskPricing.fixedPrice'),
                }
              : {
                  value: a.endsAt
                    ? ACTIVE_SHIFT_STRINGS.endsAt(a.endsAt, detail?.extended_minutes ?? 0)
                    : times.end,
                  label: t('workerFlow.activeShift.expectedEnd'),
                },
          ]}
        />
        <View style={[styles.timer, { backgroundColor: colors.fill }]}>
          <Text style={[styles.timerLabel, { color: colors.textSubtle }]}>
            {t('workerFlow.activeShift.timeOnShift')}
          </Text>
          <Text
            style={[styles.clock, { color: colors.text }]}
            testID="active-shift-clock"
          >
            {formatClock(a.elapsed)}
          </Text>
          <Text style={[styles.timerLabel, { color: colors.textSubtle }]}>
            {t('workerFlow.activeShift.timerNote')}
          </Text>
        </View>
        <View>
          <DetailRow
            size="compact"
            title={t('workerFlow.activeShift.checkInRecorded')}
            caption={a.checkInRecorded}
            onPress={() => navigation.navigate(ROUTES.shiftDetails, { shift, bookingStatus: 'confirmed' })}
          />
          {a.leadPhone ? (
            <DetailRow
              size="compact"
              title={t('workerFlow.activeShift.shiftLead')}
              caption={t('workerFlow.activeShift.lead', { name: a.leadName })}
              onPress={() => Linking.openURL(`sms:${a.leadPhone}`)}
            />
          ) : null}
        </View>
      </FormScreen>
      {isPinOpen ? (
        <PinSheet
          title={ACTIVE_SHIFT_STRINGS.PIN_TITLE}
          subtitle={ACTIVE_SHIFT_STRINGS.PIN_BODY}
          confirmLabel={ACTIVE_SHIFT_STRINGS.PIN_CONFIRM}
          closeLabel={ACTIVE_SHIFT_STRINGS.PIN_CLOSE}
          busy={action.busy}
          onSubmit={endEarly}
          onClose={() => setIsPinOpen(false)}
        />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  cardTitle: { fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 21 },
  cardBody: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18.2 },
  timer: {
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  timerLabel: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.3,
  },
  clock: {
    fontFamily: FONTS.bold,
    fontSize: 34,
    lineHeight: 42,
    fontVariant: ['tabular-nums'],
  },
});
