import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, TextInput, View } from 'react-native';

import { InfoCallout } from '@/components/shiftFlow';
import { PrimaryButton, TextButton } from '@/components/ui';
import type { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { styles as cardStyles } from '@/pages/applyCoupon/applyCoupon.styles';
import { WORKER_EARNINGS_STRINGS as S } from '@/pages/workerEarnings/constants';
import { errorMessage } from '@/services/api/apiClient';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { discountKey, reasonKey, sortOffers } from '@/services/promos/couponLogic';
import { promoApi, type CouponOffer, type PromoView } from '@/services/promos/promoApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

const rupees = (minor: number) => formatRupees(minor / 100);

type CouponsData =
  | { kind: 'business'; items: CouponOffer[] }
  | { kind: 'worker'; pending: PromoView | null };

const OfferCard: FC<{ offer: CouponOffer }> = ({ offer }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const discount = discountKey(offer);
  const values = {
    ...discount.values,
    target: t(String(discount.values.target)),
    amount:
      discount.values.amountMinor == null ? '' : rupees(Number(discount.values.amountMinor)),
  };

  return (
    <View
      style={[
        cardStyles.card,
        {
          backgroundColor: offer.eligible ? colors.primarySoft : colors.fill,
          borderColor: offer.eligible ? colors.primary : colors.border,
        },
        !offer.eligible && cardStyles.cardUnavailable,
      ]}
    >
      <View style={cardStyles.cardHead}>
        <Text style={[cardStyles.code, { color: colors.text }]}>{offer.code.toUpperCase()}</Text>
        {offer.is_voucher ? (
          <Text style={[cardStyles.badge, { color: colors.primary, backgroundColor: colors.surface }]}>
            {t('coupons.assigned')}
          </Text>
        ) : null}
      </View>
      {offer.title ? <Text style={[cardStyles.title, { color: colors.textMuted }]}>{offer.title}</Text> : null}
      <Text style={[cardStyles.discount, { color: colors.text }]}>{t(discount.key, values)}</Text>
      {offer.max_discount_minor != null ? (
        <Text style={[cardStyles.term, { color: colors.textMuted }]}>
          {t('coupons.maxDiscount', { amount: rupees(offer.max_discount_minor) })}
        </Text>
      ) : null}
      {offer.min_booking_minor != null ? (
        <Text style={[cardStyles.term, { color: colors.textMuted }]}>
          {t('coupons.minBooking', { amount: rupees(offer.min_booking_minor) })}
        </Text>
      ) : null}
      {offer.valid_until ? (
        <Text style={[cardStyles.term, { color: colors.textMuted }]}>
          {t('coupons.validUntil', {
            date: new Date(offer.valid_until).toLocaleDateString(i18n.language, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
          })}
        </Text>
      ) : null}
      {!offer.eligible ? (
        <Text style={[cardStyles.reason, { color: colors.danger }]}>{t(reasonKey(offer.ineligible_reason))}</Text>
      ) : null}
    </View>
  );
};

const WorkerRedeem: FC<{
  pending: PromoView | null;
  onRedeemed: (pending: PromoView | null) => void;
}> = ({ pending, onRedeemed }) => {
  const { colors } = useTheme();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const redeem = async () => {
    const next = code.trim();
    if (!next || busy) return;
    setBusy(true);
    try {
      const status = await promoApi.redeem(next);
      setCode('');
      onRedeemed(status.pending);
      Alert.alert(S.PROMO_DONE, S.promoPending(next));
    } catch (error) {
      Alert.alert(S.PROMO_FAILED, errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={cardStyles.form}>
      <Text style={[cardStyles.label, { color: colors.textSubtle }]}>{S.PROMO_LABEL}</Text>
      {pending ? (
        <InfoCallout text={S.promoPending(pending.code)} />
      ) : (
        <View style={cardStyles.formRow}>
          <TextInput
            accessibilityLabel={S.PROMO_LABEL}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!busy}
            onChangeText={setCode}
            onSubmitEditing={() => void redeem()}
            placeholder={S.PROMO_PLACEHOLDER}
            placeholderTextColor={colors.textSubtle}
            style={[
              cardStyles.input,
              { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            value={code}
          />
          <TextButton label={S.PROMO_REDEEM} onPress={() => void redeem()} tone="primary" />
        </View>
      )}
    </View>
  );
};

/** Profile → Coupons. A business sees its offers; a worker redeems a code for the next payout. */
export const MyCouponsPage: FC<AppScreenProps<typeof ROUTES.myCoupons>> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isBusiness = useAuthStore(state => state.role) === 'business';
  const query = useApiQuery<CouponsData>(async () => {
    if (isBusiness) {
      const listed = await promoApi.listed();
      return { kind: 'business', items: sortOffers(listed.items) };
    }
    const status = await promoApi.workerStatus();
    return { kind: 'worker', pending: status.pending };
  }, [isBusiness]);

  return (
    <FormScreen
      busy={query.isRefreshing}
      gap={14}
      isLoading={query.isLoading}
      onBack={navigation.goBack}
      testID="my-coupons-page"
      title={isBusiness ? t('coupons.row.label') : S.PROMO_LABEL}
    >
      {query.error && !query.data ? (
        <>
          <Text style={[cardStyles.status, { color: colors.danger }]}>{query.error}</Text>
          <PrimaryButton label={t('coupons.retry')} onPress={() => void query.reload()} />
        </>
      ) : null}
      {query.data?.kind === 'business' && query.data.items.length === 0 ? (
        <Text style={[cardStyles.status, { color: colors.textMuted }]}>{t('coupons.none')}</Text>
      ) : null}
      {query.data?.kind === 'business' && query.data.items.length > 0 ? (
        <View style={cardStyles.list}>
          <Text style={[cardStyles.heading, { color: colors.text }]}>{t('coupons.available')}</Text>
          {query.data.items.map(offer => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </View>
      ) : null}
      {query.data?.kind === 'worker' ? (
        <WorkerRedeem
          onRedeemed={pending => query.setData({ kind: 'worker', pending })}
          pending={query.data.pending}
        />
      ) : null}
    </FormScreen>
  );
};
