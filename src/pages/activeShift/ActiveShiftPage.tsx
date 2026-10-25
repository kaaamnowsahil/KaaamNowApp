import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import {
  DetailRow,
  FlowHeading,
  MapPreview,
  StatTiles,
} from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatClock, splitTimeRange } from '@/utils/format';

import { useActiveShift } from './hooks/useActiveShift';

/**
 * Live shift step 6. Figma: Live · Active shift (light/dark).
 * - timer: hooks/useActiveShift.ts
 * - data: GET /assignments/{id}, GET /assignments/{id}/contact
 */
export const ActiveShiftPage: FC<AppScreenProps<typeof ROUTES.activeShift>> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { shift } = route.params;
  const { colors } = useTheme();
  const a = useActiveShift(shift.assignmentId);
  const times = splitTimeRange(shift.timeLabel);

  const report = () =>
    Alert.alert(
      t('workerFlow.activeShift.reportTitle'),
      t('workerFlow.activeShift.reportBody'),
      [
        { text: t('workerFlow.activeShift.reportCancel'), style: 'cancel' },
        { text: t('workerFlow.activeShift.reportOk') },
      ],
    );

  return (
    <FormScreen
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
            label={t('workerFlow.activeShift.checkOut')}
            onPress={() => navigation.navigate(ROUTES.finishShift, { shift })}
            testID="active-shift-check-out"
          />
          <SecondaryButton
            label={t('workerFlow.activeShift.report')}
            onPress={report}
            testID="active-shift-report"
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
      <MapPreview
        variant="pin"
        label={t('workerFlow.activeShift.mapLabel', {
          distance: shift.distanceKm,
        })}
      />
      <StatTiles
        items={[
          { value: times.start, label: t('workerFlow.activeShift.shiftStart') },
          { value: times.end, label: t('workerFlow.activeShift.expectedEnd') },
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
  );
};

const styles = StyleSheet.create({
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
