import { useCallback, useState, type FC } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import StarFilledIcon from '@/assets/icons/star-filled.svg';
import StarIcon from '@/assets/icons/star.svg';
import {
  BrandAppBar,
  ChipGroup,
  PrimaryButton,
  ScreenIntro,
  TextButton,
} from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { TabScreen } from '@/layout/TabScreen';
import { useHardwareBack } from '@/shared/hooks/useHardwareBack';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useShiftAction } from '@/services/shifts/useShiftFlow';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { RATE_BUSINESS_STRINGS } from './constants';

const STARS = [1, 2, 3, 4, 5];

/**
 * Live shift step 9. Figma: NEW · Rating · Worker rates Business (light/dark).
 * No back button by design; submit, skip or Android back return to My shifts.
 * - data: GET /catalog/rating-tags; POST /assignments/{id}/ratings
 */
export const RateBusinessPage: FC<
  AppScreenProps<typeof ROUTES.rateBusiness>
> = ({ navigation, route }) => {
  const { shift } = route.params;
  const { colors } = useTheme();
  const tagOptions = useApiQuery(
    async () =>
      (await shiftsApi.ratingTags('worker_to_business')).map(tag => ({ id: tag, label: tag })),
    [],
  );
  const action = useShiftAction();
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const done = useCallback(
    () => navigation.popTo(ROUTES.mainTabs, { screen: ROUTES.workerShifts }),
    [navigation],
  );
  useHardwareBack(done);

  const blocks = [
    <ScreenIntro
      key="intro"
      title={RATE_BUSINESS_STRINGS.heading(shift.businessName)}
      subtitle={RATE_BUSINESS_STRINGS.SUBTITLE}
    />,
    <View
      key="business"
      style={[
        styles.card,
        { backgroundColor: colors.fill, borderColor: colors.border },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={[styles.avatarText, { color: colors.onPrimary }]}>
          {shift.businessName.charAt(0)}
        </Text>
      </View>
      <View style={styles.flex}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {shift.businessName}
        </Text>
        <Text style={[styles.cardCaption, { color: colors.textSubtle }]}>
          {RATE_BUSINESS_STRINGS.businessMeta(shift.isVerified, shift.title)}
        </Text>
      </View>
    </View>,
    <View key="stars" style={styles.ratingBlock}>
      <View style={styles.stars}>
        {STARS.map(n => {
          const Icon = n <= rating ? StarFilledIcon : StarIcon;
          return (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityLabel={RATE_BUSINESS_STRINGS.starLabel(n)}
              accessibilityState={{ selected: n <= rating }}
              hitSlop={4}
              onPress={() => setRating(n)}
              testID={`rate-star-${n}`}
            >
              <Icon width={34} height={34} color={colors.warning} />
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.ratingLabel, { color: colors.text }]}>
        {RATE_BUSINESS_STRINGS.RATING_LABEL[rating]}
      </Text>
    </View>,
    <ChipGroup
      key="tags"
      label={RATE_BUSINESS_STRINGS.WENT_WELL}
      options={tagOptions.data ?? []}
      selected={tags}
      onToggle={id =>
        setTags(prev =>
          prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id],
        )
      }
    />,
    <TextInput
      key="comment"
      accessibilityLabel={RATE_BUSINESS_STRINGS.COMMENT_PLACEHOLDER}
      value={comment}
      onChangeText={setComment}
      placeholder={RATE_BUSINESS_STRINGS.COMMENT_PLACEHOLDER}
      placeholderTextColor={colors.textSubtle}
      multiline
      textAlignVertical="top"
      style={[
        styles.comment,
        {
          color: colors.text,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      testID="rate-business-comment"
    />,
    <View key="actions" style={styles.actions}>
      <PrimaryButton
        label={RATE_BUSINESS_STRINGS.SUBMIT}
        disabled={!rating || action.busy || !shift.assignmentId}
        onPress={() =>
          action.run(
            () =>
              shiftsApi.rate(shift.assignmentId as string, {
                stars: rating,
                tags,
                review: comment.trim(),
              }),
            done,
            RATE_BUSINESS_STRINGS.SUBMIT_FAILED,
          )
        }
        testID="rate-business-submit"
      />
      <TextButton label={RATE_BUSINESS_STRINGS.SKIP} tone="primary" onPress={done} />
    </View>,
  ];

  return (
    <TabScreen
      busy={action.busy}
      header={
        <BrandAppBar
          onBellPress={() => navigation.navigate(ROUTES.notifications)}
        />
      }
      blocks={blocks}
      gap={18}
      isLoading={tagOptions.isLoading}
      testID="rate-business-page"
    />
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: FONTS.semiBold, fontSize: 18 },
  flex: { flex: 1, gap: 2 },
  cardTitle: { fontFamily: FONTS.semiBold, fontSize: 16, lineHeight: 22 },
  cardCaption: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18.2 },
  ratingBlock: { alignItems: 'center', gap: 10 },
  stars: { flexDirection: 'row', gap: 10 },
  ratingLabel: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 19.6 },
  comment: {
    minHeight: 92,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: { gap: 8 },
});
