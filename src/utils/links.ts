import { Platform } from 'react-native';

/** Opens the platform maps app searching for `query`. */
export const mapsUrl = (query: string) => {
  const q = encodeURIComponent(query);
  return Platform.OS === 'ios'
    ? `http://maps.apple.com/?q=${q}`
    : `geo:0,0?q=${q}`;
};

/** WhatsApp chat link; bare 10-digit numbers are treated as Indian (+91). */
export const whatsappUrl = (phone: string, text?: string) => {
  const digits = phone.replace(/\D/g, '');
  const number = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};
