import { StyleSheet } from 'react-native';

// Spacing scale — keep the page on a consistent vertical rhythm.
const S = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32 };

// Shared corner radius + soft card shadow so every surface feels part of one system.
const RADIUS = 20;
const cardShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
} as const;

export const homeStyles = StyleSheet.create({
  screen: { flex: 1 },

  scrollContent: {
    paddingHorizontal: S.md,
    // paddingTop is set inline: S.lg + the device's top safe-area inset.
  },

  topBar: {
    width: '100%',
    paddingVertical: 10,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 36, height: 36 },
  brandName: { fontSize: 22, fontWeight: '900', letterSpacing: 0.2 },

  heroCard: {
    width: '100%',
    borderRadius: 28,
    padding: S.lg,
    backgroundColor: 'rgba(245, 230, 215, 0.55)',
    marginTop: S.lg,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },

  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: S.sm,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.78,
    marginBottom: S.xs,
  },

  microMeta: {
    marginBottom: S.md,
  },
  microMetaText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.6,
  },
  dot: { opacity: 0.45 },

  heroCtas: { marginTop: 2 },

  signInLine: {
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.8,
  },
  signInLink: { fontWeight: '800' },

  landingImage: {
    marginHorizontal: -S.md,
    marginTop: S.xl,
  },

  sectionBlock: {
    width: '100%',
    marginTop: S.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: S.sm,
  },
  sectionTitle: { fontSize: 26, fontWeight: '800' },
  sectionAction: { fontSize: 16, fontWeight: '800', opacity: 0.7 },

  stepsCard: {
    width: '100%',
    borderRadius: RADIUS,
    paddingVertical: S.xs,
    paddingHorizontal: S.sm,
    backgroundColor: 'white',
    ...cardShadow,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },

  stepIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepTextWrap: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '900', marginBottom: 2 },
  stepSubtitle: { fontSize: 14, opacity: 0.7, lineHeight: 20 },

  stepDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginLeft: 88,
  },

  footerCta: {
    marginTop: S.md,
  },
});
