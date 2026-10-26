import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { TermsSheet } from '@/components/shiftFlow';
import { OutlineButton, PrimaryButton, SecondaryButton, TextButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { ApiError, errorMessage } from '@/services/api/apiClient';
import { meApi } from '@/services/api/meApi';
import { payInvoice } from '@/services/billing/billingApi';
import { promoApi } from '@/services/promos/promoApi';
import { fromMinor } from '@/services/shifts/shiftMappers';
import { shiftsApi, type ShiftCostEstimate } from '@/services/shifts/shiftsApi';
import { useShiftAction } from '@/services/shifts/useShiftFlow';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps, BusinessShiftSlot } from '@/types';
import { formatRupees } from '@/utils/format';

import { ShiftFieldError } from './components';
import { CancellationPolicyCard } from './components/CancellationPolicyCard';
import { SHIFT_REVIEW_STRINGS as S } from './constants/shiftReviewStrings';
import {
  formatShiftTime,
  parseLocalDate,
  roundedHours,
  toBulkItems,
  uniqueDates,
} from './utils';

const rupees = (minor: number) => formatRupees(fromMinor(minor));

/**
 * Scheduled post: review, cost breakdown with promo, then pay the deposit.
 * - estimate: POST /business/shifts/estimate per shift
 * - post: POST /business/shifts/bulk (publish) then pay each deposit invoice
 */
export const BusinessShiftReviewPage: FC<
  AppScreenProps<typeof ROUTES.businessShiftReview>
> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { draft } = route.params;
  const { busy, run } = useShiftAction();
  const [promoInput, setPromoInput] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [postError, setPostError] = useState('');
  const categories = useApiQuery(() => meApi.workCategories(), []);
  const categoryLabel = (slug: string) =>
    categories.data?.find(category => category.id === slug)?.label ?? slug;

  const estimates = useApiQuery(
    () =>
      Promise.all(
        toBulkItems(draft).map(item =>
          shiftsApi.estimate({
            hourly_rate_minor: item.hourly_rate_minor,
            workers_required: item.workers_required,
            starts_at: item.starts_at,
            ends_at: item.ends_at ?? item.starts_at,
            break_minutes: item.break_minutes,
            promo_code: promoCode || undefined,
          }),
        ),
      ),
    [promoCode],
  );
  const total = (estimates.data ?? []).reduce((sum, e) => sum + e.total_minor, 0);
  const saved = (estimates.data ?? []).reduce(
    (sum, e) => sum + (e.promo_discount_minor ?? 0),
    0,
  );

  const applyPromo = async () => {
    const code = promoInput.trim();
    if (!code || isCheckingPromo) return;
    setIsCheckingPromo(true);
    setPromoError('');
    try {
      await promoApi.validate(code);
      setPromoCode(code);
    } catch (error) {
      setPromoError(errorMessage(error));
    } finally {
      setIsCheckingPromo(false);
    }
  };

  const handlePostError = (error: unknown) => {
    if (error instanceof ApiError && error.code === 'terms_required') {
      setIsTermsOpen(true);
    } else {
      setPostError(`${S.POST_FAILED}: ${errorMessage(error)}`);
    }
    return true;
  };

  const post = () => {
    setPostError('');
    run(
      async () => {
        const created = await shiftsApi.createBulk({
          publish: true,
          promo_code: promoCode || undefined,
          shifts: toBulkItems(draft),
        });
        const unpaidInvoiceIds: string[] = [];
        for (const item of created.items) {
          if (!item.deposit_invoice_id) continue;
          try {
            await payInvoice(item.deposit_invoice_id);
          } catch {
            unpaidInvoiceIds.push(item.deposit_invoice_id);
          }
        }
        return unpaidInvoiceIds;
      },
      unpaidInvoiceIds =>
        navigation.replace(ROUTES.businessShiftPosted, { draft, unpaidInvoiceIds }),
      S.POST_FAILED,
      handlePostError,
    );
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(parseLocalDate(date));

  const renderShift = (slot: BusinessShiftSlot, index: number) => {
    const estimate = estimates.data?.[index];
    return (
      <View
        key={slot.id ?? index}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.details}>
          <Text style={[styles.role, { color: colors.text }]}>{slot.role}</Text>
          <Text style={[styles.detail, { color: colors.textMuted }]}>
            {categoryLabel(slot.category)}
          </Text>
          <Text style={[styles.detail, { color: colors.textMuted }]}>
            {`${formatShiftTime(slot.startTime, i18n.language)} – ${formatShiftTime(
              slot.endTime,
              i18n.language,
            )} · ${t('businessShiftCreate.hoursDuration', {
              hours: roundedHours(slot.startTime, slot.endTime),
            })}`}
          </Text>
          <Text style={[styles.detail, { color: colors.textMuted }]}>
            {t('businessShiftCreate.breakMinutesSummary', {
              count: Number(slot.breakMinutes || 0),
            })}
          </Text>
          <Text style={[styles.detail, { color: colors.textMuted }]}>
            {t('businessShiftCreate.paySummary', {
              workers: Number(slot.workers),
              rate: formatRupees(Number(slot.hourlyRate)),
            })}
          </Text>
          <Text style={[styles.detail, { color: colors.textMuted }]}>
            {slot.responsibilities}
          </Text>
        </View>
        {estimate ? <EstimateRows estimate={estimate} promoCode={promoCode} /> : null}
      </View>
    );
  };

  const groups = uniqueDates(draft).map(date => ({
    date,
    slots: draft.schedules
      .filter(slot => slot.date === date)
      .map(slot => ({ slot, index: draft.schedules.indexOf(slot) })),
  }));

  return (
    <>
      <FormScreen
        busy={busy}
        onBack={navigation.goBack}
        title={t('businessApplicants.headerTitle')}
        subtitle={t('businessDashboard.scheduledStatus')}
        headerTag={t('businessApplicants.headerTag')}
        gap={14}
        testID="business-shift-review-page"
        actions={
          <>
            <PrimaryButton
              label={
                estimates.data ? S.payAndPost(rupees(total)) : t('businessShiftCreate.postShift')
              }
              onPress={post}
              disabled={busy || !estimates.data}
              testID="business-shift-post"
            />
            <SecondaryButton
              label={t('businessShiftCreate.editShift')}
              onPress={navigation.goBack}
              disabled={busy}
              testID="business-shift-edit"
            />
          </>
        }
      >
        <View style={styles.heading}>
          <Text style={[styles.overline, { color: colors.primary }]}>
            {t('businessDashboard.scheduledStatus')} · {t('businessShiftCreate.draftStatus')}
          </Text>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
            {t('businessShiftCreate.review')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSubtle }]}>
            {[draft.schedules[0]?.role || draft.role, draft.location].filter(Boolean).join(' · ')}
          </Text>
        </View>
        {postError ? (
          <Text accessibilityLiveRegion="polite" style={[styles.note, { color: colors.danger }]}>
            {postError}
          </Text>
        ) : null}

        {groups.map(group => (
          <View key={group.date} style={styles.day}>
            <Text style={[styles.dayTitle, { color: colors.text }]}>
              {formatDate(group.date)}
            </Text>
            {group.slots.map(({ slot, index }) => renderShift(slot, index))}
          </View>
        ))}

        {estimates.error ? (
          <Text style={[styles.note, { color: colors.danger }]}>
            {`${S.ESTIMATE_FAILED}: ${estimates.error}`}
          </Text>
        ) : null}

        <View
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.promoLabel, { color: colors.textSubtle }]}>{S.PROMO_LABEL}</Text>
          {promoCode ? (
            <View style={styles.promoRow}>
              <Text style={[styles.promoApplied, { color: colors.success }]}>
                {S.promoApplied(promoCode)}
                {saved > 0 ? S.promoSaved(rupees(saved)) : ''}
              </Text>
              <TextButton
                label={S.PROMO_REMOVE}
                tone="danger"
                onPress={() => {
                  setPromoCode('');
                  setPromoInput('');
                }}
              />
            </View>
          ) : (
            <View style={styles.promoRow}>
              <TextInput
                accessibilityLabel={S.PROMO_LABEL}
                value={promoInput}
                onChangeText={text => {
                  setPromoInput(text);
                  setPromoError('');
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={32}
                placeholder={S.PROMO_PLACEHOLDER}
                placeholderTextColor={colors.textSubtle}
                style={[
                  styles.promoInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderColor: promoError ? colors.danger : colors.border,
                  },
                ]}
                testID="business-shift-promo-input"
              />
              <OutlineButton
                label={S.PROMO_APPLY}
                tone="primary"
                disabled={busy || isCheckingPromo || !promoInput.trim()}
                onPress={applyPromo}
                testID="business-shift-promo-apply"
              />
            </View>
          )}
          <ShiftFieldError message={promoError && `${S.PROMO_FAILED}: ${promoError}`} />
        </View>

        <View
          style={[
            styles.card,
            styles.totalCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.detail, { color: colors.textMuted }]}>{S.ESTIMATED_TOTAL}</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>{rupees(total)}</Text>
        </View>

        <CancellationPolicyCard onReadTerms={() => navigation.navigate(ROUTES.terms)} />

        <Text style={[styles.note, { color: colors.textSubtle }]}>{S.DEPOSIT_NOTE}</Text>
        <Text style={[styles.note, { color: colors.textSubtle }]}>
          {t('businessShiftCreate.reviewNote')}
        </Text>
      </FormScreen>
      {isTermsOpen ? (
        <TermsSheet
          audience="business"
          onRead={() => navigation.navigate(ROUTES.terms)}
          onClose={() => setIsTermsOpen(false)}
          onAccepted={() => {
            setIsTermsOpen(false);
            post();
          }}
        />
      ) : null}
    </>
  );
};

