import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ChevronDownIcon from '@/assets/figma/chevron-down.svg';
import MapPinIcon from '@/assets/figma/map-pin-home.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import type { Option } from '@/types';

import { WORKER_HOME_STRINGS } from '../constants';
import { OptionMenu } from './OptionMenu';

/** Figma "Location selector" (1:1476) with an inline dropdown under it. */
export const LocationDropdown: FC<{
  label: string;
  options: Option[];
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
}> = ({ label, options, value, isOpen, onToggle, onSelect }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${WORKER_HOME_STRINGS.CHANGE_LOCATION}: ${label}`}
        accessibilityState={{ expanded: isOpen }}
        hitSlop={6}
        onPress={onToggle}
        style={styles.selector}
        testID="home-location"
      >
        <MapPinIcon width={18} height={18} color={colors.primary} />
        <Text style={[styles.selectorText, { color: colors.textMuted }]}>
          {label}
        </Text>
        <View style={isOpen && styles.flipped}>
          <ChevronDownIcon width={16} height={16} color={colors.textMuted} />
        </View>
      </Pressable>
      {isOpen ? (
        <OptionMenu
          hint={WORKER_HOME_STRINGS.LOCATION_HINT}
          options={options}
          value={value}
          onSelect={onSelect}
          testID="location"
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { gap: 8 },
  selector: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectorText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 18.2,
  },
  flipped: { transform: [{ rotate: '180deg' }] },
});
