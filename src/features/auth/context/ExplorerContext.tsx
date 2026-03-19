import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export type ExplorerStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'needs_registration'
  | 'error';

type ExplorerState = {
  explorerId: number | null;
  explorerName: string | null;
  status: ExplorerStatus;
  errorMessage: string | null;

  setLoading: () => void;
  setNeedsRegistration: () => void;
  setError: (msg?: string) => void;
  setExplorer: (v: { explorerId: number; explorerName: string | null }) => void;
  resetExplorer: () => void;
};

const ExplorerContext = createContext<ExplorerState | null>(null);

export function ExplorerProvider({ children }: { children: React.ReactNode }) {
  const [explorerId, setExplorerId] = useState<number | null>(null);
  const [explorerName, setExplorerName] = useState<string | null>(null);
  const [status, setStatus] = useState<ExplorerStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setLoading = useCallback(() => {
    setStatus('loading');
    setErrorMessage(null);
  }, []);

  const setNeedsRegistration = useCallback(() => {
    setExplorerId(null);
    setExplorerName(null);
    setStatus('needs_registration');
    setErrorMessage(null);
  }, []);

  const setError = useCallback((msg?: string) => {
    setExplorerId(null);
    setExplorerName(null);
    setStatus('error');
    setErrorMessage(msg ?? 'Unable to load your profile.');
  }, []);

  const setExplorer = useCallback(
    ({
      explorerId,
      explorerName,
    }: {
      explorerId: number;
      explorerName: string | null;
    }) => {
      setExplorerId(explorerId);
      setExplorerName(explorerName);
      setStatus('ready');
      setErrorMessage(null);
    },
    [],
  );

  const resetExplorer = useCallback(() => {
    setExplorerId(null);
    setExplorerName(null);
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  const value = useMemo(
    () => ({
      explorerId,
      explorerName,
      status,
      errorMessage,
      setLoading,
      setNeedsRegistration,
      setError,
      setExplorer,
      resetExplorer,
    }),
    [
      explorerId,
      explorerName,
      status,
      errorMessage,
      setLoading,
      setNeedsRegistration,
      setError,
      setExplorer,
      resetExplorer,
    ],
  );

  return (
    <ExplorerContext.Provider value={value}>
      {children}
    </ExplorerContext.Provider>
  );
}

export function useExplorer() {
  const ctx = useContext(ExplorerContext);
  if (!ctx) throw new Error('useExplorer must be used within ExplorerProvider');
  return ctx;
}
