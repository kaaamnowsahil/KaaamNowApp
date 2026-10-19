import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/** Figma "Live · New request nearby": notification preview with the "K" app tile. */
export const PushPreview: FC<{
  initial: string;
  meta: string;
  title: string;
  body: string;
}> = ({ initial, meta, title, body }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.fill, borderColor: colors.border },
      ]}
    >
      <View style={[styles.tile, { backgroundColor: colors.primary }]}>
        <Text style={[styles.initial, { color: colors.onPrimary }]}>
          {initial}
        </Text>
      </View>
      <View style={styles.text}>
        <Text style={[styles.meta, { color: colors.textSubtle }]}>{meta}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tile: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontFamily: FONTS.bold, fontSize: 15, lineHeight: 20 },
  text: { flex: 1 },
  meta: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
  title: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18.2 },
  body: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
});
