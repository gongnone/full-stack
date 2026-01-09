-- Seed client and pillars for E2E tests
-- User is created separately via signup page in create-test-user.spec.ts

-- Create test client
INSERT OR REPLACE INTO clients (id, name, status, industry, created_at, updated_at)
VALUES (
  'test-client-e2e-001',
  'Test Client - E2E',
  'active',
  'Technology',
  unixepoch(),
  unixepoch()
);

-- Associate user with client (user_id will be set after user creation)
-- This will be updated after user is created
DELETE FROM client_members WHERE client_id = 'test-client-e2e-001';

-- Create 3 approved pillars for testing
DELETE FROM content_pillars WHERE client_id = 'test-client-e2e-001';

INSERT INTO content_pillars (
  id,
  client_id,
  title,
  description,
  rationale,
  status,
  priority,
  framework_type,
  generated_by,
  created_at,
  updated_at
)
VALUES
  (
    'test-pillar-catalyst-001',
    'test-client-e2e-001',
    'Industry Disruption Insights',
    'Challenge conventional wisdom and share contrarian insights that make audiences question industry norms.',
    'Positions brand as thought leader willing to challenge status quo',
    'approved',
    1,
    'CATALYST',
    'system',
    unixepoch(),
    unixepoch()
  ),
  (
    'test-pillar-core-truth-001',
    'test-client-e2e-001',
    'Behind-the-Scenes Wisdom',
    'Share internal processes, mistakes, and lessons learned to build authentic connection.',
    'Humanizes brand and builds trust through vulnerability',
    'approved',
    2,
    'CORE_TRUTH',
    'system',
    unixepoch(),
    unixepoch()
  ),
  (
    'test-pillar-proof-001',
    'test-client-e2e-001',
    'Results & Case Studies',
    'Showcase tangible outcomes and real-world examples of success.',
    'Provides social proof and demonstrates expertise',
    'approved',
    3,
    'PROOF',
    'system',
    unixepoch(),
    unixepoch()
  );
