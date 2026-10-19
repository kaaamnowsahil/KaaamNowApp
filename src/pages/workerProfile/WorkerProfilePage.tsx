import type { FC } from 'react';

import CircleHelpIcon from '@/assets/icons/circle-help.svg';
import FileTextIcon from '@/assets/icons/file-text.svg';
import GlobeIcon from '@/assets/icons/globe.svg';
import LogOutIcon from '@/assets/icons/log-out.svg';
import PaletteIcon from '@/assets/icons/palette.svg';
import UserRoundIcon from '@/assets/figma/user-round.svg';
import WalletIcon from '@/assets/figma/wallet.svg';
import { BrandAppBar } from '@/components/ui';
import { TabScreen } from '@/layout/TabScreen';

import { ProfileCard, SettingsGroup, SettingsRow } from './components';
import { WORKER_PROFILE_STRINGS as S } from './constants';
import { useWorkerProfile } from './hooks/useWorkerProfile';

/**
 * Worker "Profile" tab. Figma: Profile · Light (17:2) / Dark (17:518),
 * built from a design screenshot.
 * - state + navigation: hooks/useWorkerProfile.ts
 * - data: mock/workerProfileMock.ts
 */
export const WorkerProfilePage: FC = () => {
  const p = useWorkerProfile();

  const blocks = [
    <ProfileCard
      key="card"
      initials={p.initials}
      name={p.profile.fullName}
      caption={`${p.profile.roleLabel} · ${p.profile.location}`}
    />,
    <SettingsGroup key="account" title={S.ACCOUNT}>
      <SettingsRow
        icon={UserRoundIcon}
        title={S.EDIT_PROFILE}
        onPress={p.openEditProfile}
      />
      <SettingsRow
        icon={WalletIcon}
        title={S.PAYOUT_ACCOUNT}
        onPress={p.openPayouts}
      />
    </SettingsGroup>,
    <SettingsGroup key="preferences" title={S.PREFERENCES}>
      <SettingsRow
        icon={GlobeIcon}
        title={S.LANGUAGE}
        value={p.languageLabel}
        onPress={p.openLanguage}
      />
      <SettingsRow
        icon={PaletteIcon}
        title={S.APP_THEME}
        value={S.THEME_LABEL[p.theme]}
        onPress={p.cycleTheme}
        testID="profile-theme"
      />
    </SettingsGroup>,
    <SettingsGroup key="support" title={S.SUPPORT}>
      <SettingsRow icon={CircleHelpIcon} title={S.FAQ} onPress={p.openFaq} />
      <SettingsRow
        icon={FileTextIcon}
        title={S.TERMS}
        onPress={p.openTerms}
      />
    </SettingsGroup>,
    <SettingsGroup key="logout">
      <SettingsRow
        icon={LogOutIcon}
        title={S.LOG_OUT}
        tone="danger"
        onPress={p.signOut}
        testID="profile-log-out"
      />
    </SettingsGroup>,
  ];

  return (
    <TabScreen
      header={<BrandAppBar onBellPress={p.openNotifications} />}
      blocks={blocks}
      gap={10}
      isLoading={p.isLoading}
      testID="worker-profile-page"
    />
  );
};
