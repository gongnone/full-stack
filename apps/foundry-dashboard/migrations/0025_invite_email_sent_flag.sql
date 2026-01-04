-- Migration: Add invite_email_sent flag to prevent triple-send bug
-- Problem: Brand DNA invitation emails were sent 3x due to retry loop + race conditions
-- Solution: Add flag that is set BEFORE email is sent (optimistic locking pattern)

-- Add invite_email_sent flag (0 = not sent, 1 = sent)
ALTER TABLE client_onboard_tokens ADD COLUMN invite_email_sent INTEGER DEFAULT 0;

-- Add timestamp for when email was sent (for debugging/auditing)
ALTER TABLE client_onboard_tokens ADD COLUMN invite_email_sent_at INTEGER;

-- Backfill existing tokens: Mark old tokens as "sent" to prevent resending
-- Assumption: Tokens older than 1 hour have already had their email sent
-- This is safe because:
-- 1. Tokens are created immediately before email send
-- 2. Email send happens synchronously after token creation
-- 3. If a token exists for >1 hour, the email was either sent or permanently failed
UPDATE client_onboard_tokens
SET invite_email_sent = 1,
    invite_email_sent_at = created_at
WHERE created_at < unixepoch('now', '-1 hour') * 1000
  AND invite_email_sent = 0;
