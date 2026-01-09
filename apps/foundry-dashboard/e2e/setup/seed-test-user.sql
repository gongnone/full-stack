-- Seed test user for E2E tests
-- This script creates the e2e-test@foundry.local user with a known password hash

-- Delete existing test user if exists
DELETE FROM account WHERE account_id = 'e2e-test@foundry.local';
DELETE FROM user WHERE email = 'e2e-test@foundry.local';

-- Create test user
-- Password: TestPassword123!
-- Hash generated with: node -e "console.log(require('bcryptjs').hashSync('TestPassword123!', 10))"
INSERT INTO user (id, email, email_verified, name, created_at, updated_at, role)
VALUES (
  'test-user-e2e-001',
  'e2e-test@foundry.local',
  1,
  'E2E Test User',
  unixepoch(),
  unixepoch(),
  'admin'
);

-- Create account with bcrypt hash
-- This hash is for password: TestPassword123!
-- Generated with bcryptjs v2.4.3
INSERT INTO account (id, user_id, account_id, provider_id, password, created_at, updated_at)
VALUES (
  'test-account-e2e-001',
  'test-user-e2e-001',
  'e2e-test@foundry.local',
  'credential',
  '$2a$10$YPXHZzXvq8g3k8fY9UYZvOKx.FBk9tZW5h0Hx8qKQz5X6J0TZQX7K',
  unixepoch(),
  unixepoch()
);

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

-- Associate user with client
INSERT OR REPLACE INTO client_members (id, client_id, user_id, role, created_at)
VALUES (
  'test-member-e2e-001',
  'test-client-e2e-001',
  'test-user-e2e-001',
  'owner',
  unixepoch()
);

-- Create 3 approved pillars for testing
INSERT OR REPLACE INTO content_pillars (
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
