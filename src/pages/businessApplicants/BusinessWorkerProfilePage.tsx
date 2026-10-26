import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BadgeCheckIcon from '@/assets/figma/badge-check.svg';
import UserRoundIcon from '@/assets/figma/user-round.svg';
import { StatTiles } from '@/components/shiftFlow';
import { EmptyState } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { meApi } from '@/services/api/meApi';
import { formatDateLabel } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { WorkerAvatar } from './components';
import { WORKER_PROFILE_STRINGS as S } from './constants/bookedWorkersStrings';

const HEADER_TITLE = 'Business mode';
const HEADER_TAG = 'Business';

const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

/** What a business sees about a booked worker. Data: GET /me/workers/{id}. */
export const BusinessWorkerProfilePage: FC<
  AppScreenProps<typeof ROUTES.businessWorkerProfile>
> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { workerId } = route.params;
  const profile = useApiQuery(() => shiftsApi.workerProfile(workerId), [workerId]);
  const categories = useApiQuery(() => meApi.workCategories(), []);
  const worker = profile.data;
  const categoryNames = (worker?.category_slugs ?? []).map(
    slug => categories.data?.find(option => option.id === slug)?.label ?? slug,
  );
  const isVerified = worker?.verification_status === 'verified';

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={HEADER_TITLE}
      compactTitle
      headerTag={HEADER_TAG}
      gap={16}
      isLoading={profile.isLoading}
      testID="business-worker-profile-page"
    >
      {!worker ? (
        <EmptyState
          icon={UserRoundIcon}
          title={S.LOAD_FAILED}
          body={profile.error ?? ''}
          action={S.RETRY}
          onAction={profile.reload}
        />
      ) : (
        <>
          <View style={styles.identity}>
            <WorkerAvatar name={worker.full_name} photoUrl={worker.photo_url} size={72} />
            <View style={styles.identityCopy}>
              <Text style={[styles.name, { color: colors.text }]}>{worker.full_name}</Text>
              <View style={styles.verifiedRow}>
                {isVerified ? (
                  <BadgeCheckIcon width={16} height={16} color={colors.success} />
                ) : null}
                <Text
                  style={[
                    styles.verified,
                    { color: isVerified ? colors.success : colors.textSubtle },
                  ]}
                >
                  {isVerified ? S.VERIFIED : S.NOT_VERIFIED}
                </Text>
              </View>
              <Text style={[styles.meta, { color: colors.textSubtle }]}>
                {[worker.locality, S.memberSince(monthYear(worker.member_since))]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </View>
          </View>

          <StatTiles
            items={[
              {
                value: worker.rating_count ? `★ ${worker.rating_avg.toFixed(1)}` : S.NO_RATING,
                label: `${S.RATING} · ${S.reviewsCount(worker.rating_count)}`,
              },
              { value: String(worker.completed_shift_count), label: S.SHIFTS_DONE },
            ]}
          />

          {categoryNames.length ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{S.WORK_TYPES}</Text>
              <View style={styles.chips}>
                {categoryNames.map(name => (
                  <Text
                    key={name}
                    style={[
                      styles.chip,
                      { color: colors.primary, backgroundColor: colors.primarySoft },
                    ]}
                  >
                    {name}
                  </Text>
                ))}
              </View>
            </View>
          ) : null}

          <View style={[styles.section, styles.reviewsSection]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{S.REVIEWS}</Text>
            {worker.recent_reviews.length ? (
              worker.recent_reviews.map(review => (
                <View
                  key={`${review.rater_name}-${review.created_at}`}
                  style={[styles.review, { borderColor: colors.border }]}
                >
                  <View style={styles.reviewTop}>
                    <Text style={[styles.stars, { color: colors.warning }]}>
                      {'★'.repeat(review.stars)}
                      <Text style={{ color: colors.border }}>{'★'.repeat(5 - review.stars)}</Text>
                    </Text>
                    <Text style={[styles.meta, { color: colors.textSubtle }]}>
                      {formatDateLabel(review.created_at)}
                    </Text>
                  </View>
                  {review.review ? (
                    <Text style={[styles.body, { color: colors.text }]}>{review.review}</Text>
                  ) : null}
                  {review.tags.length ? (
                    <Text style={[styles.meta, { color: colors.textMuted }]}>
                      {review.tags.join(' · ')}
                    </Text>
                  ) : null}
                  <Text style={[styles.meta, { color: colors.textSubtle }]}>
                    {review.rater_name}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.body, { color: colors.textSubtle }]}>{S.NO_REVIEWS}</Text>
            )}
          </View>
        </>
      )}
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  identityCopy: { flex: 1, gap: 3 },
  name: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 27 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verified: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 17 },
  meta: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
  section: { gap: 8 },
  reviewsSection: { paddingTop: 12 },
  sectionTitle: { fontFamily: FONTS.semiBold, fontSize: 16, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  review: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 6 },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stars: { fontSize: 14, lineHeight: 18 },
  body: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 19 },
});
