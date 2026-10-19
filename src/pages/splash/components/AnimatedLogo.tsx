import type { FC, ReactNode } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon } from 'react-native-svg';

import {
  BRAND_MARK_TRANSFORM,
  BRAND_PIECES,
  BRAND_PURPLE,
  BrandTile,
} from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

const AnimatedG = Animated.createAnimatedComponent(G);

const LOGO_SIZE = 120;

/** Centre of each "K" piece in the mark's own coordinate space. */
const PIECE_CENTERS: [number, number][] = [
  [140, 250],
  [290, 128],
  [292, 212],
  [294, 310],
  [224, 257],
  [352, 223],
];

/** Scales a piece around its own centre: move to centre, scale, move back. */
const Piece: FC<{
  index: number;
  progress: Animated.Value;
  children: ReactNode;
}> = ({ index, progress, children }) => {
  const [cx, cy] = PIECE_CENTERS[index];
  return (
    <G transform={`translate(${cx} ${cy})`}>
      <AnimatedG
        scale={progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.15, 1],
        })}
        opacity={progress.interpolate({
          inputRange: [0, 0.55, 1],
          outputRange: [0, 1, 1],
        })}
      >
        <G transform={`translate(${-cx} ${-cy})`}>{children}</G>
      </AnimatedG>
    </G>
  );
};

type Props = {
  tile: Animated.Value;
  ring: Animated.Value;
  float: Animated.Value;
  glow: Animated.Value;
  pieces: Animated.Value[];
};

/** Logo tile, staggered K pieces, ring pulse, float and glow — "KaaamNow Splash Motion". */
export const AnimatedLogo: FC<Props> = ({
  tile,
  ring,
  float,
  glow,
  pieces,
}) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      style={[
        styles.glow,
        {
          shadowColor: BRAND_PURPLE,
          shadowOpacity: glow.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.45],
          }),
        },
      ]}
    >
      <Animated.View
        style={{
          transform: [
            {
              translateY: float.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -4],
              }),
            },
          ],
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              borderColor: colors.primary,
              opacity: ring.interpolate({
                inputRange: [0, 0.001, 1],
                outputRange: [0, 0.7, 0],
              }),
              transform: [
                {
                  scale: ring.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2.1],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={{
            opacity: tile,
            transform: [
              {
                scale: tile.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
              {
                rotate: tile.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['-10deg', '0deg'],
                }),
              },
            ],
          }}
        >
          <Svg width={LOGO_SIZE} height={LOGO_SIZE} viewBox="0 0 64 64">
            <BrandTile gradientId="brandTileSplash" />
            <G
              transform={BRAND_MARK_TRANSFORM}
              fill={BRAND_PURPLE}
              stroke={BRAND_PURPLE}
            >
              <Piece index={0} progress={pieces[0]}>
                <Path d={BRAND_PIECES.stem} stroke="none" />
              </Piece>
              <Piece index={1} progress={pieces[1]}>
                <Circle {...BRAND_PIECES.head} stroke="none" />
              </Piece>
              <Piece index={2} progress={pieces[2]}>
                <Line {...BRAND_PIECES.arm} strokeLinecap="round" />
              </Piece>
              <Piece index={3} progress={pieces[3]}>
                <Line {...BRAND_PIECES.leg} strokeLinecap="round" />
              </Piece>
              <Piece index={4} progress={pieces[4]}>
                <Path
                  d={BRAND_PIECES.joint}
                  strokeWidth={4}
                  strokeLinejoin="round"
                />
              </Piece>
              <Piece index={5} progress={pieces[5]}>
                <Polygon
                  points={BRAND_PIECES.tip}
                  strokeWidth={4}
                  strokeLinejoin="round"
                />
              </Piece>
            </G>
          </Svg>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  glow: { shadowOffset: { width: 0, height: 8 }, shadowRadius: 20 },
  ring: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 32,
    borderWidth: 2,
  },
});
