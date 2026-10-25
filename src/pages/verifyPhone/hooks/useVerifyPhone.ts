import { useCallback, useEffect, useState } from 'react';

import {
  AuthApiError,
  completeSignup,
  sendOtp,
  type OtpSendResponse,
} from '@/services/auth/authApi';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { usePreferencesStore } from '@/services/config/usePreferencesStore';
import {
  useOnboardingStore,
  type UserRole,
} from '@/services/onboarding/useOnboardingStore';
import { OTP_LENGTH } from '../constants';

function responseRole(
  activeRole: string | null,
  roles: string[],
  fallback: UserRole,
): UserRole {
  if (activeRole === 'worker' || activeRole === 'business') return activeRole;
  return (
    (roles.find(value => value === 'worker' || value === 'business') as
      | UserRole
      | undefined) ?? fallback
  );
}

/** `sent` holds the timers of the OTP the sign-up screen already sent. */
export const useVerifyPhone = (
  phone: string,
  sent: {
    expiresInSeconds: number;
    resendAfterSeconds: number;
    deliveryChannel: string;
    senderName?: string | null;
  },
) => {
  const [code, setCodeRaw] = useState('');
  const [sentAt] = useState(() => Date.now());
  const [expiresAt, setExpiresAt] = useState(
    sentAt + sent.expiresInSeconds * 1000,
  );
  const [resendAt, setResendAt] = useState(
    sentAt + sent.resendAfterSeconds * 1000,
  );
  const [now, setNow] = useState(sentAt);
  const [busy, setBusy] = useState(false);
  const [otpSent, setOtpSent] = useState(true);
  const [delivery, setDelivery] = useState<
    Pick<OtpSendResponse, 'delivery_channel' | 'sender_name'>
  >({
    delivery_channel: sent.deliveryChannel,
    sender_name: sent.senderName,
  });
  const [error, setError] = useState('');
  const signIn = useAuthStore(s => s.signIn);
  const signupRole = useOnboardingStore(s => s.role);
  const worker = useOnboardingStore(s => s.worker);
  const business = useOnboardingStore(s => s.business);
  const clearSignup = useOnboardingStore(s => s.clearSignup);
  const language = usePreferencesStore(s => s.language);
  const expiresIn = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000));

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const requestCode = useCallback(async () => {
    if (!signupRole) {
      setError('Signup details are missing. Please start again.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const resent = await sendOtp(phone, 'sign_up', signupRole);
      const resentAt = Date.now();
      setExpiresAt(resentAt + resent.expires_in_seconds * 1000);
      setResendAt(resentAt + resent.resend_after_seconds * 1000);
      setNow(resentAt);
      setDelivery(resent);
      setOtpSent(true);
      setCodeRaw('');
    } catch (cause) {
      setError(
        cause instanceof AuthApiError
          ? cause.message
          : cause instanceof Error
          ? cause.message
          : 'Could not send a verification code.',
      );
    } finally {
      setBusy(false);
    }
  }, [phone, signupRole]);

  const setCode = (value: string) =>
    setCodeRaw(value.replace(/\D/g, '').slice(0, OTP_LENGTH));
  const onVerify = async () => {
    if (!signupRole || !otpSent) return;
    if (
      (signupRole === 'worker' && !worker) ||
      (signupRole === 'business' && !business)
    ) {
      setError('Signup details are missing. Please start again.');
      return;
    }
    const signupPassword =
      signupRole === 'worker' ? worker?.password : business?.password;
    if (!signupPassword) {
      setError('Signup details are missing. Please start again.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await completeSignup({
        phone,
        code,
        password: signupPassword,
        role: signupRole,
        languageCode: language.id,
        worker,
        business,
      });
      await signIn({
        phone,
        role: responseRole(
          response.me.active_role,
          response.me.roles,
          signupRole,
        ),
        tokens: response.tokens,
      });
      clearSignup();
    } catch (cause) {
      setError(
        cause instanceof AuthApiError
          ? cause.message
          : cause instanceof Error
          ? cause.message
          : 'Could not complete signup. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return {
    code,
    setCode,
    expiresIn,
    resendIn,
    onResend: requestCode,
    onVerify,
    busy,
    otpSent,
    delivery,
    error,
    canSubmit: otpSent && code.length === OTP_LENGTH && expiresIn > 0 && !busy,
  };
};
