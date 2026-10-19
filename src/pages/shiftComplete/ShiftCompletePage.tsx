import type { FC } from 'react';
import { StyleSheet, Text } from 'react-native';

import { StatTiles, StatusHero } from '@/components/liveShift';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

import { SHIFT_COMPLETE_STRINGS as S } from './constants';
import { COMPLETED } from './mock';

/**
 * Live shift step 8. Figma: Live · Shift completed (light/dark).
 * - data: mock/shiftCompleteMock.ts
 */
export const ShiftCompletePage: FC<
  AppScreenProps<typeof ROUTES.shiftComplete>
> = ({ navigation, route }) => {
  const { shift } = route.params;
  const { colors } = useTheme();
  const isLoading = useMockLoading();

  return (
    <FormScreen
      onBack={() => navigation.popToTop()}
      title={S.HEADER_TITLE}
      compactTitle
      headerRight={
        <Text style={[styles.headerRight, { color: colors.textSubtle }]}>
          {S.HEADER_RIGHT}
        </Text>
      }
      gap={16}
      isLoading={isLoading}
      testID="shift-complete-page"
      actions={
        <>
          <PrimaryButton
            label={S.VIEW_EARNINGS}
            onPress={() =>
              navigation.popTo(ROUTES.mainTabs, {
                screen: ROUTES.workerEarnings,
              })
            }
            testID="shift-complete-earnings"
          />
          <SecondaryButton
            label={S.RATE}
            onPress={() => navigation.replace(ROUTES.rateBusiness, { shift })}
            testID="shift-complete-rate"
          />
        </>
      }
    >
      <StatusHero
        overline={S.OVERLINE}
        title={S.HEADING}
        subtitle={S.subtitle(COMPLETED.workerFirstName, COMPLETED.checkOutTime)}
      />
      <StatTiles
        items={[
          { value: S.hours(COMPLETED.recordedHours), label: S.RECORDED },
          {
            value: formatRupees(shift.hourlyRate * COMPLETED.recordedHours),
            label: S.EARNINGS,
          },
        ]}
      />
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  headerRight: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
});
