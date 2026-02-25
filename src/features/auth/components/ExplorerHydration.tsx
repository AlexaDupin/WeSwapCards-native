import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';

import { fetchExplorerInfo } from '@/src/features/auth/api/userApi';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';

export function ExplorerHydration({ children }: { children: React.ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { setExplorer, resetExplorer } = useExplorer();

  useEffect(() => {
    if (!authLoaded) return;

    if (!isSignedIn) {
      resetExplorer();
      return;
    }

    if (!userLoaded || !user?.id) return;

    let cancelled = false;

    (async () => {
      const token = await getToken();
      if (!token || cancelled) return;

      try {
        const explorer = await fetchExplorerInfo({
          token,
          userUID: user.id,
        });
        if (cancelled) return;
        if (explorer?.id) {
          setExplorer({
            explorerId: explorer.id,
            explorerName: explorer.name ?? null,
          });
        }
      } catch (_) {
        // Backend error or network: leave explorer null; tabs will show loader
        // and user can retry by signing in again or refreshing
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
    getToken,
    setExplorer,
    resetExplorer,
  ]);

  return <>{children}</>;
}
