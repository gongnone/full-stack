-- Migration 0027: Create testimonials table for FR-1.5.16
-- Testimonials requested after batch approval (10+ spokes)

CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'text')),
  content TEXT,
  r2_key TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'snoozed', 'approved', 'declined', 'public')),
  public_permission INTEGER DEFAULT 0,
  trigger_event TEXT CHECK (trigger_event IN ('batch_approval', 'milestone', 'manual')),
  sentiment TEXT CHECK (sentiment IN ('excited', 'solid', 'needs_work')),
  snooze_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  approved_at INTEGER,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Index for efficient client lookups
CREATE INDEX IF NOT EXISTS idx_testimonials_client_id ON testimonials(client_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
