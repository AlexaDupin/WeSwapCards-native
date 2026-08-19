import type { ImageSource } from 'expo-image';

/**
 * The background for the landing page's closing call-to-action card.
 *
 * Pinned to one specific chapter (96, Iceland) rather than read from the
 * chapters API, so the card looks identical on every launch and the scrim over
 * it can be tuned against a known picture. Its turquoise water and grey sky are
 * why this one was chosen: the blue scrim in `homeStyles.ctaCardScrim` sits
 * with the photo instead of fighting it.
 *
 * The Cloudinary transform keeps the download near the size actually rendered.
 * `f_auto,q_auto` let Cloudinary pick the format and quality per client.
 *
 * If chapter 96's artwork is ever re-ingested this URL still resolves, but the
 * picture behind it could change, so check the card after any image refresh.
 * To use custom artwork instead, drop the file in
 * `src/assets/images/illustrations/` and swap this for a `require(...)` of it.
 * Nothing else changes; the card reads this constant only.
 */
export const CTA_CARD_BACKGROUND: ImageSource | number = {
  uri: 'https://res.cloudinary.com/dwf28prby/image/upload/w_800,f_auto,q_auto/chapters/chapter-96-iceland.jpg',
};
