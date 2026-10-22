import { useCallback, useEffect, useRef, useState } from 'react';

import {
  AuthApiError,
  completeSignup,
  requestSignupOtp,
} from '@/services/auth/authApi';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { usePreferencesStore } from '@/services/config/usePreferencesStore';
import { useOnboardingStore, type UserRole } from '@/services/onboarding/useOnboardingStore';

import { OTP_LENGTH } from '../constants';

function responseRole(activeRole: string | null, roles: string[], fallback: UserRole): UserRole {
  if (activeRole === 'worker' || activeRole === 'business') return activeRole;
  const role = roles.find(value => value === 'worker' || value === 'business');
  return (role as UserRole | undefined) ?? fallback;
}

export const useVerifyPhone = (phone: string) => {
  const [code, setCodeRaw] = useState('');
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [resendAt, setResendAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const signIn = useAuthStore(s => s.signIn);
  const signupRole = useOnboardingStore(s => s.role);
  const worker = useOnboardingStore(s => s.worker);
  const business = useOnboardingStore(s => s.business);
  const clearSignup = useOnboardingStore(s => s.clearSignup);
  const language = usePreferencesStore(s => s.language);
  const started = useRef(false);

  const expiresIn = expiresAt ? Math.max(0, Math.ceil((expiresAt - now) / 1000)) : 0;
  const resendIn = resendAt ? Math.max(0, Math.ceil((resendAt - now) / 1000)) : 0;

  useEffect(() => {
    if (!expiresAt && !resendAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt, resendAt]);

  const requestCode = useCallback(async () => {
    if (!signupRole) {
      setError('Signup details are missing. Please start again.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await requestSignupOtp(phone, signupRole);
      const sentAt = Date.now();
      setExpiresAt(sentAt + result.expires_in_seconds * 1000);
      setResendAt(sentAt + result.resend_after_seconds * 1000);
      setNow(sentAt);
      setOtpSent(true);
      setCodeRaw('');
    } catch (cause) {
      setError(cause instanceof AuthApiError ? cause.message : 'Could not send a verification code.');
    } finally {
      setBusy(false);
    }
  }, [phone, signupRole]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    requestCode();
  }, [requestCode]);

  const setCode = (value: string) =>
    setCodeRaw(value.replace(/\D/g, '').slice(0, OTP_LENGTH));

  const onVerify = async () => {
    if (!signupRole || !otpSent) return;
    if ((signupRole === 'worker' && !worker) || (signupRole === 'business' && !business)) {
      setError('Signup details are missing. Please start again.');
      return;
    }
    const signupPassword = signupRole === 'worker' ? worker?.password : business?.password;
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
        role: responseRole(response.me.active_role, response.me.roles, signupRole),
        tokens: response.tokens,
      });
      clearSignup();
    } catch (cause) {
      setError(cause instanceof AuthApiError ? cause.message : 'Could not complete signup. Please try again.');
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
    error,
    canSubmit: otpSent && code.length === OTP_LENGTH && expiresIn > 0 && !busy,
  };
};
