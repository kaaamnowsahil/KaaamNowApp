import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import KaamNowLogo from '@/assets/figma/kaamnow-logo.svg';
import SplashRing from '@/assets/figma/splash-ring.svg';

/** Figma nodes 1:11 (Ring, 300px) and 1:12 (KaamNow logo, 120px), sharing one centre. */
export const SplashLogo: FC = () => (
  <View style={styles.slot}>
    <View style={styles.ring} pointerEvents="none">
      <SplashRing />
    </View>
    <KaamNowLogo width={120} height={120} />
  </View>
);

const styles = StyleSheet.create({
  slot: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 300, height: 300, top: -90, left: -90 },
});
