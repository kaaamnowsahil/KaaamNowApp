import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import { WORKER_HOME_STRINGS } from '../constants';

type AvailabilityCardProps = {
  isAvailable: boolean;
  isPending: boolean;
  error: string | null;
  onToggle: () => void;
};

/** Mirrors the web worker availability control (track, thumb and check colours match web). */
export const AvailabilityCard: FC<AvailabilityCardProps> = ({
  isAvailable,
  isPending,
  error,
  onToggle,
}) => {
  const { colors } = useTheme();
  const strings = WORKER_HOME_STRINGS.AVAILABILITY;

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>{strings.TITLE}</Text>
          <Text
            accessibilityLiveRegion="polite"
            style={[
              styles.status,
              { color: isAvailable ? colors.success : colors.textMuted },
            ]}
          >
            {isAvailable ? strings.ON : strings.OFF}
          </Text>
        </View>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: isAvailable, disabled: isPending }}
          accessibilityLabel={isAvailable ? strings.GO_OFFLINE : strings.GO_ONLINE}
          disabled={isPending}
          hitSlop={8}
          onPress={onToggle}
          style={[
            styles.track,
            isAvailable
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : styles.trackOff,
            isPending && styles.pending,
          ]}
          testID="home-availability"
        >
          <View style={[styles.thumb, isAvailable && styles.thumbOn]}>
            {isAvailable ? (
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20 6 9 17l-5-5"
                  stroke={colors.success}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            ) : null}
          </View>
        </Pressable>
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    minHeight: 72,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  copy: { flex: 1, gap: 4 },
  title: { fontFamily: FONTS.bold, fontSize: 15, lineHeight: 20 },
  status: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  error: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  track: {
    width: 56,
    height: 32,
    borderWidth: 1,
    borderRadius: 999,
    justifyContent: 'center',
  },
  trackOff: { backgroundColor: '#ECEEF3', borderColor: '#D9DCE5' },
  pending: { opacity: 0.7 },
  thumb: {
    position: 'absolute',
    left: 3,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#181F35',
    shadowOpacity: 0.18,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  thumbOn: { transform: [{ translateX: 24 }] },
});
