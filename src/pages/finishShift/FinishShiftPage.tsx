import { useState, type FC } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { DetailRow, FlowHeading, InfoCallout } from '@/components/liveShift';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

import { FINISH_SHIFT_STRINGS as S } from './constants';
import { FINISH_SUMMARY } from './mock';

/**
 * Live shift step 7. Figma: Live · Finish your shift? (light/dark), shown as a sheet.
 * Confirming replaces the flow with "Shift completed".
 * - data: mock/finishShiftMock.ts
 */
export const FinishShiftPage: FC<AppScreenProps<typeof ROUTES.finishShift>> = ({
  navigation,
  route,
}) => {
  const { shift } = route.params;
  const { colors } = useTheme();
  const isLoading = useMockLoading();
  const [note, setNote] = useState(FINISH_SUMMARY.defaultNote);
  const hours = FINISH_SUMMARY.recordedHours;

  const explain = (title: string) =>
    Alert.alert(title, S.CORRECTION_BODY, [{ text: S.OK }]);

  const rows = [
    { title: S.CHECKED_IN, caption: FINISH_SUMMARY.checkedIn },
    { title: S.CHECK_OUT, caption: FINISH_SUMMARY.checkOut },
    { title: S.DURATION, caption: S.hours(hours) },
    {
      title: S.EARNINGS,
      caption: S.earnings(
        hours,
        formatRupees(shift.hourlyRate),
        formatRupees(shift.hourlyRate * hours),
      ),
    },
  ];

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={S.HEADER_TITLE}
      compactTitle
      headerRight={
        <Text style={[styles.headerRight, { color: colors.textSubtle }]}>
          {S.HEADER_RIGHT}
        </Text>
      }
      asSheet
      gap={14}
      isLoading={isLoading}
      testID="finish-shift-page"
      actions={
        <>
          <PrimaryButton
            label={S.CONFIRM}
            onPress={() => navigation.replace(ROUTES.shiftComplete, { shift })}
            testID="finish-shift-confirm"
          />
          <SecondaryButton
            label={S.KEEP_ACTIVE}
            onPress={navigation.goBack}
            testID="finish-shift-keep"
          />
        </>
      }
    >
      <FlowHeading title={S.HEADING} subtitle={S.SUBTITLE} />
      <InfoCallout text={S.REVIEW_NOTE} />
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>
          {S.NOTE_LABEL}
        </Text>
        <TextInput
          accessibilityLabel={S.NOTE_LABEL}
          value={note}
          onChangeText={setNote}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          testID="finish-shift-note"
        />
      </View>
      <View>
        {rows.map((row, i) => (
          <DetailRow
            key={row.title}
            compact
            title={row.title}
            caption={row.caption}
            onPress={() => explain(row.title)}
            isLast={i === rows.length - 1}
          />
        ))}
      </View>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  headerRight: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
  field: { gap: 6 },
  label: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
});
