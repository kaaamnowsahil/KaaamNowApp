import type { FC } from 'react';
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

import { ACTIVE_SHIFT_STRINGS as S } from './constants';
import { useActiveShift } from './hooks/useActiveShift';

/**
 * Live shift step 6. Figma: Live · Active shift (light/dark).
 * - timer: hooks/useActiveShift.ts
 * - data: mock/activeShiftMock.ts
 */
export const ActiveShiftPage: FC<AppScreenProps<typeof ROUTES.activeShift>> = ({
  navigation,
  route,
}) => {
  const { shift } = route.params;
  const { colors } = useTheme();
  const a = useActiveShift();
  const times = splitTimeRange(shift.timeLabel);

  const report = () =>
    Alert.alert(S.REPORT_TITLE, S.REPORT_BODY, [
      { text: S.REPORT_CANCEL, style: 'cancel' },
      { text: S.REPORT_OK },
    ]);

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={S.HEADER_TITLE}
      compactTitle
      headerTag={S.HEADER_RIGHT}
      gap={12}
      isLoading={a.isLoading}
      testID="active-shift-page"
      actions={
        <>
          <PrimaryButton
            label={S.CHECK_OUT}
            onPress={() => navigation.navigate(ROUTES.finishShift, { shift })}
            testID="active-shift-check-out"
          />
          <SecondaryButton
            label={S.REPORT}
            onPress={report}
            testID="active-shift-report"
          />
        </>
      }
    >
      <FlowHeading
        overline={S.OVERLINE}
        title={S.HEADING}
        subtitle={S.subtitle(shift.title, a.shift.checkInCode)}
      />
      <MapPreview variant="pin" label={S.mapLabel(shift.distanceKm)} />
      <StatTiles
        items={[
          { value: times.start, label: S.SHIFT_START },
          { value: times.end, label: S.EXPECTED_END },
        ]}
      />
      <View style={[styles.timer, { backgroundColor: colors.fill }]}>
        <Text style={[styles.timerLabel, { color: colors.textSubtle }]}>
          {S.TIME_ON_SHIFT}
        </Text>
        <Text
          style={[styles.clock, { color: colors.text }]}
          testID="active-shift-clock"
        >
          {formatClock(a.elapsed)}
        </Text>
        <Text style={[styles.timerLabel, { color: colors.textSubtle }]}>
          {S.TIMER_NOTE}
        </Text>
      </View>
      <View>
        <DetailRow
          size="compact"
          title={S.CHECK_IN_RECORDED}
          caption={a.shift.checkInRecorded}
          onPress={() => navigation.navigate(ROUTES.shiftDetails, { shift, bookingStatus: 'confirmed' })}
        />
        <DetailRow
          size="compact"
          title={S.SHIFT_LEAD}
          caption={S.lead(a.shift.leadName)}
          onPress={() => Linking.openURL(`sms:${a.shift.leadPhone}`)}
        />
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
