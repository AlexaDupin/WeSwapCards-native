import React, { createContext, useContext, useMemo, useState } from 'react';

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

  const value = useMemo(
    () => ({
      explorerId,
      explorerName,
      status,
      errorMessage,

      setLoading: () => {
        setStatus('loading');
        setErrorMessage(null);
      },

      setNeedsRegistration: () => {
        setExplorerId(null);
        setExplorerName(null);
        setStatus('needs_registration');
        setErrorMessage(null);
      },

      setError: (msg?: string) => {
        setExplorerId(null);
        setExplorerName(null);
        setStatus('error');
        setErrorMessage(msg ?? 'Unable to load your profile.');
      },

      setExplorer: ({ explorerId, explorerName }) => {
        setExplorerId(explorerId);
        setExplorerName(explorerName);
        setStatus('ready');
        setErrorMessage(null);
      },

      resetExplorer: () => {
        setExplorerId(null);
        setExplorerName(null);
        setStatus('idle');
        setErrorMessage(null);
      },
    }),
    [explorerId, explorerName, status, errorMessage],
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
