import { getSendErrorMessage } from '@/src/features/chat/data/sendErrorMessages';

// Pure mapping: server error shape -> chat error copy. Locks down the one
// specific case (403 user_blocked) and the generic fallback everywhere else.

const GENERIC = 'Could not send message';
const BLOCKED = "You can't exchange messages with this collector.";

function axiosError(status: number, data?: unknown) {
  return { response: { status, data } };
}

describe('getSendErrorMessage', () => {
  it('maps 403 user_blocked to the blocked copy', () => {
    expect(getSendErrorMessage(axiosError(403, { code: 'user_blocked' }))).toBe(
      BLOCKED,
    );
  });

  it('keeps the generic copy for a 403 without the user_blocked code', () => {
    expect(
      getSendErrorMessage(
        axiosError(403, { message: 'You are not authorized' }),
      ),
    ).toBe(GENERIC);
  });

  it('keeps the generic copy for user_blocked with a non-403 status', () => {
    expect(getSendErrorMessage(axiosError(500, { code: 'user_blocked' }))).toBe(
      GENERIC,
    );
  });

  it('falls back to generic for validation errors and server failures', () => {
    expect(getSendErrorMessage(axiosError(400, { errors: [] }))).toBe(GENERIC);
    expect(getSendErrorMessage(axiosError(500))).toBe(GENERIC);
  });

  it('falls back to generic for non-axios failures', () => {
    expect(getSendErrorMessage(new Error('Network Error'))).toBe(GENERIC);
    expect(getSendErrorMessage(undefined)).toBe(GENERIC);
    expect(getSendErrorMessage(null)).toBe(GENERIC);
    expect(getSendErrorMessage('boom')).toBe(GENERIC);
    expect(getSendErrorMessage({ response: null })).toBe(GENERIC);
  });
});
