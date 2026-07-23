import {
  AVATAR_PALETTE,
  getAvatarColor,
  getAvatarSeed,
  getInitials,
} from '@/src/features/dashboard/utils/avatar';

describe('getInitials', () => {
  it('takes one initial from a single-word name', () => {
    expect(getInitials('Tiffany')).toBe('T');
    expect(getInitials('test')).toBe('T');
  });

  it('takes first + last initial from a multi-word name', () => {
    expect(getInitials('Alexa Dupin')).toBe('AD');
  });

  it('uppercases the initials', () => {
    expect(getInitials('alexa dupin')).toBe('AD');
  });

  it('ignores extra whitespace', () => {
    expect(getInitials('  Alexa   Dupin  ')).toBe('AD');
  });

  it('falls back to "?" for empty / whitespace names', () => {
    expect(getInitials('')).toBe('?');
    expect(getInitials('   ')).toBe('?');
  });
});

describe('getAvatarSeed', () => {
  it('uses the id when present', () => {
    expect(getAvatarSeed(42, 'Alexa')).toBe('42');
    expect(getAvatarSeed('u_1', 'Alexa')).toBe('u_1');
  });

  it('falls back to the name when the id is missing', () => {
    expect(getAvatarSeed(null, 'Alexa')).toBe('Alexa');
    expect(getAvatarSeed(undefined, 'Alexa')).toBe('Alexa');
  });
});

describe('getAvatarColor', () => {
  it('is deterministic for the same seed', () => {
    expect(getAvatarColor('42')).toEqual(getAvatarColor('42'));
  });

  it('always returns a swatch from the palette', () => {
    for (const seed of ['1', '2', 'Alexa', 'Tiffany', 'test19c', '99999']) {
      expect(AVATAR_PALETTE).toContainEqual(getAvatarColor(seed));
    }
  });
});
