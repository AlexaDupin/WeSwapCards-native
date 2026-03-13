import { useCallback, useState } from 'react';
import type { DashboardConversation } from '@/src/features/dashboard/types/DashboardTypes';

export function useUiUnreadOverrides() {
  const [uiUnreadOverrides, setUiUnreadOverrides] = useState<
    Record<number, boolean>
  >({});

  const isUnread = useCallback(
    (conv: DashboardConversation) => {
      const override = uiUnreadOverrides[conv.db_id];

      if (override !== undefined) {
        if (conv.unread > 0 && override === false) return true;
        return override;
      }

      return conv.unread > 0;
    },
    [uiUnreadOverrides],
  );

  const setUiUnread = useCallback((dbId: number, next: boolean) => {
    setUiUnreadOverrides((prev) => ({ ...prev, [dbId]: next }));
  }, []);

  return { isUnread, setUiUnread };
}
