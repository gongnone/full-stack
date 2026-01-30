-- P0-2 Test Data Creation Script
-- Run this in Cloudflare Dashboard → D1 → foundry-global-stage → Console

-- Step 1: Create test hub
INSERT INTO hubs (id, client_id, source_type, source_url, status, created_at, updated_at)
VALUES (
  'test-hub-p0-2-001',
  'test-client-001',
  'text',
  'manual-test',
  'active',
  unixepoch(),
  unixepoch()
);

-- Step 2: Create 15 test spokes for review sprint
-- These spokes will have varying quality scores to test different buckets
INSERT INTO spokes (
  id,
  client_id,
  hub_id,
  pillar_id,
  platform,
  content,
  status,
  g7_engagement,
  g2_hook,
  g4_voice,
  g5_platform,
  created_at,
  updated_at
)
VALUES
  -- High confidence spokes (G7 >= 9.0)
  ('test-spoke-p0-2-001', 'test-client-001', 'test-hub-p0-2-001', 'test-pillar-catalyst-001', 'linkedin', 'Test spoke #1: High confidence content with excellent engagement metrics.', 'pending', 9.5, 95, 1, 1, unixepoch(), unixepoch()),
  ('test-spoke-p0-2-002', 'test-client-001', 'test-hub-p0-2-001', 'test-pillar-core-truth-001', 'linkedin', 'Test spoke #2: Another high-quality piece ready for immediate approval.', 'pending', 9.2, 92, 1, 1, unixepoch(), unixepoch()),
  ('test-spoke-p0-2-003', 'test-client-001', 'test-hub-p0-2-001', 'test-pillar-proof-001', 'linkedin', 'Test spoke #3: Compelling content with strong hook and engagement potential.', 'pending', 9.0, 90, 1, 1, unixepoch(), unixepoch()),

  -- Needs review spokes (G7 5.0-9.0)
  ('test-spoke-p0-2-004', 'test-client-001', 'test-hub-p0-2-001', 'test-pillar-catalyst-001', 'linkedin', 'Test spoke #4: Good content but needs human judgment for final approval.', 'pending', 8.5, 85, 1, 1, unixepoch(), unixepoch()),
  ('test-spoke-p0-2-005', 'test-client-001', 'test-hub-p0-2-001', 'test-pillar-core-truth-001', 'linkedin', 'Test spoke #5: Moderate quality, could use some refinement or editing.', 'pending', 8.0, 80, 1, 1, unixepoch(), unixepoch()),
  ('test-spoke-p0-2-006', 'test-client-001', 'test-hub-p0-2-001', 'test-pillar-proof-001', 'linkedin', 'Test spoke #6: Decent content with room for improvement in engagement.', 'pending', 7.5, 75, 1, 1, unixepoch(), unixepoch()),
  ('test-spoke-p0-2-007', 'test-client-001', 'test-hub-p0-2-001', 'test-pillar-catalyst-001', 'linkedin', 'Test spoke #7: Average quality, may need edits to maximize impact.', 'pending', 7.0, 70, 1, 1, unixepoch(), unixepoch()),
  ('test-spoke-p0-2-008', 'test-client-001', 'test-hub-p0-2-001', 'test-pillar-core-truth-001', 'linkedin', 'Test spoke #8: Needs review to determine if it meets quality standards.', 'pending', 6.5, 65, 1, 1, unixepoch(), unixepoch()),
  ('test-spoke-p0-2-009', 'test-client-001', 'test-hub-p0-2-001', 'test-pillar-proof-001', 'linkedin', 'Test spoke #9: Lower quality but salvageable with editing.', 'pending', 6.0, 60, 1, 1, unixepoch(), unixepoch()),
  ('test-spoke-p0-2-010', 'test-client-001', 'test-hub-p0-2-001', 'test-pillar-catalyst-001', 'linkedin', 'Test spoke #10: Borderline content requiring careful consideration.', 'pending', 5.5, 55, 1, 1, unixepoch(), unixepoch()),

  -- Additional spokes for milestone testing (to reach 15 total)
  ('test-spoke-p0-2-011', 'test-client-001', 'test-hub-p0-2-001', 'test-pillar-core-truth-001', 'linkedin', 'Test spoke #11: Content for testing 50% milestone celebration.', 'pending', 8.2, 82, 1, 1, unixepoch(), unixepoch()),
  ('test-spoke-p0-2-012', 'test-client-001', 'test-hub-p0-2-001', 'test-pillar-proof-001', 'linkedin', 'Test spoke #12: Additional content for progress tracking verification.', 'pending', 7.8, 78, 1, 1, unixepoch(), unixepoch()),
  ('test-spoke-p0-2-013', 'test-client-001', 'test-hub-p0-2-001', 'test-pillar-catalyst-001', 'linkedin', 'Test spoke #13: Content for testing 75% milestone celebration.', 'pending', 8.8, 88, 1, 1, unixepoch(), unixepoch()),
  ('test-spoke-p0-2-014', 'test-client-001', 'test-hub-p0-2-001', 'test-pillar-core-truth-001', 'linkedin', 'Test spoke #14: Near the end, testing progress bar accuracy.', 'pending', 9.1, 91, 1, 1, unixepoch(), unixepoch()),
  ('test-spoke-p0-2-015', 'test-client-001', 'test-hub-p0-2-001', 'test-pillar-proof-001', 'linkedin', 'Test spoke #15: Final spoke for testing sprint completion flow.', 'pending', 9.3, 93, 1, 1, unixepoch(), unixepoch());

-- Verification queries
-- Run these to confirm data was created successfully:

-- Check hub was created
SELECT * FROM hubs WHERE id = 'test-hub-p0-2-001';

-- Check spokes were created (should return 15 rows)
SELECT COUNT(*) as spoke_count FROM spokes WHERE hub_id = 'test-hub-p0-2-001';

-- Check quality score distribution
SELECT
  CASE
    WHEN g7_engagement >= 9.0 THEN 'High Confidence (9.0+)'
    WHEN g7_engagement >= 5.0 THEN 'Needs Review (5.0-9.0)'
    ELSE 'Low Quality (<5.0)'
  END as bucket,
  COUNT(*) as count
FROM spokes
WHERE hub_id = 'test-hub-p0-2-001'
GROUP BY bucket;
