import { Easing } from 'react-native';

/** Easings and timings from "KaamNow Splash Motion", shared by all screen entrances. */
export const MOTION = {
  spring: Easing.bezier(0.34, 1.56, 0.64, 1),
  out: Easing.bezier(0.22, 1, 0.36, 1),
  riseDuration: 600,
  riseDistance: 14,
  popDuration: 750,
  /** Delay between consecutive content blocks on a screen. */
  stagger: 70,
} as const;
