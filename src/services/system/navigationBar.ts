import { NativeModules, Platform } from 'react-native';

type SystemNavigationBarModule = {
  setLightNavigationBar: (isLight: boolean) => void;
};

const systemNavigationBar = NativeModules
  .SystemNavigationBar as SystemNavigationBarModule | undefined;

/** Dark Android nav buttons on light surfaces; light buttons on dark surfaces. */
export const setLightNavigationBar = (isLight: boolean) => {
  if (Platform.OS === 'android') {
    systemNavigationBar?.setLightNavigationBar(isLight);
  }
};
