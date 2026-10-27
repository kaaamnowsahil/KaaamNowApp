import { useCallback, useEffect, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, View } from 'react-native';

import { OutlineButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import {
  useCouponSession,
  type CouponSession,
} from '@/services/promos/useCouponSession';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { CouponOfferCard } from './CouponOfferCard';
import { styles } from './applyCoupon.styles';
import { useApplyCoupon } from './useApplyCoupon';

/** Apply Coupon screen over the checkout; the checkout (and everything typed in it) stays below. */
export const ApplyCouponPage: FC<AppScreenProps<typeof ROUTES.applyCoupon>> = ({
  navigation,
}) => {
  const session = useCouponSession(state => state.session);

  useEffect(() => {
    if (!session) navigation.goBack();
  }, [navigation, session]);

  if (!session) return null;
  return <ApplyCouponContent session={session} onClose={navigation.goBack} />;
};

export const ApplyCouponContent: FC<{
  session: CouponSession;
  onClose: () => void;
}> = ({ session, onClose }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const setApplied = useCouponSession(state => state.setApplied);
  const onDone = useCallback(
    (code: string | null) => {
      setApplied(code);
      onClose();
    },
    [onClose, setApplied],
  );
  const coupon = useApplyCoupon(session, onDone);
  const busy = coupon.pendingCode !== null;

  return (
    <FormScreen
      onBack={onClose}
      title={t('coupons.title')}
      headerTag={t('businessApplicants.headerTag')}
      gap={18}
      testID="apply-coupon-page"
    >
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.textMuted }]}>
          {t('coupons.codeLabel')}
        </Text>
        <View style={styles.formRow}>
          <TextInput
            accessibilityLabel={t('coupons.codeLabel')}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={40}
            onChangeText={coupon.setInput}
            onSubmitEditing={() => coupon.apply(coupon.input)}
            placeholder={t('coupons.codePlaceholder')}
            placeholderTextColor={colors.textSubtle}
            returnKeyType="done"
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.background,
                borderColor: coupon.errorKey ? colors.danger : colors.border,
              },
            ]}
            testID="coupon-code-input"
            value={coupon.input}
          />
          <OutlineButton
            label={
              busy && coupon.pendingCode === coupon.input.trim().toUpperCase()
                ? t('coupons.applying')
                : t('coupons.apply')
            }
            tone="primary"
            disabled={busy || !coupon.input.trim()}
            onPress={() => coupon.apply(coupon.input)}
            testID="coupon-code-apply"
          />
        </View>
        {coupon.errorKey ? (
          <Text
            accessibilityLiveRegion="assertive"
            accessibilityRole="alert"
            style={[styles.error, { color: colors.danger }]}
            testID="coupon-error"
          >
            {t(coupon.errorKey)}
          </Text>
        ) : null}
      </View>

      <View style={styles.list}>
        <Text
          accessibilityRole="header"
          style={[styles.heading, { color: colors.text }]}
        >
          {t('coupons.available')}
        </Text>
        {coupon.listState === 'loading' ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.status, { color: colors.textMuted }]}
            testID="coupon-loading"
          >
            {t('coupons.loading')}
          </Text>
        ) : null}
        {coupon.listState === 'error' ? (
          <View style={styles.form}>
            <Text
              accessibilityRole="alert"
              style={[styles.status, { color: colors.danger }]}
              testID="coupon-list-error"
            >
              {t(coupon.listErrorKey)}
            </Text>
            <OutlineButton
              label={t('coupons.retry')}
              onPress={coupon.reload}
              testID="coupon-retry"
            />
          </View>
        ) : null}
        {coupon.listState === 'ready' && coupon.offers.length === 0 ? (
          <Text
            style={[styles.status, { color: colors.textMuted }]}
            testID="coupon-none"
          >
            {t('coupons.none')}
          </Text>
        ) : null}
        {coupon.listState === 'ready'
          ? coupon.offers.map(offer => (
              <CouponOfferCard
                key={offer.id}
                offer={offer}
                applied={
                  session.appliedCode?.toUpperCase() ===
                  offer.code.toUpperCase()
                }
                disabled={busy}
                pending={coupon.pendingCode === offer.code.toUpperCase()}
                onApply={() => coupon.apply(offer.code)}
                onRemove={() => coupon.remove(offer.code.toUpperCase())}
              />
            ))
          : null}
      </View>
    </FormScreen>
  );
};
