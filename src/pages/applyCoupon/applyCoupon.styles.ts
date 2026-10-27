import { StyleSheet } from 'react-native';

import { FONTS } from '@/constants/fonts';

export const styles = StyleSheet.create({
  form: { gap: 8 },
  formRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  label: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
  error: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
  heading: { fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 21 },
  list: { gap: 12 },
  status: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 19 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  cardUnavailable: { opacity: 0.6 },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  code: { fontFamily: FONTS.bold, fontSize: 15, letterSpacing: 0.5 },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    overflow: 'hidden',
  },
  title: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  discount: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 20 },
  term: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
  reason: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
  action: { alignSelf: 'flex-start', marginTop: 4 },
});
