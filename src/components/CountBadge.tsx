import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  count: number;
};

function CountBadge({ count }: Props) {
  if (!Number.isFinite(count) || count <= 0) return null;

  const label = count > 99 ? '99+' : String(count);

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    marginLeft: 6,
  },
  text: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
});

export default memo(CountBadge);
