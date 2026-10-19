import { useState, type FC } from 'react';
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
import { SHIFT_CHECK_IN_STRINGS as S } from './constants';
import { CHECK_IN } from './mock';

/**
 * Live shift step 5. Figma: Live · Ready to check in? (light/dark).
 * A correct code replaces this screen with the active shift.
 * - data: mock/shiftCheckInMock.ts
 */
export const ShiftCheckInPage: FC<
  AppScreenProps<typeof ROUTES.shiftCheckIn>
> = ({ navigation, route }) => {
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
      title={S.HEADER_TITLE}
      compactTitle
      headerTag={S.HEADER_RIGHT}
      gap={12}
      isLoading={isLoading}
      testID="shift-check-in-page"
      actions={
        <>
          <PrimaryButton
            label={S.VERIFY}
            disabled={code.length !== CHECK_IN.code.length}
            onPress={verify}
            testID="shift-check-in-verify"
          />
          <SecondaryButton
            label={S.HELP}
            onPress={() => setIsHelpOpen(true)}
            testID="shift-check-in-help"
          />
        </>
      }
    >
      <FlowHeading
        title={S.HEADING}
        subtitle={S.subtitle(shift.title, shift.businessName)}
      />
      <InfoCallout text={S.within(CHECK_IN.withinMeters)} />
      <MapPreview variant="pin" label={S.mapLabel(shift.distanceKm)} />
      <StatTiles
        items={[
          { value: times.start, label: S.SHIFT_START },
          { value: times.end, label: S.EXPECTED_END },
        ]}
      />
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>
          {S.CODE_LABEL}
        </Text>
        <TextInput
          accessibilityLabel={S.CODE_LABEL}
          value={code}
          onChangeText={v => {
            setCode(v.replace(/\D/g, '').slice(0, CHECK_IN.code.length));
            setIsWrong(false);
          }}
          keyboardType="number-pad"
          placeholder={S.CODE_PLACEHOLDER}
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
          {isWrong ? S.CODE_WRONG : S.CODE_HELPER}
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
