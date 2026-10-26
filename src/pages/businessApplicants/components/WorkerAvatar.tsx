import { useState, type FC } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { mediaUrl } from '@/services/api/meApi';
import { useTheme } from '@/theme/ThemeProvider';
import { initialsOf } from '@/utils/format';

/** Worker photo, or initials on a soft tile when there is none (or it fails to load). */
export const WorkerAvatar: FC<{ name: string; photoUrl?: string | null; size?: number }> = ({
  name,
  photoUrl,
  size = 44,
}) => {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const uri = mediaUrl(photoUrl);
  const frame = { width: size, height: size, borderRadius: size / 2 };

  if (uri && !failed) {
    return <Image source={{ uri }} style={frame} onError={() => setFailed(true)} />;
  }
  return (
    <View style={[styles.fallback, frame, { backgroundColor: colors.primarySoft }]}>
      <Text style={[styles.initials, { color: colors.primary, fontSize: size * 0.38 }]}>
        {initialsOf(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: FONTS.bold },
});
