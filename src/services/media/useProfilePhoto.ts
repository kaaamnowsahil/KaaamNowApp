import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { errorMessage } from '@/services/api/apiClient';
import { mediaUrl, meApi, type MyProfileResponse } from '@/services/api/meApi';

import { pickImageFromGallery } from './pickImage';

/** Picks a gallery photo and uploads it right away as the profile photo / business logo. */
export const useProfilePhoto = (
  serverUrl: string | null | undefined,
  readUrl: (profile: MyProfileResponse) => string | null | undefined,
) => {
  const { t } = useTranslation();
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const changePhoto = async () => {
    if (isUploading) return;
    try {
      const image = await pickImageFromGallery();
      if (!image) return;
      setIsUploading(true);
      const profile = await meApi.uploadProfileImage(image);
      setUploadedUrl(mediaUrl(readUrl(profile)) ?? image.uri);
    } catch (error) {
      Alert.alert(t('editProfile.photoFailed'), errorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  return {
    photoUri: uploadedUrl ?? mediaUrl(serverUrl),
    isUploading,
    changePhoto,
  };
};
