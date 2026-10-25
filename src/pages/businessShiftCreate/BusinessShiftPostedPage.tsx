import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { formatShiftTime, parseLocalDate } from './utils';

export const BusinessShiftPostedPage: FC<
  AppScreenProps<typeof ROUTES.businessShiftPosted>
> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { draft } = route.params;
  const schedules = draft.schedules.map(schedule => ({
    date: new Intl.DateTimeFormat(i18n.language, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(parseLocalDate(schedule.date)),
    time: `${formatShiftTime(
      schedule.startTime,
      i18n.language,
    )} – ${formatShiftTime(schedule.endTime, i18n.language)}`,
  }));

  return (
    <FormScreen
      onBack={() =>
        navigation.navigate(ROUTES.mainTabs, {
          screen: ROUTES.businessShifts,
        })
      }
      title={t('businessApplicants.headerTitle')}
      subtitle={t('businessShiftCreate.scheduledShiftSubtitle')}
      gap={12}
      testID="business-shift-posted-page"
      actions={
        <>
          <PrimaryButton
            label={t('businessShiftCreate.reviewApplicants')}
            onPress={() =>
              navigation.navigate(ROUTES.mainTabs, {
                screen: ROUTES.businessApplicants,
              })
            }
            testID="business-shift-review-applicants"
          />
          <SecondaryButton
            label={t('businessShiftCreate.viewShifts')}
            onPress={() =>
              navigation.navigate(ROUTES.mainTabs, {
                screen: ROUTES.businessShifts,
              })
            }
            testID="business-shift-view-shifts"
          />
        </>
      }
    >
      <Text style={[styles.overline, { color: colors.primary }]}>
        {t('businessShiftCreate.postedOverline')}
      </Text>
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: colors.text }]}
      >
        {t('businessShiftCreate.postedTitle')}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSubtle }]}>
        {t('businessShiftCreate.postedSubtitle')}
      </Text>

      {schedules.map((schedule, index) => (
        <View
          key={`${schedule.date}-${schedule.time}`}
          style={[
            styles.card,
            styles.shiftCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.shiftCopy}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {draft.schedules[index]?.role ?? draft.role}
            </Text>
            <Text style={[styles.caption, { color: colors.textSubtle }]}>
              {schedule.date} · {schedule.time}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate(ROUTES.mainTabs, {
                screen: ROUTES.businessApplicants,
              })
            }
            hitSlop={8}
            testID={`business-shift-open-${index}`}
          >
            <Text style={[styles.open, { color: colors.primary }]}>
              {t('businessShiftCreate.openShift')}
            </Text>
          </Pressable>
        </View>
      ))}

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.applicationRow}>
          <View style={styles.applicationCopy}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {t('businessShiftCreate.applications')}
            </Text>
            <Text style={[styles.caption, { color: colors.textSubtle }]}>
              {t('businessShiftCreate.waiting')}
            </Text>
          </View>
          <Text style={[styles.count, { color: colors.textSubtle }]}>0</Text>
        </View>
      </View>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  overline: {
    fontFamily: FONTS.semiBold,
    fontSize: 9,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  title: { fontFamily: FONTS.bold, fontSize: 21, lineHeight: 28 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 4 },
  shiftCard: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  shiftCopy: { flex: 1, gap: 3 },
  cardTitle: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 17 },
  caption: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 14 },
  open: { fontFamily: FONTS.semiBold, fontSize: 10, lineHeight: 15 },
  applicationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  applicationCopy: { flex: 1, gap: 4 },
  count: { fontFamily: FONTS.semiBold, fontSize: 10 },
});
