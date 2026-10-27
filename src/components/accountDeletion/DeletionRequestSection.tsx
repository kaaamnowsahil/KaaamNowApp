import type { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/theme/ThemeProvider';
import { formatDateTime } from '@/utils/format';

import { DeletionDetail } from './DeletionDetail';
import { styles } from './deletionRequest.styles';
import { useDeletionRequest } from './useDeletionRequest';

export const DeletionRequestSection: FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    request,
    isLoading,
    isSubmitting,
    accessEnded,
    error,
    canRequest,
    canRetry,
    confirmSubmit,
    retry,
  } = useDeletionRequest();

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
            <DeletionDetail
              label={t('accountDeletion.requestedAt')}
              value={formatDateTime(request.requested_at)}
            />
            <DeletionDetail
              label={t('accountDeletion.approvedAt')}
              value={formatDateTime(request.approved_at)}
            />
            <DeletionDetail
              label={t('accountDeletion.completedAt')}
              value={formatDateTime(request.completed_at)}
            />
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
                <DeletionDetail
                  label={t('accountDeletion.holdBasis')}
                  value={hold.basis}
                />
                <DeletionDetail
                  label={t('accountDeletion.holdReason')}
                  value={hold.reason}
                />
                <DeletionDetail
                  label={t('accountDeletion.reference')}
                  value={hold.reference}
                />
                <DeletionDetail
                  label={t('accountDeletion.holdExpiresAt')}
                  value={formatDateTime(hold.expires_at)}
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
          <Text
            accessibilityRole="alert"
            style={[styles.error, { color: colors.danger }]}
          >
            {error}
          </Text>
        ) : null}
        {canRequest ? (
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
        {canRetry ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => retry()}
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
