// Maps a failed message-send (or lazy conversation-create) error to the copy
// shown in the chat error slot. Pure and defensive: it only reads the axios
// error shape (err.response.{status,data.code}) if present, so any unknown
// failure falls back to the generic message.
const GENERIC_SEND_ERROR = 'Could not send message';

const BLOCKED_SEND_ERROR = "You can't exchange messages with this collector.";

export function getSendErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: unknown }).response;
    if (typeof response === 'object' && response !== null) {
      const { status, data } = response as { status?: unknown; data?: unknown };
      const code =
        typeof data === 'object' && data !== null
          ? (data as { code?: unknown }).code
          : undefined;

      if (status === 403 && code === 'user_blocked') {
        return BLOCKED_SEND_ERROR;
      }
    }
  }

  return GENERIC_SEND_ERROR;
}
