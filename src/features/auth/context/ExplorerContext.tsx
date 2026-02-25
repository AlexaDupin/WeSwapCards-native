import React, { createContext, useContext, useMemo, useState } from 'react';

type ExplorerState = {
  explorerId: number | null;
  explorerName: string | null;
  setExplorer: (v: { explorerId: number; explorerName: string | null }) => void;
  resetExplorer: () => void;
};

const ExplorerContext = createContext<ExplorerState | null>(null);

export function ExplorerProvider({ children }: { children: React.ReactNode }) {
  const [explorerId, setExplorerId] = useState<number | null>(null);
  const [explorerName, setExplorerName] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      explorerId,
      explorerName,
      setExplorer: ({ explorerId, explorerName }) => {
        setExplorerId(explorerId);
        setExplorerName(explorerName);
      },
      resetExplorer: () => {
        setExplorerId(null);
        setExplorerName(null);
      },
    }),
    [explorerId, explorerName],
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
