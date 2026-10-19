import { useState } from 'react';

import { useCountdown } from '@/shared/hooks/useCountdown';

import { OTP_LENGTH, OTP_RESEND_COOLDOWN_SECONDS, OTP_TTL_SECONDS } from '../constants';

export const useVerifyPhone = () => {
  const [code, setCodeRaw] = useState('');
  const expiry = useCountdown(OTP_TTL_SECONDS);
  const resend = useCountdown(OTP_RESEND_COOLDOWN_SECONDS);

  const setCode = (value: string) => setCodeRaw(value.replace(/\D/g, '').slice(0, OTP_LENGTH));

  const onResend = () => {
    setCodeRaw('');
    expiry.restart();
    resend.restart();
  };

  return {
    code,
    setCode,
    expiresIn: expiry.remaining,
    resendIn: resend.remaining,
    onResend,
    canSubmit: code.length === OTP_LENGTH && expiry.remaining > 0,
  };
};
