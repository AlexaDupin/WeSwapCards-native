import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';

import { fetchExplorerInfo } from '@/src/features/auth/api/userApi';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';

export function ExplorerHydration({ children }: { children: React.ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const {
    explorerId,
    setExplorer,
    resetExplorer,
    setLoading,
    setNeedsRegistration,
    setError,
  } = useExplorer();

  useEffect(() => {
    if (!authLoaded) return;

    if (!isSignedIn) {
      resetExplorer();
      return;
    }

    if (!userLoaded || !user?.id) return;
    if (explorerId != null) return;

    let cancelled = false;

    (async () => {
      setLoading();

      const token = await getToken();
      if (!token || cancelled) return;

      try {
        const explorer = await fetchExplorerInfo({
          token,
          userUID: user.id,
        });

        if (cancelled) return;

        if (!explorer?.id) {
          setNeedsRegistration();
          return;
        }

        setExplorer({
          explorerId: explorer.id,
          explorerName: explorer.name ?? null,
        });
      } catch (e: any) {
        if (cancelled) return;
        setError();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    authLoaded,
    isSignedIn,
    userLoaded,
    user?.id,
    explorerId,
    getToken,
    setExplorer,
    resetExplorer,
    setLoading,
    setNeedsRegistration,
    setError,
  ]);

  return <>{children}</>;
}
