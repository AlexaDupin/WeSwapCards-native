import { StyleSheet } from 'react-native';

import { Colors } from '@/src/constants/Colors';
import { Fonts } from '@/src/constants/typography';

// Spacing scale — keep the page on a consistent vertical rhythm.
const S = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48, huge: 64 };

/** The screen's horizontal gutter. Carousels bleed past it and add it back. */
export const PAGE_GUTTER = 22;

export const homeStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.landingBg },

  scrollContent: {
    paddingHorizontal: PAGE_GUTTER,
    // paddingTop / paddingBottom are set inline: the safe-area insets plus the
    // sticky sign-up bar's height, so the footer never sits under it.
  },

  topBar: {
    width: '100%',
    paddingVertical: 10,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 36, height: 36 },
  brandName: {
    // The one place Plus Jakarta Sans is used, matching the web's wordmark.
    fontFamily: Fonts.wordmark,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.2,
    color: Colors.ink,
  },

  // --- Hero ----------------------------------------------------------------

  hero: {
    width: '100%',
    paddingTop: S.xl,
  },

  // The full proof copy is longer than a phone's width at 13px, so the badge is
  // built to wrap to two lines rather than to be squeezed onto one: a softer
  // radius than a true pill, and a dot aligned to the first line instead of to
  // the block's centre. The right margin is what stops the wrapped text from
  // running the full width and reading as though it has no gutter.
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: S.xs,
    backgroundColor: Colors.tealSoft,
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginBottom: S.lg + 4,
    marginRight: S.lg,
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.teal,
    // Centres the dot on the first line's cap height.
    marginTop: 6,
  },
  pillText: {
    fontFamily: Fonts.body.bold,
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    color: Colors.tealDeep,
  },

  heroTitle: {
    fontFamily: Fonts.head.bold,
    fontSize: 38,
    lineHeight: 41,
    fontWeight: '700',
    letterSpacing: -0.7,
    color: Colors.ink,
    marginBottom: S.lg,
  },
  heroTitleAccent: { color: Colors.primary },

  heroLede: {
    fontFamily: Fonts.body.regular,
    fontSize: 17,
    lineHeight: 27,
    color: Colors.inkMuted,
    marginBottom: S.xl + 4,
  },

  primaryCta: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: S.xl,
    alignItems: 'center',
    // Its own elevation, so the button always stacks above whatever surface it
    // sits on rather than being painted over by an elevated parent.
    elevation: 2,
  },
  primaryCtaLabel: {
    fontFamily: Fonts.head.bold,
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  // The hero button alone carries a glow, matching --wsc-accent-glow.
  primaryCtaGlow: {
    shadowColor: Colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  quietLink: {
    alignSelf: 'center',
    marginTop: S.md,
    paddingVertical: 14,
    paddingHorizontal: S.xs,
  },
  quietLinkText: {
    fontFamily: Fonts.body.semibold,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.ink,
  },

  heroFineprint: {
    fontFamily: Fonts.body.regular,
    marginTop: S.xs,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.inkFaint,
  },

  signInLine: {
    fontFamily: Fonts.body.regular,
    textAlign: 'center',
    marginTop: S.xl,
    fontSize: 15,
    color: Colors.inkMuted,
  },
  signInLink: {
    fontFamily: Fonts.body.bold,
    fontWeight: '800',
    color: Colors.accentLink,
  },

  // --- Hero card stack -----------------------------------------------------

  heroArt: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: S.xl + S.sm,
  },
  heroGlow: {
    position: 'absolute',
    backgroundColor: Colors.primary,
  },
  heroStack: {
    flexDirection: 'row',
    // Without this the row stretches both cards to its own height, so card one
    // grows by the 40px offset card two carries and the slack shows up as dead
    // space under its label. Each card should size to its own content.
    alignItems: 'flex-start',
    gap: 18,
  },
  heroCard: {
    width: 160,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#1e2024',
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  heroCardOffset: { marginTop: 40 },
  heroCardArt: {
    height: 144,
    borderRadius: 10,
    backgroundColor: Colors.tint,
    overflow: 'hidden',
  },
  heroCardArtImage: { width: '100%', height: '100%' },
  heroCardLabel: {
    fontFamily: Fonts.body.semibold,
    marginTop: 10,
    minHeight: 18,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.ink,
  },

  // --- Section furniture ---------------------------------------------------

  section: {
    width: '100%',
  },
  // Lives on the Reveal wrapper rather than on the section, so the wrapper's
  // measured y is the section's own top and the "See how it works" jump lands
  // on the heading instead of on the gap above it.
  sectionGap: {
    marginTop: S.huge,
  },
  sectionHead: {
    marginBottom: S.lg + 4,
  },
  eyebrow: {
    fontFamily: Fonts.head.bold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.primary,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.head.bold,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: Colors.ink,
  },
  sectionLink: {
    fontFamily: Fonts.body.bold,
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accentLink,
  },

  // --- How it works --------------------------------------------------------

  stepList: { gap: S.md },
  stepCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    padding: S.lg,
  },
  stepBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentSoft,
    marginBottom: 18,
  },
  stepBadgeTeal: { backgroundColor: Colors.tealSoft },
  stepBadgeText: {
    fontFamily: Fonts.head.bold,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.accentHover,
  },
  stepBadgeTextTeal: { color: Colors.tealDeep },
  stepTitle: {
    fontFamily: Fonts.head.semibold,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: S.xs,
  },
  stepText: {
    fontFamily: Fonts.body.regular,
    fontSize: 15,
    lineHeight: 23,
    color: Colors.inkMuted,
  },

  // The closing call to action is not a sixth step, so it stops looking like
  // one: a photograph under a deep blue scrim, the page's only cool surface.
  // Blue is orange's complement, so the panel reads as deliberate contrast
  // against a warm page, and the orange button sits at full strength on it.
  ctaCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: S.xs,
    // Shows through until the photo decodes, and stands in if it never loads.
    backgroundColor: Colors.deepBlue,
  },
  ctaCardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  // Tuned against the pinned Iceland photo: opaque enough that white text and
  // the fineprint clear AA over its bright water, sheer enough that the
  // waterfall still reads. Navy rather than black, so it tints the picture into
  // the blue palette instead of just darkening it.
  ctaCardScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 38, 66, 0.62)',
  },
  ctaCardContent: {
    padding: 28,
  },
  ctaCardTitle: {
    fontFamily: Fonts.head.bold,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: '#fff',
    marginBottom: 22,
  },
  // The hero's button fills the column; an in-card one hugs its label.
  stepCtaButton: { alignSelf: 'flex-start' },

  // --- Chapters ------------------------------------------------------------

  carouselRow: { marginBottom: S.xl + S.xs },
  // A row label, not a heading. At 18/600 ink it was the same treatment as the
  // chapter names inside the row, which flattened the two. Dropping it to a
  // quiet uppercase label gives three clear levels: section title, row label,
  // then the card names as the only content-weight text in the section. Same
  // kicker shape the Swap screen's SectionHeading already uses.
  carouselTitle: {
    fontFamily: Fonts.head.bold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.inkFaint,
    marginBottom: S.sm,
  },
  carouselStateWrap: {
    paddingVertical: S.md,
  },
  carouselError: {
    fontFamily: Fonts.body.regular,
    fontSize: 15,
    color: Colors.inkMuted,
  },
  // Cancels the page gutter so cards can run to the screen edge; the list's own
  // contentContainer puts the gutter back in front of the first card.
  carouselBleed: { marginHorizontal: -PAGE_GUTTER },
  carouselContent: {
    paddingHorizontal: PAGE_GUTTER,
    gap: 12,
  },

  chapterCard: {
    width: 200,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  chapterCardImage: {
    width: '100%',
    height: 130,
    backgroundColor: Colors.tint,
  },
  chapterCardBody: {
    paddingTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  chapterCardTitle: {
    fontFamily: Fonts.head.bold,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: Colors.ink,
  },

  catalogueCard: {
    backgroundColor: Colors.tint,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.hairline,
    borderRadius: 16,
    padding: 28,
    marginTop: S.md,
  },
  catalogueTitle: {
    fontFamily: Fonts.head.semibold,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: Colors.ink,
    marginBottom: 10,
  },
  catalogueText: {
    fontFamily: Fonts.body.regular,
    fontSize: 15,
    lineHeight: 23,
    color: Colors.inkMuted,
    marginBottom: S.lg,
  },
  outlineCta: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: Colors.ink,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  outlineCtaLabel: {
    fontFamily: Fonts.head.bold,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },

  // --- Footer --------------------------------------------------------------

  // App fineprint, not a website footer. A rule across the page, a row of
  // navigation-weight links and a copyright line are all web furniture: an app
  // has a real nav bar for navigation, so this is only the small print the
  // stores need reachable from an anonymous screen.
  footer: {
    marginTop: S.xxl,
    alignItems: 'center',
    gap: S.sm,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLink: {
    fontFamily: Fonts.body.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.inkMuted,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  footerSeparator: {
    fontFamily: Fonts.body.regular,
    fontSize: 13,
    color: Colors.inkFaint,
    opacity: 0.6,
  },
  footerDisclaimer: {
    fontFamily: Fonts.body.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: Colors.inkFaint,
    paddingHorizontal: S.md,
  },

  // --- Sticky sign-up bar --------------------------------------------------

  // A solid bar, not a blurred one. Blur is weak on Android and renders the
  // warm page background as flat grey, which is what made this read as a dead
  // strip; a solid surface lifted by a shadow is the ordinary native bottom
  // action bar and lets the orange button sit at full contrast.
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#1e2024',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
    // Deliberately no elevation. On Android an elevated parent paints its
    // background above unelevated children, which hid the button entirely. The
    // hairline border and the solid fill already separate the bar from the warm
    // page behind it, so the Android shadow is not worth that trade.
  },
  stickyBarFill: {
    paddingHorizontal: PAGE_GUTTER,
    paddingTop: S.md,
    // paddingBottom is set inline: 12 + the device's bottom safe-area inset.
  },
});
