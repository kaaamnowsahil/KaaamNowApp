import type { TFunction } from 'i18next';

import type { OtpSendResponse } from './authApi';

/** Tells the user where the code arrives (SMS / WhatsApp / call) and from which sender; empty for console delivery. */
export const otpDeliveryNotice = (
  t: TFunction,
  sent: Pick<OtpSendResponse, 'delivery_channel' | 'sender_name'> | null,
): string => {
  if (!sent) return '';
  const sender = sent.sender_name ?? '';
  switch (sent.delivery_channel) {
    case 'sms':
      return sender
        ? t('auth.otpDelivery.smsFrom', { sender })
        : t('auth.otpDelivery.sms');
    case 'whatsapp':
      return sender
        ? t('auth.otpDelivery.whatsappFrom', { sender })
        : t('auth.otpDelivery.whatsapp');
    case 'voice':
      return t('auth.otpDelivery.voice');
    default:
      return '';
  }
};
