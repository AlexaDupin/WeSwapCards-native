import { act, renderHook } from '@testing-library/react-native';

import { useSignUpSubmit } from '@/src/features/auth/hooks/useSignUpSubmit';

// Mock the boundaries: Clerk + router. authErrors is intentionally NOT mocked
// so the code -> message mapping is exercised end-to-end.

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const mockUseSignUp = jest.fn();
jest.mock('@clerk/clerk-expo', () => ({
  useSignUp: () => mockUseSignUp(),
}));

let signUp: {
  create: jest.Mock;
  prepareEmailAddressVerification: jest.Mock;
  attemptEmailAddressVerification: jest.Mock;
};
let setActive: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});

  signUp = {
    create: jest.fn().mockResolvedValue(undefined),
    prepareEmailAddressVerification: jest.fn().mockResolvedValue(undefined),
    attemptEmailAddressVerification: jest.fn(),
  };
  setActive = jest.fn().mockResolvedValue(undefined);
  mockUseSignUp.mockReturnValue({ isLoaded: true, signUp, setActive });
});

type Overrides = Partial<Parameters<typeof useSignUpSubmit>[0]>;

function setup(overrides: Overrides = {}) {
  const setPendingVerification = jest.fn();
  const setIsSubmitting = jest.fn();
  const setError = jest.fn();

  const { result } = renderHook(() =>
    useSignUpSubmit({
      emailAddress: 'user@example.com',
      password: 'secret',
      code: '',
      pendingVerification: false,
      setPendingVerification,
      isSubmitting: false,
      setIsSubmitting,
      setError,
      ...overrides,
    }),
  );

  return { result, setPendingVerification, setIsSubmitting, setError };
}

function clerkError(opts: { code?: string; message?: string }) {
  return { errors: [{ code: opts.code, message: opts.message }] };
}

describe('onSignUpPress', () => {
  it('creates the sign-up, prepares verification, and flips into pending state', async () => {
    const { result, setPendingVerification, setError } = setup({
      emailAddress: '  user@example.com  ',
    });

    await act(async () => {
      await result.current.onSignUpPress();
    });

    expect(signUp.create).toHaveBeenCalledWith({
      emailAddress: 'user@example.com', // trimmed
      password: 'secret',
      legalAccepted: true,
    });
    expect(signUp.prepareEmailAddressVerification).toHaveBeenCalledWith({
      strategy: 'email_code',
    });
    expect(setPendingVerification).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith('');
  });

  it('validates that email and password are present', async () => {
    const { result, setError } = setup({ emailAddress: '   ', password: '' });

    await act(async () => {
      await result.current.onSignUpPress();
    });

    expect(setError).toHaveBeenCalledWith(
      'Please enter your email and password.',
    );
    expect(signUp.create).not.toHaveBeenCalled();
  });

  it('does nothing while not loaded or already submitting', async () => {
    mockUseSignUp.mockReturnValue({ isLoaded: false, signUp, setActive });
    const notLoaded = setup();
    await act(async () => {
      await notLoaded.result.current.onSignUpPress();
    });
    expect(signUp.create).not.toHaveBeenCalled();

    mockUseSignUp.mockReturnValue({ isLoaded: true, signUp, setActive });
    const submitting = setup({ isSubmitting: true });
    await act(async () => {
      await submitting.result.current.onSignUpPress();
    });
    expect(signUp.create).not.toHaveBeenCalled();
  });

  it('maps a Clerk error code to a friendly message', async () => {
    signUp.create.mockRejectedValue(
      clerkError({ code: 'form_identifier_exists' }),
    );
    const { result, setError } = setup();

    await act(async () => {
      await result.current.onSignUpPress();
    });

    expect(setError).toHaveBeenCalledWith(
      'That email address is already in use. Please try another or sign in.',
    );
  });
});

describe('onVerifyPress', () => {
  it('activates the session and redirects when verification is complete', async () => {
    signUp.attemptEmailAddressVerification.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'sess_123',
    });
    const { result } = setup({ pendingVerification: true, code: '123456' });

    await act(async () => {
      await result.current.onVerifyPress();
    });

    expect(setActive).toHaveBeenCalledWith({ session: 'sess_123' });
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/cards');
  });

  it('honors a custom redirect target', async () => {
    signUp.attemptEmailAddressVerification.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'sess_123',
    });
    const { result } = setup({
      pendingVerification: true,
      code: '123456',
      redirectTo: '/(tabs)/dashboard',
    });

    await act(async () => {
      await result.current.onVerifyPress();
    });

    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/dashboard');
  });

  it('requires a code', async () => {
    const { result, setError } = setup({ pendingVerification: true, code: '  ' });

    await act(async () => {
      await result.current.onVerifyPress();
    });

    expect(setError).toHaveBeenCalledWith('Please enter the verification code.');
    expect(signUp.attemptEmailAddressVerification).not.toHaveBeenCalled();
  });

  it('does nothing when there is no pending verification', async () => {
    const { result, setError } = setup({
      pendingVerification: false,
      code: '123456',
    });

    await act(async () => {
      await result.current.onVerifyPress();
    });

    expect(signUp.attemptEmailAddressVerification).not.toHaveBeenCalled();
    expect(setError).not.toHaveBeenCalled();
  });

  it('restarts the flow when the verification session has expired', async () => {
    signUp.attemptEmailAddressVerification.mockRejectedValue(
      clerkError({ message: 'No sign up attempt was found.' }),
    );
    const { result, setPendingVerification, setError } = setup({
      pendingVerification: true,
      code: '123456',
    });

    await act(async () => {
      await result.current.onVerifyPress();
    });

    expect(setPendingVerification).toHaveBeenCalledWith(false);
    expect(setError).toHaveBeenCalledWith(
      'Your verification session expired. Please restart sign-up to request a new code.',
    );
  });

  it('surfaces "additional verification required" for a non-complete status', async () => {
    signUp.attemptEmailAddressVerification.mockResolvedValue({
      status: 'needs_second_factor',
    });
    const { result, setError } = setup({
      pendingVerification: true,
      code: '123456',
    });

    await act(async () => {
      await result.current.onVerifyPress();
    });

    expect(setError).toHaveBeenCalledWith('Additional verification is required.');
    expect(setActive).not.toHaveBeenCalled();
  });

  it('maps a Clerk verification error code', async () => {
    signUp.attemptEmailAddressVerification.mockRejectedValue(
      clerkError({ code: 'form_code_incorrect' }),
    );
    const { result, setError } = setup({
      pendingVerification: true,
      code: '000000',
    });

    await act(async () => {
      await result.current.onVerifyPress();
    });

    expect(setError).toHaveBeenCalledWith(
      'That code is incorrect. Please try again.',
    );
  });
});
