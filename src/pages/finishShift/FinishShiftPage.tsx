import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { DetailRow, FlowHeading, InfoCallout } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

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
  const { t } = useTranslation();
  const { shift } = route.params;
  const { colors } = useTheme();
  const isLoading = useMockLoading();
  const [note, setNote] = useState(FINISH_SUMMARY.defaultNote);
  const hours = FINISH_SUMMARY.recordedHours;

  const explain = (title: string) =>
    Alert.alert(title, t('workerFlow.finishShift.correctionBody'), [
      { text: t('workerFlow.finishShift.ok') },
    ]);

  const rows = [
    {
      title: t('workerFlow.finishShift.checkedIn'),
      caption: FINISH_SUMMARY.checkedIn,
    },
    {
      title: t('workerFlow.finishShift.checkOut'),
      caption: FINISH_SUMMARY.checkOut,
    },
    {
      title: t('workerFlow.finishShift.duration'),
      caption: t(`workerFlow.finishShift.${hours === 1 ? 'hour' : 'hours'}`, {
        count: hours,
      }),
    },
    {
      title: t('workerFlow.finishShift.earnings'),
      caption: t('workerFlow.finishShift.earningsFormula', {
        hours,
        rate: formatRupees(shift.hourlyRate),
        total: formatRupees(shift.hourlyRate * hours),
      }),
    },
  ];

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('workerFlow.shiftSecured.headerTitle')}
      compactTitle
      headerTag={t('workerFlow.checkIn.headerRight')}
      asSheet
      gap={14}
      isLoading={isLoading}
      testID="finish-shift-page"
      actions={
        <>
          <PrimaryButton
            label={t('workerFlow.finishShift.confirm')}
            onPress={() => navigation.replace(ROUTES.shiftComplete, { shift })}
            testID="finish-shift-confirm"
          />
          <SecondaryButton
            label={t('workerFlow.finishShift.keepActive')}
            onPress={navigation.goBack}
            testID="finish-shift-keep"
          />
        </>
      }
    >
      <FlowHeading
        title={t('workerFlow.finishShift.heading')}
        subtitle={t('workerFlow.finishShift.subtitle')}
      />
      <InfoCallout text={t('workerFlow.finishShift.reviewNote')} />
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>
          {t('workerFlow.finishShift.noteLabel')}
        </Text>
        <TextInput
          accessibilityLabel={t('workerFlow.finishShift.noteLabel')}
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
            size="compact"
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
