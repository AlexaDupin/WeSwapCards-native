// Helpers for the conversation-list fallback avatar (shown when a partner has
// no Clerk image). Pure and deterministic: the same user always gets the same
// initials and colour, so the list is stable across renders and sessions.

export type AvatarSwatch = { bg: string; text: string };

// Muted, low-saturation swatches with a darker same-hue label for contrast.
// Deliberately avoids the app's strong orange (#f07a1a), green (#16bc90 /
// #34C759) and red (#FF3B30), which already signal selected / completed /
// declined / unread states elsewhere in the UI.
export const AVATAR_PALETTE: AvatarSwatch[] = [
  { bg: '#EDE7F6', text: '#6A4C93' }, // purple
  { bg: '#E3F0FB', text: '#2B6CB0' }, // blue
  { bg: '#DDF3EE', text: '#2C7A6B' }, // teal
  { bg: '#FBE4EC', text: '#B4477A' }, // pink
  { bg: '#FBEBDD', text: '#B5651D' }, // peach
  { bg: '#E7ECF0', text: '#4A5B6B' }, // blue-grey
];

/**
 * 1–2 uppercase initials from a display name.
 * "Tiffany" -> "T", "Alexa Dupin" -> "AD", "test" -> "T".
 * Empty / whitespace-only -> "?".
 */
export function getInitials(name: string): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const firstWord = words[0] ?? '';
  const lastWord = words[words.length - 1] ?? '';
  const first = firstWord[0] ?? '';
  const last = words.length > 1 ? lastWord[0] ?? '' : '';
  const initials = (first + last).toUpperCase();
  return initials || '?';
}

/**
 * Stable seed for the avatar colour: the partner id when available (survives a
 * rename), falling back to the display name. The caller passes both; the choice
 * lives here so it stays testable.
 */
export function getAvatarSeed(
  id: string | number | null | undefined,
  name: string,
): string {
  if (id !== null && id !== undefined && String(id).length > 0) return String(id);
  return name ?? '';
}

/**
 * Deterministically map a seed to a palette swatch. Never random, so a user
 * keeps the same colour across renders and app launches.
 */
export function getAvatarColor(seed: string): AvatarSwatch {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    // Simple, stable string hash (djb2-ish). Kept small and dependency-free.
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index] ?? AVATAR_PALETTE[0]!;
}
