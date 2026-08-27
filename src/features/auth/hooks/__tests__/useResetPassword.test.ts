import { act, renderHook } from '@testing-library/react-native';

import { useResetPassword } from '@/src/features/auth/hooks/useResetPassword';

// Mock the boundaries: Clerk + ExplorerContext. authErrors stays real so the
// code -> message mapping is exercised end-to-end.

const mockUseSignIn = jest.fn();
jest.mock('@clerk/clerk-expo', () => ({
  useSignIn: () => mockUseSignIn(),
}));

const mockResetExplorer = jest.fn();
jest.mock('@/src/features/auth/context/ExplorerContext', () => ({
  useExplorer: () => ({ resetExplorer: mockResetExplorer }),
}));

let signIn: { create: jest.Mock; attemptFirstFactor: jest.Mock };
let setActive: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});

  signIn = { create: jest.fn(), attemptFirstFactor: jest.fn() };
  setActive = jest.fn().mockResolvedValue(undefined);
  mockUseSignIn.mockReturnValue({ signIn, setActive, isLoaded: true });
});

type Overrides = Partial<Parameters<typeof useResetPassword>[0]>;

function setup(overrides: Overrides = {}) {
  const setPendingReset = jest.fn();
  const setIsSubmitting = jest.fn();
  const setError = jest.fn();

  const { result } = renderHook(() =>
    useResetPassword({
      emailAddress: 'user@example.com',
      code: '123456',
      password: 'new-secret',
      pendingReset: false,
      setPendingReset,
      isSubmitting: false,
      setIsSubmitting,
      setError,
      ...overrides,
    }),
  );

  return { result, setPendingReset, setIsSubmitting, setError };
}

function clerkError(code: string) {
  return { errors: [{ code }] };
}

describe('onRequestResetPress', () => {
  it('requests a reset code and moves to the pending step', async () => {
    signIn.create.mockResolvedValue({ status: 'needs_first_factor' });
    const { result, setPendingReset, setError } = setup({
      emailAddress: '  user@example.com  ',
    });

    await act(async () => {
      await result.current.onRequestResetPress();
    });

    expect(signIn.create).toHaveBeenCalledWith({
      strategy: 'reset_password_email_code',
      identifier: 'user@example.com', // trimmed
    });
    expect(setPendingReset).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith('');
  });

  it('requires an email', async () => {
    const { result, setError } = setup({ emailAddress: '   ' });

    await act(async () => {
      await result.current.onRequestResetPress();
    });

    expect(setError).toHaveBeenCalledWith('Please enter your email.');
    expect(signIn.create).not.toHaveBeenCalled();
  });

  it('maps an unknown-account error and stays on the request step', async () => {
    signIn.create.mockRejectedValue(clerkError('form_identifier_not_found'));
    const { result, setPendingReset, setError } = setup();

    await act(async () => {
      await result.current.onRequestResetPress();
    });

    expect(setError).toHaveBeenCalledWith('No account found for this email.');
    expect(setPendingReset).not.toHaveBeenCalled();
  });
});

describe('onResetPasswordPress', () => {
  it('resets the explorer before activating the new session on success', async () => {
    signIn.attemptFirstFactor.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'sess_123',
    });
    const { result, setError } = setup({ pendingReset: true });

    await act(async () => {
      await result.current.onResetPasswordPress();
    });

    expect(signIn.attemptFirstFactor).toHaveBeenCalledWith({
      strategy: 'reset_password_email_code',
      code: '123456',
      password: 'new-secret',
    });
    // Stale explorer state must be cleared before the session goes active so a
    // previous user's data can't leak into the new session.
    const lastReset = Math.max(...mockResetExplorer.mock.invocationCallOrder);
    const activate = setActive.mock.invocationCallOrder[0];
    expect(activate).toBeDefined();
    expect(lastReset).toBeLessThan(activate!);
    expect(setActive).toHaveBeenCalledWith({ session: 'sess_123' });
    expect(setError).toHaveBeenCalledWith('');
  });

  it('does nothing until a reset has been requested', async () => {
    const { result } = setup({ pendingReset: false });

    await act(async () => {
      await result.current.onResetPasswordPress();
    });

    expect(signIn.attemptFirstFactor).not.toHaveBeenCalled();
  });

  it('requires both the code and the new password', async () => {
    const { result, setError } = setup({
      pendingReset: true,
      code: '  ',
      password: '',
    });

    await act(async () => {
      await result.current.onResetPasswordPress();
    });

    expect(setError).toHaveBeenCalledWith(
      'Please enter the code and your new password.',
    );
    expect(signIn.attemptFirstFactor).not.toHaveBeenCalled();
  });

  it('maps an incorrect-code error without activating a session', async () => {
    signIn.attemptFirstFactor.mockRejectedValue(
      clerkError('form_code_incorrect'),
    );
    const { result, setError } = setup({ pendingReset: true });

    await act(async () => {
      await result.current.onResetPasswordPress();
    });

    expect(setError).toHaveBeenCalledWith(
      'That code is incorrect. Please try again.',
    );
    expect(setActive).not.toHaveBeenCalled();
  });
});
