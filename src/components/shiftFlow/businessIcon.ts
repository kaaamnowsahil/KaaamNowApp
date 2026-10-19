import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import CalendarDaysIcon from '@/assets/figma/calendar-days.svg';
import CoffeeIcon from '@/assets/icons/coffee.svg';
import StoreIcon from '@/assets/icons/store.svg';

const ICONS: Record<string, FC<SvgProps>> = {
  cafe: CoffeeIcon,
  restaurant: CoffeeIcon,
  events: CalendarDaysIcon,
  retail: StoreIcon,
};

/** Tile icon for a shift's businessTypeId (Discover business-type filter ids). */
export const businessIcon = (businessTypeId: string): FC<SvgProps> =>
  ICONS[businessTypeId] ?? StoreIcon;
