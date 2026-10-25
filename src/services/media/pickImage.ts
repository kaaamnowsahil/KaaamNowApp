import { launchImageLibrary } from 'react-native-image-picker';

import type { PickedImage } from '@/services/api/meApi';

/** Opens the photo library (no camera); resolves null when the user cancels. */
export const pickImageFromGallery = async (): Promise<PickedImage | null> => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.8,
  });
  if (result.didCancel) return null;
  if (result.errorCode)
    throw new Error(result.errorMessage || result.errorCode);
  const asset = result.assets?.[0];
  if (!asset?.uri) return null;
  return {
    uri: asset.uri,
    type: asset.type || 'image/jpeg',
    fileName: asset.fileName || 'photo.jpg',
  };
};
