// Kept in sync with the backend REPORT_REASONS whitelist and the DB CHECK
// constraint on user_report.reason.
export type ReportReason =
  | 'harassment'
  | 'inappropriate_content'
  | 'spam'
  | 'scam'
  | 'other';
