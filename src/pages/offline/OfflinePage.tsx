import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import WifiOffIcon from '@/assets/icons/wifi-off.svg';
import {
  InfoRow,
  PrimaryButton,
  ScreenIntro,
  SecondaryButton,
} from '@/components/ui';
import type { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { OFFLINE_STRINGS as S } from './constants';
import { useOffline } from './hooks/useOffline';
import { LAST_SYNCED_AT, SAVED_CHECK_IN_CODE, SAVED_SHIFT } from './mock';

/** No-connection state (Figma 14 · Preferences / Offline, SC-01). */
export const OfflinePage: FC<AppScreenProps<typeof ROUTES.offline>> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const o = useOffline();

  return (
    <FormScreen
      onBack={navigation.goBack}
      gap={20}
      testID="offline-page"
      actions={
        <>
          <PrimaryButton
            label={o.isReconnecting ? S.RECONNECTING : S.TRY_RECONNECTING}
            disabled={o.isReconnecting}
            onPress={o.reconnect}
            testID="offline-reconnect"
          />
          <SecondaryButton
            label={S.VIEW_SAVED}
            onPress={o.viewSaved}
            testID="offline-view-saved"
          />
        </>
      }
    >
      <View
        style={[
          styles.disc,
          { backgroundColor: colors.fill, borderColor: colors.border },
        ]}
      >
        <WifiOffIcon width={34} height={34} color={colors.warning} />
      </View>
      <ScreenIntro title={S.TITLE} subtitle={S.SUBTITLE} />
      <View>
        <InfoRow
          title={S.SAVED_BOOKING}
          caption={S.savedCaption(SAVED_CHECK_IN_CODE, SAVED_SHIFT.businessName)}
          onPress={o.viewSaved}
          testID="offline-saved-booking"
        />
        <InfoRow
          title={S.LAST_UPDATED}
          caption={S.updatedCaption(LAST_SYNCED_AT)}
          onPress={o.isReconnecting ? undefined : o.reconnect}
          testID="offline-last-updated"
        />
      </View>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  disc: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 44,
    marginBottom: 24,
  },
});
