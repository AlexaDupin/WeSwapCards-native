import {
  formatListTimestamp,
  formatMessageTimestamp,
} from '@/src/utils/dateTime';

// These tests pin the branch selection (today / this week / older, plus the
// previous-year suffix) and the null/invalid guards — the real regression
// surface. They deliberately do NOT hardcode locale-specific output: expected
// strings are built from the same Intl.DateTimeFormat(undefined, ...) calls the
// source uses, so the assertions hold under any locale/timezone the runner has.

// "now" is fixed to a midday Wednesday so day diffs stay clear of midnight/TZ
// edges. Dates are built with the local-time constructor and round-tripped
// through ISO, matching how callers pass timestamps.
const NOW = new Date(2026, 5, 10, 12, 0); // Wed 10 Jun 2026, 12:00 local

function isoAt(
  year: number,
  month1: number,
  day: number,
  hour = 12,
  minute = 0,
): string {
  return new Date(year, month1 - 1, day, hour, minute).toISOString();
}

const intl = (opts: Intl.DateTimeFormatOptions) => (d: Date) =>
  new Intl.DateTimeFormat(undefined, opts).format(d);

const time = intl({ hour: '2-digit', minute: '2-digit' });
const weekday = intl({ weekday: 'short' });
const dayMonth = intl({ day: '2-digit', month: 'short' });
const dayMonthYear = intl({ day: '2-digit', month: 'short', year: 'numeric' });

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('formatMessageTimestamp', () => {
  it('returns "" for null or unparseable input', () => {
    expect(formatMessageTimestamp(null)).toBe('');
    expect(formatMessageTimestamp('not-a-date')).toBe('');
  });

  it('shows only the time for today', () => {
    const d = new Date(2026, 5, 10, 9, 30);
    expect(formatMessageTimestamp(isoAt(2026, 6, 10, 9, 30))).toBe(time(d));
  });

  it('treats a future timestamp (clock skew) as today', () => {
    const d = new Date(2026, 5, 11, 8, 0); // tomorrow -> diff < 0
    expect(formatMessageTimestamp(isoAt(2026, 6, 11, 8, 0))).toBe(time(d));
  });

  it('shows weekday + time earlier this week', () => {
    const d = new Date(2026, 5, 8, 9, 30); // Mon, diff 2
    expect(formatMessageTimestamp(isoAt(2026, 6, 8, 9, 30))).toBe(
      `${weekday(d)} ${time(d)}`,
    );
  });

  it('shows day, month + time for an older date in the same year', () => {
    const d = new Date(2026, 4, 20, 9, 30); // 20 May, diff ~21
    expect(formatMessageTimestamp(isoAt(2026, 5, 20, 9, 30))).toBe(
      `${dayMonth(d)}, ${time(d)}`,
    );
  });

  it('adds the year for a date in a previous year', () => {
    const d = new Date(2025, 7, 28, 9, 30); // 28 Aug 2025
    expect(formatMessageTimestamp(isoAt(2025, 8, 28, 9, 30))).toBe(
      `${dayMonthYear(d)}, ${time(d)}`,
    );
  });
});

describe('formatListTimestamp', () => {
  it('returns "" for null or unparseable input', () => {
    expect(formatListTimestamp(null)).toBe('');
    expect(formatListTimestamp('not-a-date')).toBe('');
  });

  it('shows only the time for today', () => {
    const d = new Date(2026, 5, 10, 9, 30);
    expect(formatListTimestamp(isoAt(2026, 6, 10, 9, 30))).toBe(time(d));
  });

  it('shows just the weekday earlier this week (no time)', () => {
    const d = new Date(2026, 5, 8, 9, 30); // Mon, diff 2
    expect(formatListTimestamp(isoAt(2026, 6, 8, 9, 30))).toBe(weekday(d));
  });

  it('shows day, month for an older date in the same year (no time)', () => {
    const d = new Date(2026, 4, 20, 9, 30); // 20 May
    expect(formatListTimestamp(isoAt(2026, 5, 20, 9, 30))).toBe(dayMonth(d));
  });

  it('adds the year for a date in a previous year', () => {
    const d = new Date(2025, 7, 28, 9, 30); // 28 Aug 2025
    expect(formatListTimestamp(isoAt(2025, 8, 28, 9, 30))).toBe(
      dayMonthYear(d),
    );
  });
});

describe('week/older boundary', () => {
  // diff === 6 is still "this week"; diff === 7 crosses into "older".
  it('treats 6 days ago as this week and 7 days ago as older', () => {
    const sixDaysAgo = new Date(2026, 5, 4, 9, 30); // Thu, diff 6
    const sevenDaysAgo = new Date(2026, 5, 3, 9, 30); // Wed, diff 7

    expect(formatListTimestamp(isoAt(2026, 6, 4, 9, 30))).toBe(
      weekday(sixDaysAgo),
    );
    expect(formatListTimestamp(isoAt(2026, 6, 3, 9, 30))).toBe(
      dayMonth(sevenDaysAgo),
    );
  });
});
