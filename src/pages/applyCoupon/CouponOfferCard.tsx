import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { OutlineButton, TextButton } from '@/components/ui';
import { discountKey, reasonKey } from '@/services/promos/couponLogic';
import type { CouponOffer } from '@/services/promos/promoApi';
import { useTheme } from '@/theme/ThemeProvider';
import { formatRupees } from '@/utils/format';

import { styles } from './applyCoupon.styles';

const rupees = (minor: number) => formatRupees(minor / 100);

type Props = {
  offer: CouponOffer;
  applied: boolean;
  disabled: boolean;
  pending: boolean;
  onApply: () => void;
  onRemove: () => void;
};

export const CouponOfferCard: FC<Props> = ({
  offer,
  applied,
  disabled,
  pending,
  onApply,
  onRemove,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const discount = discountKey(offer);
  const code = offer.code.toUpperCase();
  const values = {
    ...discount.values,
    target: t(String(discount.values.target)),
    amount:
      discount.values.amountMinor == null
        ? ''
        : rupees(Number(discount.values.amountMinor)),
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: applied ? colors.primary : colors.border,
        },
        !offer.eligible && styles.cardUnavailable,
      ]}
      testID={`coupon-offer-${offer.code}`}
    >
      <View style={styles.cardHead}>
        <Text style={[styles.code, { color: colors.text }]}>{code}</Text>
        {offer.is_voucher ? (
          <Text
            style={[
              styles.badge,
              { color: colors.primary, backgroundColor: colors.primarySoft },
            ]}
          >
            {t('coupons.assigned')}
          </Text>
        ) : null}
        {applied ? (
          <Text
            style={[
              styles.badge,
              { color: colors.success, backgroundColor: colors.successSoft },
            ]}
          >
            {t('coupons.applied')}
          </Text>
        ) : null}
      </View>
      {offer.title ? (
        <Text style={[styles.title, { color: colors.textMuted }]}>
          {offer.title}
        </Text>
      ) : null}
      <Text style={[styles.discount, { color: colors.text }]}>
        {t(discount.key, values)}
      </Text>
      {offer.max_discount_minor != null ? (
        <Text style={[styles.term, { color: colors.textSubtle }]}>
          {t('coupons.maxDiscount', {
            amount: rupees(offer.max_discount_minor),
          })}
        </Text>
      ) : null}
      {offer.min_booking_minor != null ? (
        <Text style={[styles.term, { color: colors.textSubtle }]}>
          {t('coupons.minBooking', { amount: rupees(offer.min_booking_minor) })}
        </Text>
      ) : null}
      {offer.valid_until ? (
        <Text style={[styles.term, { color: colors.textSubtle }]}>
          {t('coupons.validUntil', {
            date: new Intl.DateTimeFormat(i18n.language, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }).format(new Date(offer.valid_until)),
          })}
        </Text>
      ) : null}
      {!offer.eligible ? (
        <Text style={[styles.reason, { color: colors.danger }]}>
          {t(reasonKey(offer.ineligible_reason))}
        </Text>
      ) : null}
      <View style={styles.action}>
        {applied ? (
          <TextButton
            label={t('coupons.removeCode', { code })}
            tone="danger"
            onPress={() => !disabled && onRemove()}
            testID={`coupon-remove-${offer.code}`}
          />
        ) : (
          <OutlineButton
            label={
              pending ? t('coupons.applying') : t('coupons.applyCode', { code })
            }
            tone="primary"
            disabled={disabled || !offer.eligible}
            onPress={onApply}
            testID={`coupon-apply-${offer.code}`}
          />
        )}
      </View>
    </View>
  );
};
