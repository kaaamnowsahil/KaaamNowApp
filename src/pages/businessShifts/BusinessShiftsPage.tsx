import type { FC } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import CalendarDaysIcon from '@/assets/figma/calendar-days.svg';
import {
  BrandAppBar,
  EmptyState,
  PrimaryButton,
  SectionHeading,
  ScreenIntro,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { TabScreen } from '@/layout/TabScreen';
import { BusinessIdentity } from '@/pages/businessLive/components';
import { useTheme } from '@/theme/ThemeProvider';
import type { TabAppNavigation } from '@/types';

import { BusinessOwnedShiftCard, BusinessShiftCancelSheet } from './components';
import {
  useBusinessShifts,
  type ShiftSection,
} from './hooks/useBusinessShifts';

export const BusinessShiftsPage: FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<TabAppNavigation>();
  const shifts = useBusinessShifts();

  const sectionColor: Record<ShiftSection, string> = {
    live: colors.danger,
    awaiting_payment: colors.text,
    draft: colors.textMuted,
    completed: colors.success,
    upcoming: colors.primary,
    in_progress: colors.info,
    expired: colors.danger,
    cancelled: colors.warning,
  };

  const blocks = [
    <View key="intro" style={styles.intro}>
      <ScreenIntro title={t('businessShifts.title')} />
      {shifts.businessName ? (
        <BusinessIdentity
          businessName={shifts.businessName}
          isVerified={shifts.isVerified}
        />
      ) : null}
    </View>,
    shifts.error ? (
      <EmptyState
        key="error"
        icon={CalendarDaysIcon}
        title={t('businessShifts.loadErrorTitle')}
        body={shifts.error}
        action={t('businessShifts.retry')}
        onAction={shifts.reload}
      />
    ) : !shifts.hasShifts ? (
      <EmptyState
        key="empty"
        icon={CalendarDaysIcon}
        title={t('businessDashboard.emptyScheduledTitle')}
        body={t('businessDashboard.emptyScheduledBody')}
      />
    ) : (
      <View key="sections" style={styles.sections}>
        {shifts.sections.map(section => (
          <View key={section.key} style={styles.section}>
            <SectionHeading
              title={t(section.titleKey)}
              statusColor={sectionColor[section.key]}
              isLive={section.key === 'live'}
            />
            {section.shifts.map(shift => (
              <BusinessOwnedShiftCard
                key={shift.id}
                shift={shift}
                titleColor={
                  section.key === 'live'
                    ? colors.primary
                    : sectionColor[section.key]
                }
                isPaying={shifts.payingId === shift.id}
                isPublishing={shifts.publishingId === shift.id}
                error={
                  shifts.cardError?.shiftId === shift.id
                    ? shifts.cardError.message
                    : ''
                }
                onCancel={() => shifts.openCancel(shift)}
                onPay={() => shifts.payDeposit(shift)}
                onPublish={() => shifts.publish(shift)}
                onOpenBooked={() => shifts.openBooked(shift)}
                onOpenWithdrawn={shifts.openApplicants}
                onOpenLive={() => shifts.openLive(shift)}
              />
            ))}
          </View>
        ))}
      </View>
    ),
  ];

  return (
    <>
      <TabScreen
        header={
          <BrandAppBar
            onBellPress={() => navigation.navigate(ROUTES.notifications)}
          />
        }
        blocks={blocks}
        gap={12}
        fillLastBlock={Boolean(shifts.error) || !shifts.hasShifts}
        isLoading={shifts.isLoading}
        testID="business-shifts-page"
        actions={
          <PrimaryButton
            label={t('businessDashboard.createShift')}
            onPress={shifts.openSchedule}
            testID="business-create-shift"
          />
        }
      />
      {shifts.cancelTarget ? (
        <BusinessShiftCancelSheet
          cutoffHours={shifts.cancelTarget.cancellation_cutoff_hours}
          preview={shifts.cancelPreview}
          error={shifts.cancelError}
          isCancelling={shifts.isCancelling}
          onClose={shifts.closeCancel}
          onConfirm={shifts.confirmCancel}
        />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  intro: { gap: 4 },
  sections: { gap: 24 },
  section: { gap: 12 },
});
