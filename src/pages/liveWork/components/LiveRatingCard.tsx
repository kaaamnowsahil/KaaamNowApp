import { useEffect, useState, type FC } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import StarFilledIcon from '@/assets/icons/star-filled.svg';
import StarIcon from '@/assets/icons/star.svg';
import { PrimaryButton, TextField } from '@/components/ui';
import { liveErrorText } from '@/services/liveWork/liveWorkFormat';
import { LIVE_TEXT as S } from '@/services/liveWork/liveWorkStrings';
import {
  shiftsApi,
  type AssignmentRatings,
} from '@/services/shifts/shiftsApi';
import { useTheme } from '@/theme/ThemeProvider';

import { LiveCard, LiveText } from './LiveWorkUi';

const STARS = [1, 2, 3, 4, 5];

/** Rate the other side once a Live Work seat is done; shows the given rating afterwards. */
export const LiveRatingCard: FC<{
  assignmentId: string;
  name: string;
}> = ({ assignmentId, name }) => {
  const { colors } = useTheme();
  const [ratings, setRatings] = useState<AssignmentRatings | null>(null);
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    shiftsApi.ratings(assignmentId).then(
      next => {
        if (!cancelled) setRatings(next);
      },
      () => undefined,
    );
    return () => {
      cancelled = true;
    };
  }, [assignmentId]);

  if (!ratings) return null;
  const mine = ratings.items.find(item => item.direction === ratings.my_direction);
  if (!mine && !ratings.can_rate) return null;

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await shiftsApi.rate(assignmentId, {
        stars,
        tags: [],
        review: review.trim(),
      });
      setRatings(await shiftsApi.ratings(assignmentId));
    } catch (cause) {
      setError(liveErrorText(cause));
    } finally {
      setBusy(false);
    }
  };

  const shown = mine?.stars ?? stars;
  return (
    <LiveCard testID={`live-rating-${assignmentId}`}>
      <LiveText tone="label">
        {mine ? S.ratedTitle : S.rateTitle(name)}
      </LiveText>
      <View style={styles.stars}>
        {STARS.map(value => {
          const Icon = value <= shown ? StarFilledIcon : StarIcon;
          return (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={S.starsLabel(value)}
              accessibilityState={{
                selected: value <= shown,
                disabled: busy || Boolean(mine),
              }}
              disabled={busy || Boolean(mine)}
              hitSlop={4}
              onPress={() => setStars(value)}
              testID={`live-rating-star-${value}`}
            >
              <Icon width={32} height={32} color={colors.warning} />
            </Pressable>
          );
        })}
      </View>
      {mine ? (
        mine.review ? <LiveText>{`“${mine.review}”`}</LiveText> : null
      ) : (
        <>
          <TextField
            label={S.reviewLabel}
            value={review}
            onChangeText={setReview}
            placeholder={S.reviewPlaceholder}
            multiline
            maxLength={1000}
            textAlignVertical="top"
            style={styles.review}
            testID="live-rating-comment"
          />
          {error ? <LiveText tone="danger">{error}</LiveText> : null}
          <PrimaryButton
            label={S.submitRating}
            disabled={busy || stars === 0}
            onPress={() => void submit()}
            testID="live-rating-submit"
          />
        </>
      )}
    </LiveCard>
  );
};

const styles = StyleSheet.create({
  stars: { flexDirection: 'row', gap: 10 },
  review: { minHeight: 72 },
});
