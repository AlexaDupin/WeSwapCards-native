import { StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/Colors';

export const LatestChaptersRowStyles = StyleSheet.create({
  wrap: { width: '100%' },

  loadingWrap: { paddingVertical: 10 },

  kicker: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.6,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },

  card: {
    width: '100%',
    borderRadius: 20,
  },

  image: {
    width: '100%',
    height: 150,
    borderRadius: 20,
  },

  name: {
    marginTop: 10,
    fontWeight: '700',
    fontSize: 16,
  },

  tapHint: {
    marginTop: 4,
    opacity: 0.55,
    fontSize: 12,
  },
});
