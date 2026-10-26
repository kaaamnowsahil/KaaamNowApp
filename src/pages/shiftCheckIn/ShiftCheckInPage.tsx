import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import KeyIcon from '@/assets/figma/key-round.svg';
import { FlowHeading } from '@/components/shiftFlow';
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
  OVERLINE: 'AT THE WORKPLACE',
  TITLE: 'Ready to check in?',
  subtitle: (workplace: string) => `Enter the check-in code from the site contact at ${workplace}.`,
  CODE_LABEL: 'Check-in code',
  CODE_PLACEHOLDER: '••••',
  CODE_WRONG: 'That code doesn’t match. Check with your shift lead and try again.',
  SHIFT_STARTS: 'Shift starts',
  SHIFT_ENDS: 'Shift ends',
  LOCATION_NOTE: 'We confirm your location when you check in, so stay within 200 m of the workplace.',
  LOCATION_TITLE: 'Location needed',
  LOCATION_BODY: 'Turn on location so we can confirm you’re at the workplace, then try again.',
  FAILED: 'Couldn’t check you in',
} as const;

const clockTime = (iso: string) =>
  new Date(iso)
    .toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
    .toUpperCase();

/**
 * Check-in, as on web: site code + shift start/end. A correct code (and being within 200 m)
 * starts the shift timer and replaces this screen with the active shift.
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

  const summary = [
    {
      label: CHECK_IN_STRINGS.SHIFT_STARTS,
      value: shift.startsAt ? clockTime(shift.startsAt) : times.start,
    },
    {
      label: CHECK_IN_STRINGS.SHIFT_ENDS,
      value: shift.endsAt ? clockTime(shift.endsAt) : times.end,
    },
  ];

  return (
    <>
      <FormScreen
        onBack={navigation.goBack}
        title={t('workerFlow.shiftSecured.headerTitle')}
        compactTitle
        headerTag={t('workerFlow.checkIn.headerRight')}
        gap={14}
        busy={isVerifying}
        testID="shift-check-in-page"
        actions={
          <>
            <PrimaryButton
              label={t('workerFlow.checkIn.verify')}
              disabled={code.length < CHECK_IN_STRINGS.CODE_LENGTH || isVerifying || !assignmentId}
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
          overline={CHECK_IN_STRINGS.OVERLINE}
          title={CHECK_IN_STRINGS.TITLE}
          subtitle={CHECK_IN_STRINGS.subtitle(shift.businessName)}
        />
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <KeyIcon width={16} height={16} color={colors.text} />
            <Text style={[styles.label, { color: colors.text }]}>
              {CHECK_IN_STRINGS.CODE_LABEL}
            </Text>
          </View>
          <TextInput
            accessibilityLabel={CHECK_IN_STRINGS.CODE_LABEL}
            value={code}
            onChangeText={v => {
              setCode(v.replace(/[^0-9a-z]/gi, '').toUpperCase().slice(0, 8));
              setIsWrong(false);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            textContentType="oneTimeCode"
            placeholder={CHECK_IN_STRINGS.CODE_PLACEHOLDER}
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
          {isWrong ? (
            <Text style={[styles.error, { color: colors.danger }]}>
              {CHECK_IN_STRINGS.CODE_WRONG}
            </Text>
          ) : null}
        </View>
        <View style={styles.summary}>
          {summary.map(item => (
            <View
              key={item.label}
              style={[styles.summaryItem, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <Text style={[styles.summaryLabel, { color: colors.textSubtle }]}>{item.label}</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{item.value}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.note, { color: colors.textSubtle }]}>
          {CHECK_IN_STRINGS.LOCATION_NOTE}
        </Text>
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

/** Web `.booking-field`, `.booking-code-input`, `.booking-summary`, `.booking-note`. */
const styles = StyleSheet.create({
  field: { gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontFamily: FONTS.semiBold, fontSize: 14 },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: FONTS.bold,
    fontSize: 24,
    letterSpacing: 9.6,
    textAlign: 'center',
  },
  error: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
  summary: { flexDirection: 'row', gap: 10 },
  summaryItem: {
    flex: 1,
    gap: 4,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  summaryLabel: { fontFamily: FONTS.regular, fontSize: 13 },
  summaryValue: { fontFamily: FONTS.bold, fontSize: 17 },
  note: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 19.5 },
});
