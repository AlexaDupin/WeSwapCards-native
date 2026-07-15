import {
  getClerkErrorCode,
  getClerkErrorMessage,
  getSignInErrorMessage,
  getSignUpErrorMessage,
  getVerifyEmailErrorMessage,
} from '@/src/features/auth/data/authErrors';

// Pure mapping logic: Clerk error shape -> code/message extraction, and
// code -> user-facing copy. A wrong or missing case shows users an unhelpful
// error, so every branch (and the default/fallback) is pinned here.

describe('getClerkErrorCode', () => {
  it('returns the first error code', () => {
    expect(getClerkErrorCode({ errors: [{ code: 'form_x' }] })).toBe('form_x');
  });

  it('returns undefined when there is no error array or it is empty', () => {
    expect(getClerkErrorCode({})).toBeUndefined();
    expect(getClerkErrorCode({ errors: [] })).toBeUndefined();
    expect(getClerkErrorCode(null)).toBeUndefined();
    expect(getClerkErrorCode(undefined)).toBeUndefined();
  });
});

describe('getClerkErrorMessage', () => {
  it('returns the first error message', () => {
    expect(getClerkErrorMessage({ errors: [{ message: 'boom' }] })).toBe(
      'boom',
    );
  });

  it('returns undefined when there is no error array', () => {
    expect(getClerkErrorMessage({})).toBeUndefined();
    expect(getClerkErrorMessage(null)).toBeUndefined();
  });
});

describe('getSignInErrorMessage', () => {
  it.each([
    ['form_password_incorrect', 'Password is incorrect. Please try again.'],
    ['form_identifier_not_found', 'No account found for this email.'],
    ['form_param_format_invalid', 'Please enter a valid email address.'],
  ])('maps %s', (code, expected) => {
    expect(getSignInErrorMessage(code)).toBe(expected);
  });

  it('falls back to a generic message for unknown/undefined codes', () => {
    expect(getSignInErrorMessage('something_else')).toBe(
      'An error occurred. Please try again.',
    );
    expect(getSignInErrorMessage(undefined)).toBe(
      'An error occurred. Please try again.',
    );
  });
});

describe('getSignUpErrorMessage', () => {
  it.each([
    [
      'form_identifier_exists',
      'That email address is already in use. Please try another or sign in.',
    ],
    ['form_param_format_invalid', 'Please enter a valid email address.'],
    [
      'form_password_pwned',
      'This password is too common. Please choose a stronger one.',
    ],
  ])('maps %s', (code, expected) => {
    expect(getSignUpErrorMessage(code)).toBe(expected);
  });

  it('uses the provided fallback for unknown codes', () => {
    expect(getSignUpErrorMessage('unknown', 'Clerk said no')).toBe(
      'Clerk said no',
    );
  });

  it('uses a generic message when no fallback is provided', () => {
    expect(getSignUpErrorMessage('unknown')).toBe(
      'An error occurred. Please try again.',
    );
    expect(getSignUpErrorMessage('unknown', '')).toBe(
      'An error occurred. Please try again.',
    );
  });
});

describe('getVerifyEmailErrorMessage', () => {
  it.each([
    ['form_code_incorrect', 'That code is incorrect. Please try again.'],
    ['form_code_expired', 'That code has expired. Request a new one.'],
  ])('maps %s', (code, expected) => {
    expect(getVerifyEmailErrorMessage(code)).toBe(expected);
  });

  it('uses the provided fallback for unknown codes, else a generic message', () => {
    expect(getVerifyEmailErrorMessage('unknown', 'Clerk detail')).toBe(
      'Clerk detail',
    );
    expect(getVerifyEmailErrorMessage('unknown')).toBe(
      'Verification failed. Please try again.',
    );
  });
});
