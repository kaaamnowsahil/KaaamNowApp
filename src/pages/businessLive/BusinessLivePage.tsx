import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import CalendarDaysIcon from '@/assets/figma/calendar-days.svg';
import ZapIcon from '@/assets/figma/zap.svg';
import {
  BrandAppBar,
  EmptyState,
  PrimaryButton,
  SectionHeading,
  SegmentedControl,
} from '@/components/ui';
import { TabScreen } from '@/layout/TabScreen';
import { useTheme } from '@/theme/ThemeProvider';

import { BusinessMetrics, BusinessOverview, BusinessShiftCard } from './components';
import { useBusinessLive } from './hooks';

export const BusinessLivePage: FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const dashboard = useBusinessLive();
  const isLive = dashboard.view === 'live';

  const blocks = [
    <BusinessOverview
      key="overview"
      businessName={dashboard.businessName}
      isVerified={dashboard.isVerified}
    />,
    <SegmentedControl
      key="view-toggle"
      segments={[
        { id: 'live' as const, label: t('businessDashboard.liveNow') },
        { id: 'scheduled' as const, label: t('businessDashboard.scheduled') },
      ]}
      value={dashboard.view}
      onChange={dashboard.setView}
    />,
    ...(dashboard.error
      ? []
      : [
          <BusinessMetrics
            key="metrics"
            confirmedWorkers={dashboard.confirmedWorkers}
            workersRequired={dashboard.workersRequired}
            newApplicants={dashboard.newApplicants}
          />,
        ]),
    ...(dashboard.error
      ? [
          <EmptyState
            key="error"
            icon={CalendarDaysIcon}
            title={t('businessShifts.loadErrorTitle')}
            body={dashboard.error}
            action={t('businessShifts.retry')}
            onAction={dashboard.reload}
          />,
        ]
      : dashboard.shifts.length > 0
      ? [
          <SectionHeading
            key="section"
            title={t(
              isLive
                ? 'businessDashboard.todayLive'
                : 'businessDashboard.upcoming',
            )}
            statusColor={isLive ? undefined : colors.primary}
            action={t('businessDashboard.viewAll')}
            onAction={dashboard.openShifts}
          />,
          ...dashboard.shifts.map(({ item, card }) => (
            <BusinessShiftCard
              key={card.id}
              shift={card}
              view={dashboard.view}
              businessName={dashboard.businessName}
              isVerified={dashboard.isVerified}
              onPress={
                isLive ? () => dashboard.openRoster(item) : dashboard.openShifts
              }
            />
          )),
        ]
      : [
          <EmptyState
            key="empty"
            icon={isLive ? ZapIcon : CalendarDaysIcon}
            title={t(
              isLive
                ? 'businessDashboard.emptyLiveTitle'
                : 'businessDashboard.emptyScheduledTitle',
            )}
            body={t(
              isLive
                ? 'businessDashboard.emptyLiveBody'
                : 'businessDashboard.emptyScheduledBody',
            )}
          />,
        ]),
  ];

  return (
    <TabScreen
      header={<BrandAppBar onBellPress={dashboard.openNotifications} />}
      blocks={blocks}
      gap={12}
      fillLastBlock={Boolean(dashboard.error) || dashboard.shifts.length === 0}
      isLoading={dashboard.isLoading}
      busy={dashboard.isRefreshing}
      testID="business-live-page"
      actions={
        <PrimaryButton
          label={t(
            isLive
              ? 'businessDashboard.postLiveRequest'
              : 'businessDashboard.createShift',
          )}
          onPress={dashboard.openSchedule}
          disabled={isLive}
          testID="business-create-shift"
        />
      }
    />
  );
};
