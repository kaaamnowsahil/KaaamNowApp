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

import {
    BusinessLocationPicker,
    BusinessOverview,
    BusinessShiftCard,
} from './components';
import { BUSINESS_DASHBOARD, BUSINESS_LOCATIONS } from './mock';
import { useBusinessLive } from './hooks';

export const BusinessLivePage: FC = () => {
    const { t } = useTranslation();
    const dashboard = useBusinessLive();

    const blocks = [
        <BusinessOverview
            key="overview"
            businessName={BUSINESS_DASHBOARD.businessName}
            liveConfirmed={BUSINESS_DASHBOARD.liveConfirmed}
            liveTotal={BUSINESS_DASHBOARD.liveTotal}
            newApplicants={BUSINESS_DASHBOARD.newApplicants}
        />,
        <BusinessLocationPicker
            key="location"
            location={dashboard.location}
            options={BUSINESS_LOCATIONS}
            isOpen={dashboard.isLocationOpen}
            onToggle={dashboard.toggleLocation}
            onSelect={dashboard.selectLocation}
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
        ...(dashboard.shifts.length > 0
            ? [
                <SectionHeading
                    key="section"
                    title={t(dashboard.view === 'live' ? 'businessDashboard.todayLive' : 'businessDashboard.upcoming')}
                    action={t('businessDashboard.viewAll')}
                    onAction={dashboard.openShifts}
                />,
                ...dashboard.shifts.map(shift => (
                    <BusinessShiftCard
                        key={shift.id}
                        shift={shift}
                        view={dashboard.view}
                        businessName={BUSINESS_DASHBOARD.businessName}
                        isVerified={BUSINESS_DASHBOARD.isVerified}
                        onPress={dashboard.openShifts}
                    />
                )),
            ]
            : [
                <EmptyState
                    key="empty"
                    icon={dashboard.view === 'live' ? ZapIcon : CalendarDaysIcon}
                    title={t(dashboard.view === 'live' ? 'businessDashboard.emptyLiveTitle' : 'businessDashboard.emptyScheduledTitle')}
                    body={t(dashboard.view === 'live' ? 'businessDashboard.emptyLiveBody' : 'businessDashboard.emptyScheduledBody')}
                />,
            ]),
    ];

    return (
        <TabScreen
            header={<BrandAppBar onBellPress={dashboard.openNotifications} />}
            blocks={blocks}
            gap={12}
            isLoading={dashboard.isLoading}
            testID="business-live-page"
            actions={
                <PrimaryButton
                    label={t(dashboard.view === 'live' ? 'businessDashboard.postLiveRequest' : 'businessDashboard.createShift')}
                    onPress={dashboard.openShifts}
                    testID="business-create-shift"
                />
            }
        />
    );
};
