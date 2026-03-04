import { useCallback, useState } from 'react';
import type { DashboardConversation } from '@/src/features/dashboard/types/DashboardTypes';

export function useUiUnreadOverrides() {
  const [uiUnreadOverrides, setUiUnreadOverrides] = useState<
    Record<number, boolean>
  >({});

  const isUnread = useCallback(
    (conv: DashboardConversation) => {
      const override = uiUnreadOverrides[conv.db_id];

      if (conv.unread > 0 && override === false) return true;

      if (override === true) return true;
      if (override === false) return false;

      return conv.unread > 0;
    },
    [uiUnreadOverrides],
  );

  const setUiUnread = useCallback((dbId: number, next: boolean) => {
    setUiUnreadOverrides((prev) => ({ ...prev, [dbId]: next }));
  }, []);

  return { isUnread, setUiUnread };
}
