import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';

import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import * as moderationApi from '@/src/features/moderation/api/moderationApi';
import type { ReportReason } from '@/src/features/moderation/types/ReportReason';

// Owns report submission for one conversation partner. On failure the modal
// keeps the user's reason/comment so nothing is lost.
export function useReportUser(args: {
  reportedExplorerId: number | null;
  conversationId: number | null;
}) {
  const { reportedExplorerId, conversationId } = args;

  const { explorerId } = useExplorer();
  const { getToken } = useAuth();

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (reason: ReportReason, comment: string) => {
      if (!explorerId || reportedExplorerId == null || submitting) return;

      setSubmitting(true);
      setError(null);

      try {
        const token = await getTokenRef.current();
        const trimmed = comment.trim();
        await moderationApi.reportUser({
          explorerId,
          reportedExplorerId,
          conversationId,
          reason,
          comment: trimmed.length > 0 ? trimmed : null,
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmitted(true);
      } catch {
        setError('Could not send your report. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [explorerId, reportedExplorerId, conversationId, submitting],
  );

  // Called when the modal closes so the next open starts fresh.
  const reset = useCallback(() => {
    setSubmitted(false);
    setError(null);
  }, []);

  return { submit, submitting, submitted, error, reset };
}
