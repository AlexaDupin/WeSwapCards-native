import { formatListTimestamp } from '@/src/utils/dateTime';

// Kept as a named re-export so existing imports stay valid; the relative-time
// logic now lives in the shared util (see src/utils/dateTime.ts).
export function formatLastMessage(timestamp: string | null) {
  return formatListTimestamp(timestamp);
}
