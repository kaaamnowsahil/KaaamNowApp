import { Alert, Linking } from 'react-native';

import { LIVE_TEXT as S } from './liveWorkStrings';

/** Location is off or denied; the Worker is offered a way to allow it. */
export class LocationOffError extends Error {}

/** The system will not ask again once location is denied, so the Worker allows it in Settings. */
export function askToShareLocation(body: string = S.workerLocationOff) {
  Alert.alert(S.shareLocationTitle, body, [
    { text: S.notNow, style: 'cancel' },
    {
      text: S.openSettings,
      onPress: () => {
        Linking.openSettings().catch(() => undefined);
      },
    },
  ]);
}