const EstimateRows: FC<{ estimate: ShiftCostEstimate; promoCode: string }> = ({
  estimate,
  promoCode,
}) => {
  const { colors } = useTheme();
  const discount = estimate.promo_discount_minor ?? 0;
  return (
    <View style={[styles.estimate, { borderTopColor: colors.border }]}>
      <CostRow label={S.WORKERS_PAY} value={rupees(estimate.worker_subtotal_minor)} />
      {estimate.gateway_fee_minor > 0 ? (
        <CostRow
          label={S.gatewayFee(estimate.gateway_fee_percentage)}
          value={rupees(estimate.gateway_fee_minor)}
        />
      ) : null}
      <CostRow
        label={S.platformCommission(estimate.fee_percentage)}
        value={rupees(estimate.platform_fee_minor)}
      />
      {promoCode && discount > 0 ? (
        <CostRow label={S.promoDiscount(promoCode)} value={`−${rupees(discount)}`} tone="success" />
      ) : null}
      <CostRow label={S.SHIFT_TOTAL} value={rupees(estimate.total_minor)} isTotal />
    </View>
  );
};

const CostRow: FC<{
  label: string;
  value: string;
  tone?: 'success';
  isTotal?: boolean;
}> = ({ label, value, tone, isTotal }) => {
  const { colors } = useTheme();
  const valueColor = tone === 'success' ? colors.success : colors.text;
  return (
    <View style={styles.costRow}>
      <Text
        style={[
          isTotal ? styles.totalText : styles.costLabel,
          { color: isTotal ? colors.text : colors.textMuted },
        ]}
      >
        {label}
      </Text>
      <Text style={[isTotal ? styles.totalText : styles.costValue, { color: valueColor }]}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: { gap: 5 },
  overline: {
    fontFamily: FONTS.semiBold,
    fontSize: 9,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  title: { fontFamily: FONTS.bold, fontSize: 21, lineHeight: 28 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  day: { gap: 10 },
  dayTitle: { fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 21 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  details: { gap: 4 },
  role: { fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 21 },
  detail: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 19 },
  estimate: { borderTopWidth: 1, paddingTop: 10, gap: 6 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  costLabel: { flex: 1, fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  costValue: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
  totalText: { fontFamily: FONTS.bold, fontSize: 14, lineHeight: 20 },
  promoLabel: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
  promoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  promoInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  promoApplied: { flex: 1, fontFamily: FONTS.semiBold, fontSize: 13 },
  totalCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalValue: { fontFamily: FONTS.bold, fontSize: 16 },
  note: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
});
