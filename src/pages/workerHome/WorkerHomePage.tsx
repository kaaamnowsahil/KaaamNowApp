import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import CalendarDaysIcon from '@/assets/figma/calendar-days.svg';
import SearchIcon from '@/assets/figma/search.svg';
import SlidersIcon from '@/assets/figma/sliders-horizontal.svg';
import ZapIcon from '@/assets/figma/zap.svg';
import {
  BrandAppBar,
  EmptyState,
  ScreenIntro,
  SectionHeading,
  SegmentedControl,
} from '@/components/ui';
import { ShiftCard } from '@/components/shift';
import { FONTS } from '@/constants/fonts';
import { TabScreen } from '@/layout/TabScreen';
import { useTheme } from '@/theme/ThemeProvider';

import {
  CategoryTabs,
  FilterSheet,
  LocationDropdown,
} from './components';
import { WORKER_HOME_STRINGS } from './constants';
import { useWorkerHome } from './hooks/useWorkerHome';

/**
 * Worker home / Discover. Figma: Good afternoon, Aarav · Light (1:1456) / Dark (1:1556).
 * - state + filtering: hooks/useWorkerHome.ts
 * - data: GET /worker/feed
 */
export const WorkerHomePage: FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const home = useWorkerHome();
  const emptyState = WORKER_HOME_STRINGS.EMPTY_STATE[home.status];

  const blocks = [
    <ScreenIntro
      key="intro"
      title={
        home.firstName
          ? t('workerHome.greeting', { name: home.firstName })
          : WORKER_HOME_STRINGS.GREETING_FALLBACK
      }
      subtitle={WORKER_HOME_STRINGS.SUBTITLE}
    />,
    <LocationDropdown
      key="location"
      label={home.locationLabel}
      options={home.locations}
      value={home.locationId}
      isOpen={home.isLocationOpen}
      onToggle={home.toggleLocation}
      onSelect={home.selectLocation}
    />,
    <View key="search" style={styles.searchRow}>
      <View
        style={[
          styles.search,
          { backgroundColor: colors.fill, borderColor: colors.border },
        ]}
      >
        <SearchIcon width={18} height={18} color={colors.textSubtle} />
        <TextInput
          value={home.query}
          onChangeText={home.setQuery}
          placeholder={t('workerHome.searchPlaceholder')}
          placeholderTextColor={colors.textSubtle}
          returnKeyType="search"
          style={[styles.searchInput, { color: colors.text }]}
          testID="home-search"
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('workerHome.filter')}
        onPress={home.openFilters}
        style={({ pressed }) => [
          styles.filters,
          { backgroundColor: colors.fill },
          pressed && styles.pressed,
        ]}
        testID="home-filters"
      >
        <SlidersIcon width={20} height={20} color={colors.primary} />
        {home.activeFilterCount ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.primary,
                borderColor: colors.background,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.onPrimary }]}>
              {home.activeFilterCount}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>,
    <SegmentedControl
      key="segments"
      segments={WORKER_HOME_STRINGS.SEGMENTS}
      value={home.status}
      onChange={home.setStatus}
    />,
    <CategoryTabs
      key="categories"
      options={home.categories}
      value={home.categoryId}
      onChange={home.setCategoryId}
    />,
    ...(home.error && !home.nearby.length
      ? [
        <EmptyState
          key="error"
          icon={home.status === 'live' ? ZapIcon : CalendarDaysIcon}
          title={WORKER_HOME_STRINGS.LOAD_ERROR_TITLE}
          body={home.error}
          action={WORKER_HOME_STRINGS.RETRY}
          onAction={home.retry}
          testID="home-error"
        />,
      ]
      : home.nearby.length
        ? [
          <SectionHeading
            key="nearby"
            title={t('workerHome.nearbyShifts')}
            action={home.status === 'scheduled' ? WORKER_HOME_STRINGS.SEE_ALL : undefined}
            onAction={home.status === 'scheduled' ? home.openAllShifts : undefined}
          />,
          ...home.nearby.map(shift => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              onPress={() => home.openShift(shift)}
            />
          )),
        ]
        : [
          <EmptyState
            key={`empty-${home.status}`}
            icon={home.status === 'live' ? ZapIcon : CalendarDaysIcon}
            title={emptyState.title}
            body={emptyState.body}
            action={emptyState.action}
            onAction={
              home.status === 'live' ? home.showScheduled : home.clearFilters
            }
            testID={`home-empty-${home.status}`}
          />,
        ]),
  ];

  return (
    <>
      <TabScreen
        testID="worker-home-page"
        header={
          <BrandAppBar
            onBellPress={home.openNotifications}
          />
        }
        blocks={blocks}
        fillLastBlock={home.nearby.length === 0}
        isLoading={home.isLoading}
      />
      {home.isFilterOpen ? (
        <FilterSheet
          initial={home.filters}
          businessTypes={home.businessTypes}
          onApply={home.applyFilters}
          onClose={home.closeFilters}
        />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', gap: 10 },
  search: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    fontFamily: FONTS.regular,
    fontSize: 13,
  },
  filters: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: FONTS.bold, fontSize: 10, lineHeight: 12 },
});
