import { useState } from 'react';

import { formatLocalPhone, toE164India, toLocalDigits } from '@/utils/phone';

export const useWelcome = () => {
  const [digits, setDigits] = useState('');

  return {
    phone: formatLocalPhone(digits),
    setPhone: (value: string) => setDigits(toLocalDigits(value)),
    e164: toE164India(digits),
  };
};
