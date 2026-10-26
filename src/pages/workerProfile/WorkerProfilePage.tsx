import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import CircleHelpIcon from '@/assets/icons/circle-help.svg';
import FileTextIcon from '@/assets/icons/file-text.svg';
import GlobeIcon from '@/assets/icons/globe.svg';
import LogOutIcon from '@/assets/icons/log-out.svg';
import PaletteIcon from '@/assets/icons/palette.svg';
import UserRoundIcon from '@/assets/figma/user-round.svg';
import WalletIcon from '@/assets/figma/wallet.svg';
import { RoleSwitchRow } from '@/components/roleSwitch/RoleSwitchRow';
import { BrandAppBar } from '@/components/ui';
import { TabScreen } from '@/layout/TabScreen';

import { ProfileCard, SettingsGroup, SettingsRow } from './components';
import { useWorkerProfile } from './hooks/useWorkerProfile';

/**
 * Worker "Profile" tab. Figma: Profile · Light (17:2) / Dark (17:518),
 * built from a design screenshot.
 * - state + navigation: hooks/useWorkerProfile.ts
 */
export const WorkerProfilePage: FC = () => {
  const { t } = useTranslation();
  const p = useWorkerProfile();

  const blocks = [
    <ProfileCard
      key="card"
      initials={p.initials}
      imageUri={p.profile.photoUri}
      name={p.profile.fullName}
      caption={[t('workerProfile.roleLabel'), p.profile.location]
        .filter(Boolean)
        .join(' · ')}
      rating={p.rating}
    />,
    <SettingsGroup key="account" title={t('workerProfile.account')}>
      <SettingsRow
        icon={UserRoundIcon}
        title={t('workerProfile.editProfile')}
        onPress={p.openEditProfile}
      />
      <SettingsRow
        icon={WalletIcon}
        title={t('workerProfile.payoutAccount')}
        onPress={p.openPayouts}
      />
      <RoleSwitchRow />
    </SettingsGroup>,
    <SettingsGroup key="preferences" title={t('workerProfile.preferences')}>
      <SettingsRow
        icon={GlobeIcon}
        title={t('workerProfile.language')}
        value={p.languageLabel}
        onPress={p.openLanguage}
      />
      <SettingsRow
        icon={PaletteIcon}
        title={t('workerProfile.appTheme')}
        value={t(`workerProfile.theme${p.theme === 'dark' ? 'Dark' : 'Light'}`)}
        onPress={p.openAppearance}
        testID="profile-theme"
      />
    </SettingsGroup>,
    <SettingsGroup key="support" title={t('workerProfile.support')}>
      <SettingsRow
        icon={CircleHelpIcon}
        title={t('workerProfile.faq')}
        onPress={p.openFaq}
      />
      <SettingsRow
        icon={FileTextIcon}
        title={t('workerProfile.terms')}
        onPress={p.openTerms}
      />
    </SettingsGroup>,
    <SettingsGroup key="logout">
      <SettingsRow
        icon={LogOutIcon}
        title={t('workerProfile.logOut')}
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
