import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { FC } from 'react';

import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { PlaceholderPage } from '@/pages/placeholder/PlaceholderPage';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { TabParamList } from '@/types';

const Tab = createBottomTabNavigator<TabParamList>();

const WORKER_TABS = [
  { name: ROUTES.workerHome, title: 'Home', component: PlaceholderPage },
  { name: ROUTES.workerShifts, title: 'My shifts', component: PlaceholderPage },
  { name: ROUTES.workerProfile, title: 'Profile', component: PlaceholderPage },
] as const;

const BUSINESS_TABS = [
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
] as const;

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
        },
        tabBarLabelStyle: { fontFamily: FONTS.semiBold, fontSize: 11 },
        tabBarIconStyle: { display: 'none' },
      }}
    >
      {tabs.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{ title: tab.title }}
        />
      ))}
    </Tab.Navigator>
  );
};
