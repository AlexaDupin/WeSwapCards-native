import type { ReportReason } from '@/src/features/moderation/types/ReportReason';

// Options shown in the report modal, in display order.
export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'spam', label: 'Spam' },
  { value: 'scam', label: 'Scam or fraud' },
  { value: 'other', label: 'Other' },
];

export const REPORT_COMMENT_MAX_LENGTH = 500;
