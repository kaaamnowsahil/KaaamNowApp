import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { toneColor, type Tone } from '@/theme/tone';

export type StatTile = { value: string; label: string; tone?: Tone };

/** Side-by-side filled tiles: "₹150/h · Hourly rate", "8 min · ETA" (Live shift 10). */
export const StatTiles: FC<{ items: StatTile[] }> = ({ items }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {items.map(item => (
        <View
          key={item.label}
          style={[styles.tile, { backgroundColor: colors.fill }]}
        >
          <Text
            style={[
              styles.value,
              { color: toneColor(colors, item.tone ?? 'default') },
            ]}
          >
            {item.value}
          </Text>
          <Text style={[styles.label, { color: colors.textSubtle }]}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, borderRadius: 14, padding: 14, gap: 4 },
  value: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 26 },
  label: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
});
