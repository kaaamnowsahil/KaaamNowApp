import { useCallback, useEffect, useState, type FC } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccountDeletionApiError,
  getCurrentDeletionRequest,
  hasSubmittedDeletionRequest,
  markDeletionRequestSubmitted,
  submitDeletionRequest,
  type DeletionRequest,
} from '@/services/accountDeletion/accountDeletionApi';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export const DeletionRequestSection: FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const accessToken = useAuthStore(state => state.tokens?.access_token ?? null);
  const phone = useAuthStore(state => state.phone);
  const role = useAuthStore(state => state.role);
  const [request, setRequest] = useState<DeletionRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);
  const [accessEnded, setAccessEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback(
    async (caught: unknown) => {
      if (
        caught instanceof AccountDeletionApiError &&
        caught.status === 401 &&
        (await hasSubmittedDeletionRequest(phone, role))
      ) {
        setAccessEnded(true);
        setRequest(null);
        setError(null);
        return;
      }
      setError(
        caught instanceof Error
          ? caught.message
          : t('accountDeletion.genericError'),
      );
    },
    [phone, role, t],
  );

  const loadRequest = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const current = await getCurrentDeletionRequest(accessToken);
      setRequest(current);
      setAccessEnded(current?.status === 'completed');
      setHasSubmitted(Boolean(current));
      setStatusChecked(true);
    } catch (caught) {
      if (caught instanceof AccountDeletionApiError && caught.status === 404) {
        setRequest(null);
        setHasSubmitted(false);
        setAccessEnded(false);
        setStatusChecked(true);
      } else {
        await handleError(caught);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, handleError]);

  useEffect(() => {
    void loadRequest();
  }, [loadRequest]);

  const submit = useCallback(async () => {
    if (!accessToken) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const submittedRequest = await submitDeletionRequest(accessToken);
      setHasSubmitted(true);
      try {
        if (phone && role) await markDeletionRequestSubmitted(phone, role);
      } catch {
        // A secure-storage failure must not obscure a successfully accepted request.
      }
      if (submittedRequest) setRequest(submittedRequest);
      const current = await getCurrentDeletionRequest(accessToken);
      setRequest(current ?? submittedRequest);
      setAccessEnded(current?.status === 'completed');
    } catch (caught) {
      await handleError(caught);
    } finally {
      setIsSubmitting(false);
    }
  }, [accessToken, handleError, phone, role]);

  const confirmSubmit = () => {
    Alert.alert(
      t('accountDeletion.confirmTitle'),
      t('accountDeletion.retentionNotice'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('accountDeletion.confirmAction'),
          style: 'destructive',
          onPress: () => void submit(),
        },
      ],
    );
  };

  return (
    <View style={styles.section} testID="account-deletion-section">
      <Text style={[styles.heading, { color: colors.text }]}>
        {t('accountDeletion.title')}
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.fill, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.body, { color: colors.textSubtle }]}>
          {t('accountDeletion.retentionNotice')}
        </Text>

        {isLoading ? (
          <Text style={[styles.body, { color: colors.textMuted }]}>
            {t('common.loading')}
          </Text>
        ) : accessEnded ? (
          <Text style={[styles.body, { color: colors.text }]}>
            {t('accountDeletion.accessEnded')}
          </Text>
        ) : request ? (
          <View style={styles.statusBlock}>
            <Text style={[styles.status, { color: colors.text }]}>
              {t(`accountDeletion.status.${request.status}`)}
            </Text>
            <Detail
              label={t('accountDeletion.requestedAt')}
              value={formatDate(request.requested_at)}
            />
            {request.approved_at ? (
              <Detail
                label={t('accountDeletion.approvedAt')}
                value={formatDate(request.approved_at)}
              />
            ) : null}
            {request.completed_at ? (
              <Detail
                label={t('accountDeletion.completedAt')}
                value={formatDate(request.completed_at)}
              />
            ) : null}
            {request.blockers.length > 0 ? (
              <View style={styles.list}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {t('accountDeletion.blockers')}
                </Text>
                {request.blockers.map((blocker, index) => (
                  <Text
                    key={`${index}-${blocker}`}
                    style={[styles.body, { color: colors.textSubtle }]}
                  >
                    • {blocker}
                  </Text>
                ))}
              </View>
            ) : null}
            {request.holds.map(hold => (
              <View
                key={hold.id}
                style={[styles.hold, { borderTopColor: colors.border }]}
              >
                <Detail
                  label={t('accountDeletion.holdBasis')}
                  value={hold.basis}
                />
                <Detail
                  label={t('accountDeletion.holdReason')}
                  value={hold.reason}
                />
                {hold.reference ? (
                  <Detail
                    label={t('accountDeletion.reference')}
                    value={hold.reference}
                  />
                ) : null}
                <Detail
                  label={t('accountDeletion.holdExpiresAt')}
                  value={formatDate(hold.expires_at)}
                />
              </View>
            ))}
            {request.status === 'completed' ? (
              <Text style={[styles.body, { color: colors.text }]}>
                {t('accountDeletion.accessEnded')}
              </Text>
            ) : null}
          </View>
        ) : null}

        {error ? (
          <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>
            {error}
          </Text>
        ) : null}
        {!isLoading &&
        statusChecked &&
        !accessEnded &&
        !hasSubmitted &&
        !request ? (
          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={confirmSubmit}
            testID="account-deletion-request"
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.dangerSoft },
              pressed && styles.pressed,
              isSubmitting && styles.disabled,
            ]}
          >
            <Text style={[styles.buttonLabel, { color: colors.danger }]}>
              {isSubmitting
                ? t('accountDeletion.submitting')
                : t('accountDeletion.requestAction')}
            </Text>
          </Pressable>
        ) : null}
        {error && !accessEnded ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadRequest()}
            style={styles.retry}
          >
            <Text style={[styles.retryLabel, { color: colors.primary }]}>
              {t('accountDeletion.retry')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const Detail: FC<{ label: string; value: string | null }> = ({
  label,
  value,
}) => {
  const { colors } = useTheme();
  if (!value) return null;
  return (
    <View style={styles.detail}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { gap: 10 },
  heading: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 12 },
  body: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 19 },
  statusBlock: { gap: 8 },
  status: { fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 21 },
  detail: { gap: 2 },
  label: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 16 },
  value: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 19 },
  list: { gap: 4, paddingTop: 2 },
  hold: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8, gap: 8 },
  error: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  button: {
    minHeight: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  buttonLabel: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 20 },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.55 },
  retry: { alignSelf: 'flex-start', paddingVertical: 4 },
  retryLabel: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 19 },
});
