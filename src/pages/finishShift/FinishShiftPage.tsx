import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { DetailRow, FlowHeading, InfoCallout } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { errorMessage } from '@/services/api/apiClient';
import { getDevicePosition } from '@/services/maps/devicePosition';
import { formatDateTime } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useAssignment } from '@/services/shifts/useShiftFlow';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

const NOT_RECORDED = '—';

const hoursSince = (iso?: string | null) =>
  iso
    ? Math.max(
        0,
        Math.round(((Date.now() - new Date(iso).getTime()) / 3600000) * 10) /
          10,
      )
    : 0;

/**
 * Live shift step 7. Figma: Live · Finish your shift? (light/dark), shown as a sheet.
 * Confirming replaces the flow with "Shift completed".
 * - data: GET /assignments/{id}; POST /worker/assignments/{id}/check-out
 */
export const FinishShiftPage: FC<AppScreenProps<typeof ROUTES.finishShift>> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { shift } = route.params;
  const { colors } = useTheme();
  const assignment = useAssignment(shift.assignmentId);
  const checkedInAt = assignment.data?.attendance?.checked_in_at;
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hours = hoursSince(checkedInAt);

  const checkOut = async () => {
    if (!shift.assignmentId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const position = await getDevicePosition(8000);
      const result = await shiftsApi.checkOut(shift.assignmentId, {
        ...(position ?? {}),
        note: note.trim() || undefined,
      });
      navigation.replace(ROUTES.shiftComplete, {
        shift: { ...shift, assignmentStatus: result.status },
      });
    } catch (error) {
      Alert.alert(t('workerFlow.finishShift.failed'), errorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const explain = (title: string) =>
    Alert.alert(title, t('workerFlow.finishShift.correctionBody'), [
      { text: t('workerFlow.finishShift.ok') },
    ]);

  const rows = [
    {
      title: t('workerFlow.finishShift.checkedIn'),
      caption: checkedInAt ? formatDateTime(checkedInAt) : NOT_RECORDED,
    },
    {
      title: t('workerFlow.finishShift.checkOut'),
      caption: formatDateTime(new Date().toISOString()),
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
      isLoading={assignment.isLoading}
      testID="finish-shift-page"
      actions={
        <>
          <PrimaryButton
            label={t('workerFlow.finishShift.confirm')}
            disabled={isSubmitting || !shift.assignmentId}
            onPress={checkOut}
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
