# E2E Test Data Setup

This directory contains scripts to seed test data required by E2E tests.

## Quick Start

Before running E2E tests for the first time, seed the test database:

```bash
cd apps/foundry-dashboard
npx wrangler d1 execute foundry-global-stage --remote --file=e2e/setup/seed-strategy-approval-tests.sql
```

## What Gets Created

### Client Strategy Approval Tests

**File:** `seed-strategy-approval-tests.sql`
**Test:** `e2e/client-strategy-approval.spec.ts`

Creates:
- Test client: `E2E Test Client` (ID: `e2e-test-client-001`)
- 4 brand pillars ready for review
- 3 strategy approval tokens:
  - `e2e-valid-strategy-token` - Valid, unlocked (expires in 7 days)
  - `e2e-expired-strategy-token` - Expired yesterday
  - `e2e-locked-strategy-token` - Already locked/finalized

## Alternative: Manual Setup via Cloudflare Dashboard

If `wrangler` command fails:

1. Navigate to: **Cloudflare Dashboard → D1 → foundry-global-stage → Console**
2. Open `e2e/setup/seed-strategy-approval-tests.sql`
3. Copy all SQL commands
4. Paste into D1 Console and execute

## Cleaning Up Test Data

To remove all E2E test data:

```sql
DELETE FROM strategy_approval_tokens WHERE client_id = 'e2e-test-client-001';
DELETE FROM client_proposed_pillars WHERE client_id = 'e2e-test-client-001';
DELETE FROM client_approved_pillars WHERE client_id = 'e2e-test-client-001';
DELETE FROM brand_dna_sessions WHERE client_id = 'e2e-test-client-001';
DELETE FROM client_research_reports WHERE client_id = 'e2e-test-client-001';
DELETE FROM clients WHERE id = 'e2e-test-client-001';
```

## Running E2E Tests

Run E2E tests locally before pushing changes:

```bash
cd apps/foundry-dashboard
pnpm exec playwright test                # Run all tests
pnpm exec playwright test --grep "@P0"   # Run priority tests
```

## Troubleshooting

### Tests fail with "Invalid token"

✅ **Fix:** Run the seeding script

```bash
npx wrangler d1 execute foundry-global-stage --remote --file=e2e/setup/seed-strategy-approval-tests.sql
```

### Wrangler authentication error

✅ **Fix:** Login to Cloudflare first

```bash
npx wrangler login
```

### Permission denied on D1 execute

✅ **Fix:** Use Cloudflare Dashboard Console instead (see "Alternative" above)

### Data already exists error

✅ **Fix:** The script cleans up existing test data first. If you still get errors, manually delete test data (see "Cleaning Up" above), then re-run script.

## Adding New Test Fixtures

When creating new E2E tests that need database seeding:

1. Create a new SQL file: `seed-{feature}-tests.sql`
2. Follow the pattern:
   - Use predictable IDs with `e2e-` prefix
   - Include cleanup commands at the top
   - Document tokens/IDs in comments
3. Update this README with setup instructions
4. Update CI workflow to run new seeding script

## Development Workflow

```bash
# 1. Seed test data (first time only, or when test data changes)
npx wrangler d1 execute foundry-global-stage --remote --file=e2e/setup/seed-strategy-approval-tests.sql

# 2. Run E2E tests
BASE_URL=https://foundry-stage.williamjshaw.ca pnpm test:e2e

# 3. Debug specific test
BASE_URL=https://foundry-stage.williamjshaw.ca pnpm test:e2e -- e2e/client-strategy-approval.spec.ts --ui
```
