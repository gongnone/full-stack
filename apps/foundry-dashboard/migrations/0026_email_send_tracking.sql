-- Migration: Add email send tracking for monitoring and debugging
-- Tracks all email attempts with outcomes for observability

CREATE TABLE IF NOT EXISTS email_send_log (
  id TEXT PRIMARY KEY,
  email_type TEXT NOT NULL, -- 'brand_invite', 'verification', 'password_reset', etc.
  recipient_email TEXT NOT NULL,
  idempotency_key TEXT NOT NULL, -- Prevents duplicate sends
  status TEXT NOT NULL, -- 'success', 'failed', 'retrying'
  attempt_number INTEGER NOT NULL DEFAULT 1,
  ses_message_id TEXT, -- SES MessageId if successful
  error_message TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Index for deduplication checks (fast lookup by idempotency key)
CREATE INDEX IF NOT EXISTS idx_email_log_idempotency ON email_send_log(idempotency_key);

-- Index for monitoring (recent failures)
CREATE INDEX IF NOT EXISTS idx_email_log_status_created ON email_send_log(status, created_at);

-- Index for recipient tracking
CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON email_send_log(recipient_email);
