import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import {
  getAvatarColor,
  getAvatarSeed,
  getInitials,
} from '@/src/features/dashboard/utils/avatar';

type Props = {
  imageUrl?: string | null | undefined;
  name: string;
  // Stable identifier (partner id) preferred; falls back to `name`.
  seed?: string | number | null | undefined;
  size?: number;
};

// The partner avatar for a conversation row. Shows the Clerk image when the
// partner uploaded one; otherwise a deterministic muted circle with their
// initials. Decorative — the row itself carries the accessibility label.
const ConversationAvatar = ({ imageUrl, name, seed, size = 48 }: Props) => {
  const [imageFailed, setImageFailed] = useState(false);

  // Rows are recycled by FlatList: when the same component instance is handed a
  // different partner (new url), retry the image instead of staying on the
  // previous fallback.
  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const dimensions = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const showImage = Boolean(imageUrl) && !imageFailed;

  if (showImage) {
    return (
      <Image
        source={{ uri: imageUrl as string }}
        style={dimensions}
        contentFit="cover"
        cachePolicy="memory-disk"
        onError={() => setImageFailed(true)}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    );
  }

  const swatch = getAvatarColor(getAvatarSeed(seed, name));

  return (
    <View
      style={[styles.fallback, dimensions, { backgroundColor: swatch.bg }]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Text
        style={[styles.initials, { color: swatch.text, fontSize: size * 0.4 }]}
        allowFontScaling={false}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '600',
  },
});

export default React.memo(ConversationAvatar);
