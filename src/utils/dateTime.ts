// Shared relative date/time formatting for chat messages and the dashboard list.
// Vanilla Date + Intl.DateTimeFormat, device locale (undefined) — no deps.

/** Whole calendar days between `date` and now (local midnight to local midnight). */
function calendarDayDiff(date: Date, now: Date): number {
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOf(now) - startOf(date)) / 86_400_000);
}

function fmt(date: Date, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(undefined, opts).format(date);
}

const TIME: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

/**
 * Chat message timestamp — always carries a time.
 * today → "09:45" · this week → "Mon 09:45" · older → "28 Aug, 09:45"
 * (adds the year when it's a previous year).
 */
export function formatMessageTimestamp(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diff = calendarDayDiff(date, now);
  const time = fmt(date, TIME);

  if (diff <= 0) return time; // today (or any future clock skew)
  if (diff < 7) return `${fmt(date, { weekday: 'short' })} ${time}`;

  // Compose the date and time parts ourselves so we get "28 Aug, 13:45" rather
  // than the locale's wordier "28 Aug at 13:45".
  const sameYear = date.getFullYear() === now.getFullYear();
  const day = fmt(date, {
    day: '2-digit',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
  return `${day}, ${time}`;
}

/**
 * Dashboard list timestamp — compact, time only for today.
 * today → "09:45" · this week → "Mon" · older → "28 Aug" (+ year if previous year).
 */
export function formatListTimestamp(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diff = calendarDayDiff(date, now);

  if (diff <= 0) return fmt(date, TIME);
  if (diff < 7) return fmt(date, { weekday: 'short' });

  const sameYear = date.getFullYear() === now.getFullYear();
  return fmt(date, {
    day: '2-digit',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}
