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
import type { TabAppNavigation } from '@/types';
import { BusinessIdentity, BusinessShiftCard } from '@/pages/businessLive/components';
import {
  formatDateLabel,
  formatTimeRange,
} from '@/services/shifts/shiftMappers';

import { BusinessDraftCard, BusinessRosterCard } from './components';
import { useBusinessShifts } from './hooks';
import { UNPAID_STRINGS } from './hooks/useBusinessShifts';

export const BusinessShiftsPage: FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<TabAppNavigation>();
  const shifts = useBusinessShifts();
  const hasAnyShift =
    shifts.liveShifts.length +
      shifts.scheduledShifts.length +
      shifts.unpaidShifts.length +
      shifts.drafts.length >
    0;

  const blocks = [
    <View key="intro" style={styles.intro}>
      <ScreenIntro title={t('businessShifts.title')} />
      {shifts.businessName ? (
        <BusinessIdentity businessName={shifts.businessName} isVerified={shifts.isVerified} />
      ) : null}
    </View>,
    ...(shifts.error
      ? [
          <EmptyState
            key="error"
            icon={CalendarDaysIcon}
            title={t('businessShifts.loadErrorTitle')}
            body={shifts.error}
            action={t('businessShifts.retry')}
            onAction={shifts.reload}
          />,
        ]
      : !hasAnyShift
      ? [
          <EmptyState
            key="empty"
            icon={CalendarDaysIcon}
            title={t('businessDashboard.emptyScheduledTitle')}
            body={t('businessDashboard.emptyScheduledBody')}
          />,
        ]
      : [
          ...(shifts.liveShifts.length
            ? [
                <SectionHeading
                  key="live-heading"
                  title={t('businessDashboard.todayLive')}
                />,
                ...shifts.liveShifts.map(({ item, card }) => (
                  <BusinessShiftCard
                    key={card.id}
                    shift={card}
                    view="live"
                    businessName={shifts.businessName}
                    isVerified={shifts.isVerified}
                    onPress={() => shifts.openShift(item)}
                  />
                )),
              ]
            : []),
          ...(shifts.unpaidShifts.length
            ? [
                <SectionHeading key="unpaid-heading" title={UNPAID_STRINGS.heading} />,
                ...shifts.unpaidShifts.map(item => (
                  <BusinessDraftCard
                    key={item.id}
                    title={item.job_title}
                    status={UNPAID_STRINGS.status}
                    date={`${formatDateLabel(
                      item.starts_at,
                    )} · ${formatTimeRange(item.starts_at, item.ends_at)}`}
                    onPress={() => shifts.payDeposit(item)}
                  />
                )),
              ]
            : []),
          ...(shifts.drafts.length
            ? [
                <SectionHeading
                  key="draft-heading"
                  title={t('businessShiftCreate.savedDraft')}
                />,
                ...shifts.drafts.map(draft => (
                  <BusinessDraftCard
                    key={draft.id}
                    title={draft.job_title}
                    date={`${formatDateLabel(
                      draft.starts_at,
                    )} · ${formatTimeRange(draft.starts_at, draft.ends_at)}`}
                    onPress={() => shifts.openDraft(draft)}
                  />
                )),
              ]
            : []),
          ...(shifts.scheduledShifts.length
            ? [
                <SectionHeading
                  key="scheduled-heading"
                  title={t('businessShifts.scheduled')}
                />,
                <BusinessRosterCard
                  key="roster"
                  staffedCount={shifts.roster.staffedCount}
                  totalCount={shifts.roster.totalCount}
                  onPress={shifts.openRoster}
                />,
                <SectionHeading
                  key="upcoming-heading"
                  title={t('businessDashboard.upcoming')}
                />,
                ...shifts.scheduledShifts.map(({ item, card }) => (
                  <BusinessShiftCard
                    key={card.id}
                    shift={card}
                    view="scheduled"
                    businessName={shifts.businessName}
                    isVerified={shifts.isVerified}
                    onPress={() => shifts.openShift(item)}
                  />
                )),
              ]
            : []),
        ]),
  ];

  return (
    <TabScreen
      header={
        <BrandAppBar onBellPress={() => navigation.navigate(ROUTES.notifications)} />
      }
      blocks={blocks}
      gap={12}
      fillLastBlock={Boolean(shifts.error) || !hasAnyShift}
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
  );
};

const styles = StyleSheet.create({
  intro: { gap: 4 },
});
