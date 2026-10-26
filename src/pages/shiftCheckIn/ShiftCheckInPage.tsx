import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  FlowHeading,
  InfoCallout,
  MapPreview,
  StatTiles,
} from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { ApiError, errorMessage } from '@/services/api/apiClient';
import { getDevicePosition } from '@/services/maps/devicePosition';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { splitTimeRange } from '@/utils/format';

import { CheckInHelpSheet } from './components';

const CHECK_IN_STRINGS = {
  CODE_LENGTH: 4,
  WITHIN_METERS: 200,
  LOCATION_TITLE: 'Location needed',
  LOCATION_BODY: 'Turn on location so we can confirm you’re at the workplace, then try again.',
  FAILED: 'Couldn’t check you in',
} as const;

/**
 * Live shift step 5. Figma: Live · Ready to check in? (light/dark).
 * A correct code replaces this screen with the active shift.
 * - data: POST /worker/assignments/{id}/check-in with device location + site code
 */
export const ShiftCheckInPage: FC<
  AppScreenProps<typeof ROUTES.shiftCheckIn>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { shift } = route.params;
  const times = splitTimeRange(shift.timeLabel);
  const { colors } = useTheme();
  const assignmentId = shift.assignmentId ?? '';
  const [code, setCode] = useState('');
  const [isWrong, setIsWrong] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const contact = useApiQuery(
    async () => (assignmentId ? shiftsApi.contact(assignmentId) : null),
    [assignmentId],
  );

  const verify = async () => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const position = await getDevicePosition();
      if (!position) {
        Alert.alert(CHECK_IN_STRINGS.LOCATION_TITLE, CHECK_IN_STRINGS.LOCATION_BODY);
        return;
      }
      const assignment = await shiftsApi.checkIn(assignmentId, {
        ...position,
        check_in_code: code,
      });
      navigation.replace(ROUTES.activeShift, {
        shift: { ...shift, assignmentStatus: assignment.status },
      });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'check_in_code_invalid') {
        setIsWrong(true);
      } else {
        Alert.alert(CHECK_IN_STRINGS.FAILED, errorMessage(error));
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <FormScreen
        onBack={navigation.goBack}
        title={t('workerFlow.shiftSecured.headerTitle')}
        compactTitle
        headerTag={t('workerFlow.checkIn.headerRight')}
        gap={12}
        testID="shift-check-in-page"
        actions={
          <>
            <PrimaryButton
              label={t('workerFlow.checkIn.verify')}
              disabled={code.length !== CHECK_IN_STRINGS.CODE_LENGTH || isVerifying || !assignmentId}
              onPress={verify}
              testID="shift-check-in-verify"
            />
            <SecondaryButton
              label={t('workerFlow.checkIn.help')}
              onPress={() => setIsHelpOpen(true)}
              testID="shift-check-in-help"
            />
          </>
        }
      >
        <FlowHeading
          title={t('workerFlow.checkIn.heading')}
          subtitle={t('workerFlow.checkIn.subtitle', {
            role: shift.title,
            business: shift.businessName,
          })}
        />
        <InfoCallout
          text={t('workerFlow.checkIn.within', { meters: CHECK_IN_STRINGS.WITHIN_METERS })}
        />
        <MapPreview
          variant="pin"
          label={t('workerFlow.checkIn.mapLabel', {
            distance: shift.distanceKm,
          })}
        />
        <StatTiles
          items={[
            { value: times.start, label: t('workerFlow.checkIn.shiftStart') },
            { value: times.end, label: t('workerFlow.checkIn.expectedEnd') },
          ]}
        />
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            {t('workerFlow.checkIn.codeLabel')}
          </Text>
          <TextInput
            accessibilityLabel={t('workerFlow.checkIn.codeLabel')}
            value={code}
            onChangeText={v => {
              setCode(
                v.replace(/[^0-9a-z]/gi, '').toUpperCase().slice(0, CHECK_IN_STRINGS.CODE_LENGTH),
              );
              setIsWrong(false);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder={t('workerFlow.checkIn.codePlaceholder')}
            placeholderTextColor={colors.textSubtle}
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: isWrong ? colors.danger : colors.border,
              },
            ]}
            testID="shift-check-in-code"
          />
          <Text
            style={[
              styles.helper,
              { color: isWrong ? colors.danger : colors.textSubtle },
            ]}
          >
            {isWrong
              ? t('workerFlow.checkIn.codeWrong')
              : t('workerFlow.checkIn.codeHelper')}
          </Text>
        </View>
      </FormScreen>
      {isHelpOpen ? (
        <CheckInHelpSheet
          shift={shift}
          contact={contact.data ?? null}
          onClose={() => setIsHelpOpen(false)}
        />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  field: { gap: 6, marginTop: 4 },
  label: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: FONTS.regular,
    fontSize: 15,
  },
  helper: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
});
