import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import CheckIcon from '@/assets/icons/check.svg';
import { PopIn } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { toneColor, type Tone } from '@/theme/tone';

/**
 * Status header: tinted overline, centred icon disc, title and note.
 * - regular: 56px disc with a ringed 14px icon ("Shift secured", "Shift completed")
 * - large: 80px disc with a plain 36px icon that carries its own circle
 *   ("Application submitted", "You've been selected")
 */
export const StatusHero: FC<{
  overline: string;
  title: string;
  subtitle: string;
  icon?: FC<SvgProps>;
  tone?: Tone;
  size?: 'regular' | 'large';
}> = ({
  overline,
  title,
  subtitle,
  icon: Icon = CheckIcon,
  tone = 'success',
  size = 'regular',
}) => {
  const { colors } = useTheme();
  const accent = toneColor(colors, tone);
  const isLarge = size === 'large';
  return (
    <View style={styles.root}>
      <Text
        style={[
          styles.overline,
          isLarge && styles.overlineLarge,
          { color: accent },
        ]}
      >
        {overline}
      </Text>
      <PopIn
        style={[
          styles.disc,
          isLarge && styles.discLarge,
          { backgroundColor: colors.fill, borderColor: colors.border },
        ]}
      >
        {isLarge ? (
          <Icon width={36} height={36} color={accent} />
        ) : (
          <View style={[styles.ring, { borderColor: accent }]}>
            <Icon width={14} height={14} color={accent} />
          </View>
        )}
      </PopIn>
      <Text
        accessibilityRole="header"
        style={[
          styles.title,
          isLarge && styles.titleLarge,
          { color: colors.text },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.subtitle,
          isLarge && styles.subtitleLarge,
          { color: colors.textMuted },
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { gap: 4 },
  overline: { fontFamily: FONTS.semiBold, fontSize: 10, lineHeight: 14 },
  overlineLarge: { fontSize: 11, lineHeight: 15.4 },
  disc: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 28,
  },
  discLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 40,
    marginBottom: 36,
  },
  ring: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 26 },
  titleLarge: { fontSize: 25, lineHeight: 31 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18.2 },
  subtitleLarge: { fontSize: 15, lineHeight: 21, marginTop: 4 },
});
