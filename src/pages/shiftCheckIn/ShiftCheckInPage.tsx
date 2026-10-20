import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';

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
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { splitTimeRange } from '@/utils/format';

import { CheckInHelpSheet } from './components';
import { CHECK_IN } from './mock';

/**
 * Live shift step 5. Figma: Live · Ready to check in? (light/dark).
 * A correct code replaces this screen with the active shift.
 * - data: mock/shiftCheckInMock.ts
 */
export const ShiftCheckInPage: FC<
  AppScreenProps<typeof ROUTES.shiftCheckIn>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { shift } = route.params;
  const times = splitTimeRange(shift.timeLabel);
  const { colors } = useTheme();
  const isLoading = useMockLoading();
  const [code, setCode] = useState('');
  const [isWrong, setIsWrong] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const startShift = () => navigation.replace(ROUTES.activeShift, { shift });

  const verify = () =>
    code === CHECK_IN.code ? startShift() : setIsWrong(true);

  return (
    <>
      <FormScreen
        onBack={navigation.goBack}
        title={t('workerFlow.shiftSecured.headerTitle')}
        compactTitle
        headerTag={t('workerFlow.checkIn.headerRight')}
        gap={12}
        isLoading={isLoading}
        testID="shift-check-in-page"
        actions={
          <>
            <PrimaryButton
              label={t('workerFlow.checkIn.verify')}
              disabled={code.length !== CHECK_IN.code.length}
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
          text={t('workerFlow.checkIn.within', { meters: CHECK_IN.withinMeters })}
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
              setCode(v.replace(/\D/g, '').slice(0, CHECK_IN.code.length));
              setIsWrong(false);
            }}
            keyboardType="number-pad"
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
          onCheckedIn={() => {
            setIsHelpOpen(false);
            startShift();
          }}
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
