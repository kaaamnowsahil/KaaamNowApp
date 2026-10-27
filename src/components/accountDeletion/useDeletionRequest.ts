import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccountDeletionApiError,
  getCurrentDeletionRequest,
  hasSubmittedDeletionRequest,
  markDeletionRequestSubmitted,
  submitDeletionRequest,
} from '@/services/accountDeletion/accountDeletionApi';
import { useAuthStore } from '@/services/auth/useAuthStore';
import type { DeletionRequest } from '@/types';

export const useDeletionRequest = () => {
  const { t } = useTranslation();
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
    loadRequest();
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

  const confirmSubmit = useCallback(() => {
    Alert.alert(
      t('accountDeletion.confirmTitle'),
      t('accountDeletion.retentionNotice'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('accountDeletion.confirmAction'),
          style: 'destructive',
          onPress: () => submit(),
        },
      ],
    );
  }, [submit, t]);

  const canRequest =
    !isLoading && statusChecked && !accessEnded && !hasSubmitted && !request;
  const canRetry = Boolean(error) && !accessEnded;

  return {
    request,
    isLoading,
    isSubmitting,
    accessEnded,
    error,
    canRequest,
    canRetry,
    confirmSubmit,
    retry: loadRequest,
  };
};
