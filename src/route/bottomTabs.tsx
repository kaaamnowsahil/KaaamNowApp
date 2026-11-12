import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions, StackActions } from '@react-navigation/native';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';

import BuildingIcon from '@/assets/figma/building-2.svg';
import CalendarDaysIcon from '@/assets/figma/calendar-days.svg';
import HouseIcon from '@/assets/figma/house.svg';
import UserRoundIcon from '@/assets/figma/user-round.svg';
import UsersRoundIcon from '@/assets/figma/users-round.svg';
import WalletIcon from '@/assets/figma/wallet.svg';
import { ActiveLiveBubble } from '@/components/liveWork/ActiveLiveBubble';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { TabParamList } from '@/types';

import { TAB_HOMES } from './tabRoutes';
import {
  BusinessApplicantsStack,
  BusinessLiveStack,
  BusinessProfileStack,
  BusinessShiftsStack,
  WorkerDiscoverStack,
  WorkerEarningsStack,
  WorkerProfileStack,
  WorkerShiftsStack,
} from './tabStacks';

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
    title: 'discover',
    component: WorkerDiscoverStack,
    icon: tabIcon(HouseIcon),
  },
  {
    name: ROUTES.workerShifts,
    title: 'shifts',
    component: WorkerShiftsStack,
    icon: tabIcon(CalendarDaysIcon),
  },
  {
    name: ROUTES.workerEarnings,
    title: 'earnings',
    component: WorkerEarningsStack,
    icon: tabIcon(WalletIcon),
  },
  {
    name: ROUTES.workerProfile,
    title: 'profile',
    component: WorkerProfileStack,
    icon: tabIcon(UserRoundIcon),
  },
];

const BUSINESS_TABS: TabDef[] = [
  {
    name: ROUTES.businessLive,
    title: 'dashboard',
    component: BusinessLiveStack,
    icon: tabIcon(HouseIcon),
  },
  {
    name: ROUTES.businessShifts,
    title: 'shifts',
    component: BusinessShiftsStack,
    icon: tabIcon(CalendarDaysIcon),
  },
  {
    name: ROUTES.businessApplicants,
    title: 'applicants',
    component: BusinessApplicantsStack,
    icon: tabIcon(UsersRoundIcon),
  },
  {
    name: ROUTES.businessProfile,
    title: 'profile',
    component: BusinessProfileStack,
    icon: tabIcon(BuildingIcon),
  },
];

/** Icon row plus label. The 12pt top padding is added on top of this, not taken out of it. */
const TAB_BAR_CONTENT_HEIGHT = 49;

/** Role-based bottom tabs: worker and business get different tab sets. */
export const BottomTabRoutes: FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const role = useAuthStore(s => s.role);
  const tabs =
    role === 'business'
      ? BUSINESS_TABS.map(tab => ({
          ...tab,
          title: t(`businessDashboard.tabs.${tab.title}`),
        }))
      : WORKER_TABS.map(tab => ({
          ...tab,
          title: t(`workerTabs.${tab.title}`),
        }));

  return (
    <View style={styles.root}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          popToTopOnBlur: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSubtle,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingTop: 12,
            // iOS already adds the home-indicator inset. Setting height here would replace it.
            ...(Platform.OS === 'android'
              ? {
                  paddingBottom: insets.bottom,
                  height: TAB_BAR_CONTENT_HEIGHT + 12 + insets.bottom,
                }
              : null),
          },
          tabBarLabelStyle: { fontFamily: FONTS.regular, fontSize: 10 },
        }}
      >
        {tabs.map(({ name, title, component, icon: Icon }) => (
          <Tab.Screen
            key={name}
            name={name}
            component={component}
            listeners={({ navigation, route }) => ({
              tabPress: event => {
                const home = TAB_HOMES[route.name];
                const tabState = navigation.getState();
                const nested = tabState.routes.find(item => item.key === route.key)?.state;
                if (!nested || !('key' in nested) || !nested.key || nested.routes.length === 0) {
                  return;
                }
                const index = nested.index ?? 0;
                const atHome = index === 0 && nested.routes[0]?.name === home;
                if (atHome) return;
                event.preventDefault();
                if (nested.routes[0]?.name === home) {
                  navigation.dispatch({ ...StackActions.popToTop(), target: nested.key });
                } else {
                  navigation.dispatch({
                    ...CommonActions.reset({ index: 0, routes: [{ name: home }] }),
                    target: nested.key,
                  });
                }
                const focused = tabState.routes[tabState.index]?.key === route.key;
                if (!focused) navigation.dispatch(CommonActions.navigate({ name: route.name }));
              },
            })}
            options={{
              title,
              tabBarIcon: Icon,
              tabBarIconStyle: Icon ? undefined : { display: 'none' },
            }}
          />
        ))}
      </Tab.Navigator>
      {role === 'business' ? <ActiveLiveBubble /> : null}
    </View>
  );
};

const styles = StyleSheet.create({ root: { flex: 1 } });
