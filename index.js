/**
 * @format
 */

import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import { App } from './src/App';
import { name as appName } from './app.json';

// Notification pushes are shown by the OS; taps are handled in usePushNotifications.
setBackgroundMessageHandler(getMessaging(), async () => {});

AppRegistry.registerComponent(appName, () => App);
