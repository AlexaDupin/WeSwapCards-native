import { act, renderHook } from '@testing-library/react-native';

import { useSignInSubmit } from '@/src/features/auth/hooks/useSignInSubmit';

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

let signIn: { create: jest.Mock };
let setActive: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});

  signIn = { create: jest.fn() };
  setActive = jest.fn().mockResolvedValue(undefined);
  mockUseSignIn.mockReturnValue({ signIn, setActive, isLoaded: true });
});

type Overrides = Partial<Parameters<typeof useSignInSubmit>[0]>;

function setup(overrides: Overrides = {}) {
  const setIsSubmitting = jest.fn();
  const setError = jest.fn();

  const { result } = renderHook(() =>
    useSignInSubmit({
      emailAddress: 'user@example.com',
      password: 'secret',
      isSubmitting: false,
      setIsSubmitting,
      setError,
      ...overrides,
    }),
  );

  return { result, setIsSubmitting, setError };
}

function clerkError(code: string) {
  return { errors: [{ code }] };
}

describe('onSignInPress', () => {
  it('signs in, resets the explorer, and activates the session on success', async () => {
    signIn.create.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'sess_123',
    });
    const { result, setError } = setup({ emailAddress: '  user@example.com  ' });

    await act(async () => {
      await result.current.onSignInPress();
    });

    expect(signIn.create).toHaveBeenCalledWith({
      identifier: 'user@example.com', // trimmed
      password: 'secret',
    });
    expect(mockResetExplorer).toHaveBeenCalled();
    expect(setActive).toHaveBeenCalledWith({ session: 'sess_123' });
    expect(setError).toHaveBeenCalledWith('');
  });

  it('resets the explorer before activating the new session', async () => {
    signIn.create.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'sess_123',
    });
    const { result } = setup();

    await act(async () => {
      await result.current.onSignInPress();
    });

    // Stale explorer state must be cleared before the session goes active so a
    // previous user's data can't leak into the new session.
    const lastReset = Math.max(...mockResetExplorer.mock.invocationCallOrder);
    const activate = setActive.mock.invocationCallOrder[0];
    expect(activate).toBeDefined();
    expect(lastReset).toBeLessThan(activate!);
  });

  it('validates that email and password are present', async () => {
    const { result, setError } = setup({ emailAddress: '   ', password: '' });

    await act(async () => {
      await result.current.onSignInPress();
    });

    expect(setError).toHaveBeenCalledWith(
      'Please enter your email and password.',
    );
    expect(signIn.create).not.toHaveBeenCalled();
  });

  it('does nothing while not loaded or already submitting', async () => {
    mockUseSignIn.mockReturnValue({ signIn, setActive, isLoaded: false });
    const notLoaded = setup();
    await act(async () => {
      await notLoaded.result.current.onSignInPress();
    });
    expect(signIn.create).not.toHaveBeenCalled();

    mockUseSignIn.mockReturnValue({ signIn, setActive, isLoaded: true });
    const submitting = setup({ isSubmitting: true });
    await act(async () => {
      await submitting.result.current.onSignInPress();
    });
    expect(signIn.create).not.toHaveBeenCalled();
  });

  it('reports an incomplete sign-in without activating a session', async () => {
    signIn.create.mockResolvedValue({ status: 'needs_first_factor' });
    const { result, setError } = setup();

    await act(async () => {
      await result.current.onSignInPress();
    });

    expect(setError).toHaveBeenCalledWith(
      'Sign-in incomplete. Please try again.',
    );
    expect(setActive).not.toHaveBeenCalled();
  });

  it('maps a Clerk error code to a friendly message', async () => {
    signIn.create.mockRejectedValue(clerkError('form_password_incorrect'));
    const { result, setError } = setup();

    await act(async () => {
      await result.current.onSignInPress();
    });

    expect(setError).toHaveBeenCalledWith(
      'Password is incorrect. Please try again.',
    );
  });
});
