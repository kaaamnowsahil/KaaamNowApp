import { useCallback, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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
import { useBusinessApplicantStore } from '@/pages/businessApplicants/store/useBusinessApplicantStore';
import { useBusinessPaymentStore } from '@/services/business/useBusinessPaymentStore';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

const STARS = [1, 2, 3, 4, 5];

export const BusinessRateWorkerPage: FC<
  AppScreenProps<typeof ROUTES.businessRateWorker>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isLoading = useMockLoading();
  const worker = useBusinessApplicantStore(state =>
    state.applicants.find(item => item.id === route.params.workerId),
  );
  const rateWorker = useBusinessPaymentStore(state => state.rateWorker);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const continueRatingFlow = useCallback(() => {
    const workerIds = route.params.workerIds ?? [];
    const currentIndex = workerIds.indexOf(route.params.workerId);
    const nextWorkerId = workerIds[currentIndex + 1];
    if (nextWorkerId) {
      navigation.replace(ROUTES.businessRateWorker, {
        workerId: nextWorkerId,
        workerIds,
        role: route.params.role,
        business: route.params.business,
      });
      return;
    }
    navigation.navigate(ROUTES.mainTabs, {
      screen: ROUTES.businessShifts,
    });
  }, [navigation, route.params]);

  if (!worker) {
    return (
      <TabScreen
        header={<BrandAppBar onBellPress={() => navigation.navigate(ROUTES.notifications)} />}
        blocks={[
          <ScreenIntro
            key="not-found"
            title={t('businessRating.workerUnavailable')}
            subtitle={t('businessRating.workerUnavailableBody')}
          />,
        ]}
        testID="business-rate-worker-page"
      />
    );
  }

  const tagsOptions = [
    'onTime',
    'skilled',
    'professional',
    'wouldHireAgain',
    'greatAttitude',
  ].map(id => ({
    id,
    label: t(`businessRating.tags.${id}`),
  }));

  const submit = () => {
    if (!rating) return;
    rateWorker({
      workerId: worker.id,
      rating,
      tags,
      comment: comment.trim(),
      createdAt: Date.now(),
    });
    continueRatingFlow();
  };

  const blocks = [
    <ScreenIntro
      key="intro"
      title={t('businessRating.heading', { name: worker.name.split(' ')[0] })}
      subtitle={t('businessRating.subtitle')}
    />,
    <View
      key="worker"
      style={[
        styles.workerCard,
        { backgroundColor: colors.fill, borderColor: colors.border },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={[styles.avatarText, { color: colors.onPrimary }]}>
          {worker.name.charAt(0)}
        </Text>
      </View>
      <View style={styles.workerCopy}>
        <Text style={[styles.workerName, { color: colors.text }]}>
          {worker.name}
        </Text>
        <Text style={[styles.meta, { color: colors.textSubtle }]}>
          {t('businessRating.workerMeta', {
            category: worker.category,
            role: route.params.role,
          })}
        </Text>
      </View>
    </View>,
    <View key="rating" style={styles.ratingBlock}>
      <View style={styles.stars}>
        {STARS.map(star => {
          const Icon = star <= rating ? StarFilledIcon : StarIcon;
          return (
            <Pressable
              key={star}
              accessibilityRole="button"
              accessibilityLabel={t('businessRating.starLabel', { count: star })}
              accessibilityState={{ selected: star <= rating }}
              hitSlop={4}
              onPress={() => setRating(star)}
              testID={`business-rate-star-${star}`}
            >
              <Icon width={34} height={34} color={colors.warning} />
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.ratingLabel, { color: colors.text }]}>
        {t(`businessRating.ratingLabels.${rating}`)}
      </Text>
    </View>,
    <ChipGroup
      key="tags"
      label={t('businessRating.whatWentWell')}
      options={tagsOptions}
      selected={tags}
      onToggle={id =>
        setTags(current =>
          current.includes(id)
            ? current.filter(tag => tag !== id)
            : [...current, id],
        )
      }
    />,
    <TextInput
      key="comment"
      accessibilityLabel={t('businessRating.commentPlaceholder')}
      value={comment}
      onChangeText={setComment}
      placeholder={t('businessRating.commentPlaceholder')}
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
      testID="business-rate-worker-comment"
    />,
    <View key="actions" style={styles.actions}>
      <PrimaryButton
        label={t('businessRating.submit')}
        disabled={!rating}
        onPress={submit}
        testID="business-rate-worker-submit"
      />
      <TextButton
        label={t('businessRating.skip')}
        tone="primary"
        onPress={continueRatingFlow}
      />
    </View>,
  ];

  return (
    <TabScreen
      header={<BrandAppBar onBellPress={() => navigation.navigate(ROUTES.notifications)} />}
      blocks={blocks}
      gap={18}
      isLoading={isLoading}
      testID="business-rate-worker-page"
    />
  );
};

const styles = StyleSheet.create({
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: FONTS.semiBold, fontSize: 17 },
  workerCopy: { flex: 1, gap: 2 },
  workerName: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 19 },
  meta: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 15 },
  ratingBlock: { alignItems: 'center', gap: 8 },
  stars: { flexDirection: 'row', gap: 10 },
  ratingLabel: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
  comment: {
    minHeight: 86,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  actions: { gap: 8 },
});
