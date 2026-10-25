import type { FC } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/** Figma Profile (17:2) identity card: tinted initials avatar, name, role · location. */
export const ProfileCard: FC<{
  initials: string;
  imageUri?: string | null;
  name: string;
  caption: string;
}> = ({ initials, imageUri, name, caption }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.fill, borderColor: colors.border },
      ]}
      testID="profile-card"
    >
      <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={[styles.initials, { color: colors.primary }]}>
            {initials}
          </Text>
        )}
      </View>
      <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
      <Text style={[styles.caption, { color: colors.textMuted }]}>
        {caption}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  image: { width: 52, height: 52, borderRadius: 26 },
  initials: { fontFamily: FONTS.bold, fontSize: 18, lineHeight: 24 },
  name: { fontFamily: FONTS.bold, fontSize: 17, lineHeight: 23.8 },
  caption: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 18.2,
    marginTop: 2,
  },
});
