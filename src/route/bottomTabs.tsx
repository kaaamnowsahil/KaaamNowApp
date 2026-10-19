import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import CalendarDaysIcon from '@/assets/figma/calendar-days.svg';
import HouseIcon from '@/assets/figma/house.svg';
import UserRoundIcon from '@/assets/figma/user-round.svg';
import WalletIcon from '@/assets/figma/wallet.svg';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { PlaceholderPage } from '@/pages/placeholder/PlaceholderPage';
import { WorkerEarningsPage } from '@/pages/workerEarnings/WorkerEarningsPage';
import { WorkerHomePage } from '@/pages/workerHome/WorkerHomePage';
import { WorkerProfilePage } from '@/pages/workerProfile/WorkerProfilePage';
import { WorkerShiftsPage } from '@/pages/workerShifts/WorkerShiftsPage';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { TabParamList } from '@/types';

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcon =
  (Icon: FC<SvgProps>) =>
  ({ color }: { color: string }) =>
    <Icon width={22} height={22} color={color} />;

type TabDef = {
  name: keyof TabParamList;
  title: string;
  component: FC;
  icon?: ReturnType<typeof tabIcon>;
};

/** Figma "Role navigation" (1:1539). */
const WORKER_TABS: TabDef[] = [
  {
    name: ROUTES.workerHome,
    title: 'Discover',
    component: WorkerHomePage,
    icon: tabIcon(HouseIcon),
  },
  {
    name: ROUTES.workerShifts,
    title: 'My shifts',
    component: WorkerShiftsPage,
    icon: tabIcon(CalendarDaysIcon),
  },
  {
    name: ROUTES.workerEarnings,
    title: 'Earnings',
    component: WorkerEarningsPage,
    icon: tabIcon(WalletIcon),
  },
  {
    name: ROUTES.workerProfile,
    title: 'Profile',
    component: WorkerProfilePage,
    icon: tabIcon(UserRoundIcon),
  },
];

const BUSINESS_TABS: TabDef[] = [
  { name: ROUTES.businessLive, title: 'Live now', component: PlaceholderPage },
  { name: ROUTES.businessShifts, title: 'Shifts', component: PlaceholderPage },
  {
    name: ROUTES.businessApplicants,
    title: 'Applicants',
    component: PlaceholderPage,
  },
  {
    name: ROUTES.businessProfile,
    title: 'Profile',
    component: PlaceholderPage,
  },
];

/** Role-based bottom tabs: worker and business get different tab sets. */
export const BottomTabRoutes: FC = () => {
  const { colors } = useTheme();
  const role = useAuthStore(s => s.role);
  const tabs = role === 'business' ? BUSINESS_TABS : WORKER_TABS;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingTop: 12,
        },
        tabBarLabelStyle: { fontFamily: FONTS.regular, fontSize: 10 },
      }}
    >
      {tabs.map(({ name, title, component, icon: Icon }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            title,
            tabBarIcon: Icon,
            tabBarIconStyle: Icon ? undefined : { display: 'none' },
          }}
        />
      ))}
    </Tab.Navigator>
  );
};
