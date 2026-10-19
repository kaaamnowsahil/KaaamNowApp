import { Children, type FC, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import ChevronRight from '@/assets/figma/chevron-right.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/** Figma Profile (17:2) section: uppercase label over a bordered card of rows. */
export const SettingsGroup: FC<{ title?: string; children: ReactNode }> = ({
  title,
  children,
}) => {
  const { colors } = useTheme();
  const rows = Children.toArray(children);
  return (
    <View style={styles.section}>
      {title ? (
        <Text style={[styles.label, { color: colors.textSubtle }]}>
          {title.toUpperCase()}
        </Text>
      ) : null}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.fill, borderColor: colors.border },
        ]}
      >
        {rows.map((row, i) => (
          <View
            key={i}
            style={
              i > 0 && [styles.divided, { borderTopColor: colors.border }]
            }
          >
            {row}
          </View>
        ))}
      </View>
    </View>
  );
};

export const SettingsRow: FC<{
  icon: FC<SvgProps>;
  title: string;
  value?: string;
  onPress?: () => void;
  tone?: 'default' | 'danger';
  testID?: string;
}> = ({ icon: Icon, title, value, onPress, tone = 'default', testID }) => {
  const { colors } = useTheme();
  const isDanger = tone === 'danger';
  const accent = isDanger ? colors.danger : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.iconTile,
          {
            backgroundColor: isDanger ? colors.dangerSoft : colors.primarySoft,
          },
        ]}
      >
        <Icon width={18} height={18} color={accent} />
      </View>
      <Text
        style={[
          styles.title,
          isDanger ? styles.dangerTitle : null,
          { color: isDanger ? colors.danger : colors.text },
        ]}
      >
        {title}
      </Text>
      {value ? (
        <Text style={[styles.value, { color: colors.textSubtle }]}>
          {value}
        </Text>
      ) : null}
      {isDanger ? null : (
        <ChevronRight width={18} height={18} color={colors.textMuted} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  section: { gap: 10 },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1,
  },
  card: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  divided: { borderTopWidth: 1 },
  row: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressed: { opacity: 0.7 },
  iconTile: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    lineHeight: 21,
  },
  dangerTitle: { fontFamily: FONTS.medium },
  value: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18.2 },
});
