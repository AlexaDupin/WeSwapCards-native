import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';

import { fetchExplorerInfo } from '@/src/features/auth/api/userApi';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';

export function ExplorerHydration({ children }: { children: React.ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn, getToken, signOut } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  const {
    explorerId,
    status,
    setExplorer,
    resetExplorer,
    setLoading,
    setNeedsRegistration,
    setError,
  } = useExplorer();

  const getTokenRef = useRef(getToken);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    console.log('[ExplorerHydration] status', status);
    if (!authLoaded) return;

    if (!isSignedIn) {
      inFlightRef.current = false;
      resetExplorer();
      return;
    }

    if (!userLoaded || !user?.id) return;

    if (explorerId != null) {
      inFlightRef.current = false;
      return;
    }

    if (status !== 'idle') return;
    if (inFlightRef.current) return;

    const hydrateExplorer = async () => {
      inFlightRef.current = true;
      setLoading();

      try {
        const token = await getTokenRef.current();

        if (!mountedRef.current) return;

        if (!token) {
          inFlightRef.current = false;
          await signOut();
          return;
        }

        const explorer = await fetchExplorerInfo({
          token,
          userUID: user.id,
        });

        if (!mountedRef.current) return;

        inFlightRef.current = false;

        if (!explorer?.id) {
          setNeedsRegistration();
          return;
        }

        setExplorer({
          explorerId: explorer.id,
          explorerName: explorer.name ?? null,
        });
      } catch {
        console.log('[ExplorerHydration] setting error state');
        if (!mountedRef.current) return;

        inFlightRef.current = false;
        setError();
      }
    };

    void hydrateExplorer();
  }, [
    authLoaded,
    isSignedIn,
    userLoaded,
    user?.id,
    explorerId,
    status,
    resetExplorer,
    setLoading,
    setNeedsRegistration,
    setError,
    setExplorer,
    signOut,
  ]);

  return <>{children}</>;
}
