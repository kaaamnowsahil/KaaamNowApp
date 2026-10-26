import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';

import StarFilledIcon from '@/assets/icons/star-filled.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const STAR_COLOR = '#F59E0B';

/** Figma Profile (17:2) identity card: tinted initials avatar, name, role · location, rating. */
export const ProfileCard: FC<{
  initials: string;
  imageUri?: string | null;
  name: string;
  caption: string;
  rating?: { avg: number; count: number };
}> = ({ initials, imageUri, name, caption, rating }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
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
      {rating ? (
        <View
          style={[styles.rating, { borderColor: colors.border }]}
          testID="profile-card-rating"
        >
          {rating.count > 0 ? (
            <>
              <StarFilledIcon width={14} height={14} color={STAR_COLOR} />
              <Text style={[styles.ratingValue, { color: colors.text }]}>
                {rating.avg.toFixed(1)}
              </Text>
              <Text style={[styles.ratingCount, { color: colors.textMuted }]}>
                {t('workerProfile.ratingCount', { count: rating.count })}
              </Text>
            </>
          ) : (
            <Text style={[styles.ratingCount, { color: colors.textMuted }]}>
              {t('workerProfile.noRatings')}
            </Text>
          )}
        </View>
      ) : null}
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
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 999,
  },
  ratingValue: { fontFamily: FONTS.bold, fontSize: 13, lineHeight: 18 },
  ratingCount: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
});
