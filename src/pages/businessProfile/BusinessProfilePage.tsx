import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import BriefcaseIcon from '@/assets/icons/briefcase.svg';
import CircleHelpIcon from '@/assets/icons/circle-help.svg';
import FileTextIcon from '@/assets/icons/file-text.svg';
import GlobeIcon from '@/assets/icons/globe.svg';
import LogOutIcon from '@/assets/icons/log-out.svg';
import PaletteIcon from '@/assets/icons/palette.svg';
import WalletIcon from '@/assets/figma/wallet.svg';
import { BrandAppBar } from '@/components/ui';
import { TabScreen } from '@/layout/TabScreen';
import {
  ProfileCard,
  SettingsGroup,
  SettingsRow,
} from '@/pages/workerProfile/components';

import { useBusinessProfile } from './hooks';

export const BusinessProfilePage: FC = () => {
  const { t } = useTranslation();
  const profile = useBusinessProfile();

  const blocks = [
    <ProfileCard
      key="identity"
      initials={profile.initials}
      imageUri={profile.photoUri}
      name={profile.businessName}
      caption={
        profile.isVerified
          ? t('businessProfile.verifiedLocation', { location: profile.location })
          : profile.location
      }
    />,
    <SettingsGroup key="business" title={t('businessProfile.sectionBusiness')}>
      <SettingsRow
        icon={BriefcaseIcon}
        title={t('businessProfile.editBusinessProfile')}
        onPress={profile.openBusinessEditProfile}
      />
      <SettingsRow
        icon={WalletIcon}
        title={t('businessProfile.paymentHistory')}
        onPress={profile.openPaymentHistory}
      />
    </SettingsGroup>,
    <SettingsGroup key="preferences" title={t('workerProfile.preferences')}>
      <SettingsRow
        icon={GlobeIcon}
        title={t('workerProfile.language')}
        value={profile.languageLabel}
        onPress={profile.openLanguage}
      />
      <SettingsRow
        icon={PaletteIcon}
        title={t('workerProfile.appTheme')}
        value={t(
          `workerProfile.theme${profile.theme === 'dark' ? 'Dark' : 'Light'}`,
        )}
        onPress={profile.openAppearance}
      />
    </SettingsGroup>,
    <SettingsGroup key="support" title={t('workerProfile.support')}>
      <SettingsRow
        icon={CircleHelpIcon}
        title={t('workerProfile.faq')}
        onPress={profile.openFaq}
      />
      <SettingsRow
        icon={FileTextIcon}
        title={t('workerProfile.terms')}
        onPress={profile.openTerms}
      />
    </SettingsGroup>,
    <SettingsGroup key="logout">
      <SettingsRow
        icon={LogOutIcon}
        title={t('workerProfile.logOut')}
        tone="danger"
        onPress={profile.signOut}
        testID="business-profile-log-out"
      />
    </SettingsGroup>,
  ];

  return (
    <TabScreen
      header={<BrandAppBar onBellPress={profile.openNotifications} />}
      blocks={blocks}
      gap={10}
      isLoading={profile.isLoading}
      testID="business-profile-page"
    />
  );
};
