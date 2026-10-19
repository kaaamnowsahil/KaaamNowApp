import { useState } from 'react';

import { useAuthStore } from '@/services/auth/useAuthStore';
import { useOnboardingStore } from '@/services/onboarding/useOnboardingStore';
import { useCountdown } from '@/shared/hooks/useCountdown';

import {
  OTP_LENGTH,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_TTL_SECONDS,
} from '../constants';
import { DEMO_ACCOUNTS } from '../mock';

export const useVerifyPhone = (phone: string) => {
  const [code, setCodeRaw] = useState('');
  const expiry = useCountdown(OTP_TTL_SECONDS);
  const resend = useCountdown(OTP_RESEND_COOLDOWN_SECONDS);
  const signIn = useAuthStore(s => s.signIn);
  const role = useOnboardingStore(s => s.role);

  const setCode = (value: string) =>
    setCodeRaw(value.replace(/\D/g, '').slice(0, OTP_LENGTH));

  const onResend = () => {
    setCodeRaw('');
    expiry.restart();
    resend.restart();
  };

  // Backend OTP verification is not wired yet: any 6-digit code signs in locally.
  const onVerify = () =>
    signIn({ phone, role: DEMO_ACCOUNTS[phone] ?? role ?? 'worker' });

  return {
    code,
    setCode,
    expiresIn: expiry.remaining,
    resendIn: resend.remaining,
    onResend,
    onVerify,
    canSubmit: code.length === OTP_LENGTH && expiry.remaining > 0,
  };
};
