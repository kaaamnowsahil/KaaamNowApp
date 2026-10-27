import { StyleSheet } from 'react-native';

import { FONTS } from '@/constants/fonts';

export const styles = StyleSheet.create({
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
