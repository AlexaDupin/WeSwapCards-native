import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import {
  ExplorerProvider,
  useExplorer,
} from '@/src/features/auth/context/ExplorerContext';
import { ExplorerHydration } from '@/src/features/auth/components/ExplorerHydration';

// ---- Module mocks ----

jest.mock('@clerk/clerk-expo', () => ({
  useAuth: jest.fn(),
  useUser: jest.fn(),
}));

jest.mock('@/src/features/auth/api/userApi', () => ({
  fetchExplorerInfo: jest.fn(),
}));

// ---- Typed mock access ----

const { useAuth, useUser } = jest.requireMock('@clerk/clerk-expo') as {
  useAuth: jest.Mock;
  useUser: jest.Mock;
};

const { fetchExplorerInfo } = jest.requireMock(
  '@/src/features/auth/api/userApi',
) as { fetchExplorerInfo: jest.Mock };

// ---- Test consumer ----
// Reads the public ExplorerContext API and exposes state via testIDs.
// Sentinel value 'null' is rendered when explorerId or errorMessage is null,
// keeping the probe consistent regardless of context state.

function ConsumerComponent() {
  const { status, explorerId, errorMessage, resetExplorer } = useExplorer();
  return (
    <>
      <Text testID="status">{status}</Text>
      <Text testID="explorerId">{explorerId ?? 'null'}</Text>
      <Text testID="errorMessage">{errorMessage ?? 'null'}</Text>
      <TouchableOpacity testID="retry" onPress={resetExplorer} />
    </>
  );
}

// ---- Render helper ----

function renderHydration() {
  return render(
    <ExplorerProvider>
      <ExplorerHydration>
        <ConsumerComponent />
      </ExplorerHydration>
    </ExplorerProvider>,
  );
}

// ---- Setup ----

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    getToken: jest.fn().mockResolvedValue('test-token'),
    signOut: jest.fn(),
  });
  useUser.mockReturnValue({
    user: { id: 'uid-1' },
    isLoaded: true,
  });
});

// ---- Tests ----

describe('ExplorerHydration', () => {
  it('sets status to ready and populates explorerId on successful hydration', async () => {
    fetchExplorerInfo.mockResolvedValue({ id: 42, name: 'Alice' });

    renderHydration();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('ready');
    });

    expect(screen.getByTestId('explorerId')).toHaveTextContent('42');
    expect(fetchExplorerInfo).toHaveBeenCalledTimes(1);
    expect(fetchExplorerInfo).toHaveBeenCalledWith({
      token: 'test-token',
      userUID: 'uid-1',
    });
  });

  it('does not call fetchExplorerInfo and keeps context clean when user is not signed in', async () => {
    useAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      getToken: jest.fn(),
      signOut: jest.fn(),
    });

    renderHydration();

    // Flush pending effects to confirm hydration was not triggered
    await act(async () => {});

    expect(fetchExplorerInfo).not.toHaveBeenCalled();
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
    expect(screen.getByTestId('explorerId')).toHaveTextContent('null');
    expect(screen.getByTestId('errorMessage')).toHaveTextContent('null');
  });

  it('calls signOut and does not call fetchExplorerInfo when getToken returns null', async () => {
    const signOut = jest.fn();
    useAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: jest.fn().mockResolvedValue(null),
      signOut,
    });

    renderHydration();

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
    });

    expect(fetchExplorerInfo).not.toHaveBeenCalled();
  });

  it('reaches error state and does not re-fetch after a network failure', async () => {
    fetchExplorerInfo.mockRejectedValue(new Error('Network Error'));

    renderHydration();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error');
    });

    expect(fetchExplorerInfo).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('explorerId')).toHaveTextContent('null');

    // Flush any further effects to confirm no automatic retry
    await act(async () => {});

    expect(fetchExplorerInfo).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('status')).toHaveTextContent('error');
    expect(screen.getByTestId('explorerId')).toHaveTextContent('null');
  });

  it('re-hydrates successfully after user-initiated retry', async () => {
    fetchExplorerInfo.mockRejectedValueOnce(new Error('Network Error'));
    fetchExplorerInfo.mockResolvedValueOnce({ id: 99, name: 'Bob' });

    renderHydration();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error');
    });

    // Retry via the public ExplorerContext API — the same call the Retry
    // button in (tabs)/_layout.tsx makes via resetExplorer()
    fireEvent.press(screen.getByTestId('retry'));

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('ready');
    });

    expect(screen.getByTestId('explorerId')).toHaveTextContent('99');
    expect(fetchExplorerInfo).toHaveBeenCalledTimes(2);
  });

  it('sets status to needs_registration when backend returns no explorer id', async () => {
    const signOut = jest.fn();
    useAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: jest.fn().mockResolvedValue('test-token'),
      signOut,
    });

    fetchExplorerInfo.mockResolvedValue(null);

    renderHydration();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('needs_registration');
    });

    expect(screen.getByTestId('explorerId')).toHaveTextContent('null');
    expect(fetchExplorerInfo).toHaveBeenCalledTimes(1);
    expect(signOut).not.toHaveBeenCalled();
  });
});
