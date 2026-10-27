import { useState, type FC } from 'react';
import { Alert } from 'react-native';

import BuildingIcon from '@/assets/figma/building-2.svg';
import UsersRoundIcon from '@/assets/figma/users-round.svg';
import { ROUTES } from '@/constants/routes';
import { SettingsRow } from '@/pages/workerProfile/components';
import { navigationRef } from '@/route/navigationRef';
import { ApiError, errorMessage } from '@/services/api/apiClient';
import { switchRole } from '@/services/auth/roleSwitch';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { tr } from '@/services/i18n/tr';

const k = (key: string) => tr(`roleSwitch.${key}`);

const STRINGS = {
  get toBusiness() {
    return k('toBusiness');
  },
  get toWorker() {
    return k('toWorker');
  },
  get switching() {
    return k('switching');
  },
  get failedTitle() {
    return k('failedTitle');
  },
};

/**
 * Profile row that toggles the active role between worker and Business / Work.
 * Without an account for the other role it opens the add-role form instead.
 */
export const RoleSwitchRow: FC = () => {
  const role = useAuthStore(s => s.role);
  const [busy, setBusy] = useState(false);
  const target = role === 'business' ? 'worker' : 'business';

  const onPress = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await switchRole(target);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'role_not_registered') {
        navigationRef.navigate(ROUTES.addRole, { role: target });
      } else {
        Alert.alert(STRINGS.failedTitle, errorMessage(error));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingsRow
      icon={target === 'business' ? BuildingIcon : UsersRoundIcon}
      title={target === 'business' ? STRINGS.toBusiness : STRINGS.toWorker}
      value={busy ? STRINGS.switching : undefined}
      onPress={onPress}
      testID="profile-switch-role"
    />
  );
};
