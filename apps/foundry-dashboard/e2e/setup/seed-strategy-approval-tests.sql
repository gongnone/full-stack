-- ============================================================================
-- E2E Test Data: Client Strategy Approval Flow
-- ============================================================================
--
-- Purpose: Seeds test data for e2e/client-strategy-approval.spec.ts
--
-- Usage:
--   cd apps/foundry-dashboard
--   npx wrangler d1 execute foundry-global-stage --remote --file=e2e/setup/seed-strategy-approval-tests.sql
--
-- Or via Cloudflare Dashboard:
--   Navigate to: D1 → foundry-global-stage → Console
--   Paste SQL below and execute
--
-- ============================================================================

-- Clean up any existing E2E test data
DELETE FROM strategy_approval_tokens WHERE client_id = 'e2e-test-client-001';
DELETE FROM client_proposed_pillars WHERE client_id = 'e2e-test-client-001';
DELETE FROM client_approved_pillars WHERE client_id = 'e2e-test-client-001';
DELETE FROM brand_dna_sessions WHERE client_id = 'e2e-test-client-001';
DELETE FROM client_research_reports WHERE client_id = 'e2e-test-client-001';
DELETE FROM clients WHERE id = 'e2e-test-client-001';

-- 1. Create test client
INSERT INTO clients (id, name, status, contact_email, brand_color, created_at, updated_at)
VALUES (
  'e2e-test-client-001',
  'E2E Test Client',
  'active',
  'e2e-test@example.com',
  '#1D9BF0',
  unixepoch(),
  unixepoch()
);

-- 2. Create Brand DNA session (complete status)
INSERT INTO brand_dna_sessions (id, client_id, status, current_step, created_at, updated_at)
VALUES (
  'e2e-session-001',
  'e2e-test-client-001',
  'complete',
  'complete',
  unixepoch(),
  unixepoch()
);

-- 3. Create research report
INSERT INTO client_research_reports (
  id,
  client_id,
  industry,
  sub_niche,
  top_performers_json,
  hook_patterns_json,
  competitive_gaps_json,
  framework_fit_json,
  recommendations_json,
  status,
  started_at,
  completed_at,
  created_at
) VALUES (
  'e2e-research-001',
  'e2e-test-client-001',
  'Executive Coaching',
  'Leadership for tech founders',
  '[{"name":"Test Performer 1","platform":"Twitter","strength":"Contrarian takes"}]',
  '{"contrarian":{"prevalence":0.34,"avgEngagement":3.2}}',
  '["Gap 1","Gap 2"]',
  '{"teach":0.85,"challenge":0.91}',
  '["Recommendation 1","Recommendation 2"]',
  'complete',
  unixepoch(),
  unixepoch(),
  unixepoch()
);

-- 4. Create proposed pillars (4 pillars for testing)
INSERT INTO client_proposed_pillars (id, client_id, pillars_json, status, generation_round, created_at)
VALUES (
  'e2e-proposal-001',
  'e2e-test-client-001',
  '[
    {
      "id": "pillar-1",
      "name": "Leadership Myths Debunked",
      "strategy": ["TEACH", "CHALLENGE"],
      "rationale": "Contrarian takes get 3.2x engagement in your niche. Your voice analysis shows strong myth-buster tendencies.",
      "exampleHook": "The leadership advice that got your last CEO fired",
      "confidence": 0.92
    },
    {
      "id": "pillar-2",
      "name": "Boardroom Confessions",
      "strategy": ["ENTERTAIN", "PROVE"],
      "rationale": "Story-driven content is underused by competitors. Your candid voice is perfect for authentic failure stories.",
      "exampleHook": "I lost a $2M client because I was too proud to ask for help",
      "confidence": 0.88
    },
    {
      "id": "pillar-3",
      "name": "The 3-Second Decision",
      "strategy": ["ENGINEER"],
      "rationale": "Framework content drives saves and shares. Your decisive stance translates perfectly to tactical content.",
      "exampleHook": "The framework I use to make million-dollar decisions in 3 seconds",
      "confidence": 0.85
    },
    {
      "id": "pillar-4",
      "name": "Tech Founder Survival Guide",
      "strategy": ["TEACH"],
      "rationale": "Technical founders are underserved in leadership content. Your background gives you unique credibility.",
      "exampleHook": "What engineering taught me about leading people (hint: it is not about optimization)",
      "confidence": 0.82
    }
  ]',
  'pending',
  1,
  unixepoch()
);

-- 5. Create VALID strategy token (expires in 7 days)
-- Token: e2e-valid-strategy-token
INSERT INTO strategy_approval_tokens (id, client_id, token, expires_at, created_at, locked_at)
VALUES (
  'e2e-token-valid-001',
  'e2e-test-client-001',
  'e2e-valid-strategy-token',
  unixepoch() + (7 * 24 * 60 * 60),
  unixepoch(),
  NULL
);

-- 6. Create EXPIRED strategy token (expired yesterday)
-- Token: e2e-expired-strategy-token
INSERT INTO strategy_approval_tokens (id, client_id, token, expires_at, created_at, locked_at)
VALUES (
  'e2e-token-expired-001',
  'e2e-test-client-001',
  'e2e-expired-strategy-token',
  unixepoch() - 86400,
  unixepoch() - (8 * 24 * 60 * 60),
  NULL
);

-- 7. Create LOCKED strategy token (already finalized)
-- Token: e2e-locked-strategy-token
INSERT INTO strategy_approval_tokens (id, client_id, token, expires_at, created_at, locked_at)
VALUES (
  'e2e-token-locked-001',
  'e2e-test-client-001',
  'e2e-locked-strategy-token',
  unixepoch() + (7 * 24 * 60 * 60),
  unixepoch(),
  unixepoch()
);

-- 8. Pre-approve 2 pillars for locked token scenario
INSERT INTO client_approved_pillars (id, client_id, pillar_name, strategy_tags, approved_at, created_at)
VALUES
  (
    'pillar-1',
    'e2e-test-client-001',
    'Leadership Myths Debunked',
    '["TEACH","CHALLENGE"]',
    unixepoch(),
    unixepoch()
  ),
  (
    'pillar-2',
    'e2e-test-client-001',
    'Boardroom Confessions',
    '["ENTERTAIN","PROVE"]',
    unixepoch(),
    unixepoch()
  );

-- ============================================================================
-- SEEDING COMPLETE
-- ============================================================================
--
-- Test tokens created:
--   ✅ e2e-valid-strategy-token (valid, unlocked)
--   ✅ e2e-expired-strategy-token (expired)
--   ✅ e2e-locked-strategy-token (locked)
--
-- Update e2e/client-strategy-approval.spec.ts TEST_TOKENS with these values:
--   valid: 'e2e-valid-strategy-token'
--   expired: 'e2e-expired-strategy-token'
--   locked: 'e2e-locked-strategy-token'
--
-- ============================================================================
