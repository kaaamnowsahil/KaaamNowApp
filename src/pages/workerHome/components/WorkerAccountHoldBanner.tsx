import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppState,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BRAND } from '@/constants/brand';
import { FONTS } from '@/constants/fonts';
import { meApi, type MyWorkerProfile } from '@/services/api/meApi';
import { useTheme } from '@/theme/ThemeProvider';
import { whatsappUrl } from '@/utils/links';

/** Tells a Worker their account is on hold (banned) or their feed is limited by strikes. */
export const WorkerAccountHoldBanner: FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const [worker, setWorker] = useState<MyWorkerProfile | null>(null);

  const refresh = useCallback(() => {
    meApi
      .profile()
      .then(profile => setWorker(profile.worker ?? null))
      .catch((error: unknown) =>
        console.error('Could not refresh the profile.', error),
      );
  }, []);

  useEffect(() => {
    refresh();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  if (!worker) return null;
  const limitedUntil = worker.feed_limited_until
    ? new Date(worker.feed_limited_until)
    : null;
  const limited = limitedUntil !== null && limitedUntil.getTime() > Date.now();
  const onHold = Boolean(worker.banned_at);
  if (!onHold && !limited) return null;

  const accent = onHold ? colors.danger : colors.warning;
  return (
    <View
      accessibilityRole="alert"
      testID="worker-account-hold"
      style={[
        styles.card,
        { borderColor: accent, backgroundColor: colors.fill },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t(
          onHold
            ? 'workerHome.accountHoldTitle'
            : 'workerHome.feedLimitedTitle',
        )}
      </Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>
        {onHold
          ? t('workerHome.accountHoldBody')
          : t('workerHome.feedLimitedBody', {
              date: limitedUntil!.toLocaleDateString(i18n.language, {
                day: 'numeric',
                month: 'short',
              }),
            })}
      </Text>
      {onHold ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => Linking.openURL(whatsappUrl(BRAND.SUPPORT_WHATSAPP))}
        >
          <Text style={[styles.link, { color: colors.primary }]}>
            {t('workerHome.contactSupport')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 4 },
  title: { fontFamily: FONTS.semiBold, fontSize: 15 },
  body: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  link: { fontFamily: FONTS.semiBold, fontSize: 13, marginTop: 6 },
});
