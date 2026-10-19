import type { FC } from 'react';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from 'react-native-svg';

import { BRAND } from '@/constants/brand';
import { BRAND_COLORS } from '@/constants/colors';

export const BRAND_PURPLE = BRAND_COLORS.mark;

/** Geometry of the "K" mark, in the mark's own coordinate space (see BrandLogo transform). */
export const BRAND_PIECES = {
  stem: 'M182 115 H150 A52 52 0 0 0 98 167 V343 A42 42 0 0 0 182 343 Z',
  head: { cx: 290, cy: 128, r: 40 },
  arm: { x1: 232, y1: 244, x2: 352, y2: 180, strokeWidth: 58 },
  leg: { x1: 240, y1: 272, x2: 348, y2: 348, strokeWidth: 76 },
  joint: 'M232 192 L198 226 Q184 256 198 288 L228 322 L250 300 V215 Z',
  tip: '334,216 355,240 370,206',
} as const;

export const BRAND_MARK_TRANSFORM = 'translate(-6.7 -5.9) scale(0.16)';

/** Rounded dark tile behind the mark; shared by the static and animated logos. */
export const BrandTile: FC<{ gradientId: string }> = ({ gradientId }) => (
  <>
    <Defs>
      <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={BRAND_COLORS.tileTop} />
        <Stop offset="1" stopColor={BRAND_COLORS.tileBottom} />
      </LinearGradient>
    </Defs>
    <Rect width={64} height={64} rx={14} fill={`url(#${gradientId})`} />
  </>
);

/** Static KaamNow logo — same artwork as the animated splash logo. */
export const BrandLogo: FC<{ size: number }> = ({ size }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    accessibilityLabel={BRAND.LOGO_LABEL}
  >
    <BrandTile gradientId="brandTileStatic" />
    <G
      transform={BRAND_MARK_TRANSFORM}
      fill={BRAND_PURPLE}
      stroke={BRAND_PURPLE}
    >
      <Path d={BRAND_PIECES.stem} stroke="none" />
      <Circle {...BRAND_PIECES.head} stroke="none" />
      <Line {...BRAND_PIECES.arm} strokeLinecap="round" />
      <Line {...BRAND_PIECES.leg} strokeLinecap="round" />
      <Path d={BRAND_PIECES.joint} strokeWidth={4} strokeLinejoin="round" />
      <Polygon
        points={BRAND_PIECES.tip}
        strokeWidth={4}
        strokeLinejoin="round"
      />
    </G>
  </Svg>
);
