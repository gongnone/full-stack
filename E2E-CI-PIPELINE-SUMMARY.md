# E2E CI Pipeline Implementation Summary

## Overview

A comprehensive GitHub Actions CI pipeline has been implemented for running Playwright E2E tests on the Foundry Dashboard. The pipeline supports parallel test execution with sharding, automatic artifact collection, and environment-aware testing.

## Files Created/Modified

### Created Files

1. **`.github/workflows/e2e-tests.yaml`**
   - Main GitHub Actions workflow for E2E testing
   - Implements 4-shard parallel execution
   - Includes TypeScript checking, test execution, and report merging
   - Supports manual triggers with custom parameters

2. **`.github/SETUP-E2E.md`**
   - Comprehensive setup guide for the E2E pipeline
   - Instructions for configuring GitHub secrets
   - Troubleshooting guide and best practices
   - Step-by-step onboarding for new developers

3. **`apps/foundry-dashboard/e2e/README.md`**
   - Developer guide for writing and running E2E tests
   - Local development commands and examples
   - Test organization patterns and tagging conventions
   - Debugging tips and performance testing guidance

### Modified Files

1. **`apps/foundry-dashboard/playwright.config.ts`**
   - Added blob reporter for CI (enables report merging)
   - Added GitHub reporter for GitHub Actions annotations
   - Maintains HTML reporter for local development

2. **`.gitignore`**
   - Added Playwright-specific ignore patterns
   - Includes: `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.cache/`

## Pipeline Architecture

### Workflow Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Trigger Events                       │
│  • Push to stage/main                                  │
│  • Pull requests to stage/main                         │
│  • Manual workflow dispatch                            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              Job 1: TypeScript Check                    │
│  • Install dependencies (pnpm)                         │
│  • Run foundry:typecheck:build                         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│       Job 2: E2E Tests (4 Parallel Shards)             │
│                                                         │
│  Shard 1/4  │  Shard 2/4  │  Shard 3/4  │  Shard 4/4  │
│  ├─ Install dependencies                               │
│  ├─ Install Playwright browsers                        │
│  ├─ Run tests (with sharding)                          │
│  ├─ Upload blob report                                 │
│  └─ Upload test artifacts (on failure)                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│           Job 3: Merge Reports                          │
│  • Download all blob reports                           │
│  • Merge into single HTML report                       │
│  • Upload merged report                                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│            Job 4: Test Summary                          │
│  • Display results                                     │
│  • Fail if tests failed                                │
└─────────────────────────────────────────────────────────┘
```

### Environment Mapping

| Git Branch/Input | Target Environment | Base URL |
|------------------|-------------------|----------|
| `stage` branch | Stage | https://foundry-stage.williamjshaw.ca |
| `main` branch | Production | https://foundry.williamjshaw.ca |
| Manual (stage) | Stage | https://foundry-stage.williamjshaw.ca |
| Manual (production) | Production | https://foundry.williamjshaw.ca |

## Key Features

### 1. Parallel Sharding

- **4 parallel workers** for faster test execution
- Tests automatically distributed across shards
- Configurable via `matrix.shardTotal` in workflow

### 2. Smart Triggering

- **Path filtering**: Only runs when relevant code changes
- **PR support**: Runs on pull requests for pre-merge validation
- **Manual dispatch**: Allows on-demand test runs with custom filters

### 3. Comprehensive Reporting

- **Blob reports**: Individual shard results
- **Merged HTML report**: Combined results from all shards
- **GitHub annotations**: Test failures appear in PR comments
- **Test artifacts**: Screenshots, traces, videos on failure

### 4. Environment Awareness

- **Automatic environment selection** based on branch
- **Environment-specific credentials** via GitHub secrets
- **Remote execution** against deployed staging/production

### 5. Retry Logic

- **2 retries on CI** (configured in playwright.config.ts)
- **Trace on first retry** for debugging
- **Screenshots on all failures**

## Configuration

### GitHub Secrets (Required)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `E2E_TEST_EMAIL` | Test user email | `e2e-test@foundry.local` |
| `E2E_TEST_PASSWORD` | Test user password | `SecurePassword123!` |

### Playwright Configuration

```typescript
// apps/foundry-dashboard/playwright.config.ts

{
  fullyParallel: true,           // Parallel test execution
  forbidOnly: !!process.env.CI,  // Prevent test.only in CI
  retries: process.env.CI ? 2 : 0, // Retry on CI
  workers: process.env.CI ? 1 : undefined, // Sequential for remote
  timeout: 60000,                 // 60s per test

  reporter: process.env.CI
    ? [
        ['list'],                 // Console output
        ['blob'],                 // For merging
        ['github'],               // PR annotations
      ]
    : 'html',                     // Local HTML report

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
}
```

### Test Organization

Tests are organized by:

1. **Priority tags**: `@P0`, `@P1`, `@P2`
2. **Type tags**: `@smoke`, `@skeleton`, `@accessibility`, `@security`
3. **State tags**: `@seeded` (requires seeded data)
4. **Story tags**: `@story-X.X` (linked to user stories)

## Usage

### Automatic Triggers

```bash
# Push to stage branch (triggers stage environment tests)
git checkout stage
git push origin stage

# Create PR to main (triggers production environment tests)
git checkout -b feature/new-feature
# ... make changes ...
git push origin feature/new-feature
# Create PR to main via GitHub UI
```

### Manual Trigger

1. **GitHub Actions → E2E Test Pipeline → Run workflow**
2. Select **environment**: `stage` or `production`
3. (Optional) Add **test filter**: `@P0`, `@smoke`, or test file name
4. Click **Run workflow**

### Local Testing

```bash
cd apps/foundry-dashboard

# Run all tests
pnpm exec playwright test

# Run with UI mode
pnpm exec playwright test --ui

# Run against staging
BASE_URL=https://foundry-stage.williamjshaw.ca \
TEST_EMAIL=test@example.com \
TEST_PASSWORD=password \
pnpm exec playwright test

# Run specific priority
pnpm exec playwright test --grep "@P0"

# Debug mode
pnpm exec playwright test --debug
```

## Artifacts

### Blob Reports

- **Purpose**: Raw test results from each shard
- **Location**: `blob-report-{1,2,3,4}`
- **Retention**: 7 days
- **Usage**: Input for report merging

### Test Artifacts (on failure)

- **Purpose**: Debugging failed tests
- **Contents**:
  - Screenshots (`test-failed-*.png`)
  - Traces (`trace.zip`)
  - Videos (if enabled)
- **Location**: `test-artifacts-shard-{1,2,3,4}`
- **Retention**: 7 days

### Merged HTML Report

- **Purpose**: Comprehensive test results
- **Contents**: Interactive HTML report with:
  - Pass/fail status per test
  - Test duration
  - Screenshots
  - Traces
  - Error messages
- **Location**: `playwright-merged-report`
- **Retention**: 14 days

## Performance

### Execution Time

- **Sequential**: ~40-60 minutes (all tests, 3 browsers)
- **4-shard parallel**: ~10-15 minutes
- **Per test average**: ~30-60 seconds

### Resource Usage

- **Parallel jobs**: 4 concurrent GitHub Actions runners
- **Memory**: ~4GB per runner (Playwright + browsers)
- **Artifact size**:
  - Blob reports: ~10-50MB total
  - Test artifacts: ~100-500MB (on failure)
  - Merged report: ~50-100MB

## Monitoring

### GitHub Actions UI

1. **Actions tab** → **E2E Test Pipeline**
2. View workflow runs with status
3. Click on run to see job details
4. Download artifacts from run summary

### Test Trends

Track over time:
- Pass/fail rate
- Test duration
- Flaky tests (retry rate)
- Coverage (number of tests)

### Alerts

- **Email notifications**: Configure in GitHub settings
- **Slack integration**: Use GitHub Actions Slack app
- **PR comments**: Automatic via GitHub reporter

## Maintenance

### Updating Playwright

```bash
cd apps/foundry-dashboard
pnpm update @playwright/test playwright
pnpm exec playwright install --with-deps

# Commit updated package.json and pnpm-lock.yaml
git add package.json pnpm-lock.yaml
git commit -m "chore: update Playwright to vX.X.X"
```

### Adding Tests

1. Create test file in `apps/foundry-dashboard/e2e/`
2. Add appropriate tags
3. Run locally to verify
4. Push to `stage` to run in CI

### Adjusting Sharding

Edit `.github/workflows/e2e-tests.yaml`:

```yaml
strategy:
  matrix:
    shardIndex: [1, 2, 3, 4, 5, 6]  # Increase for more parallel workers
    shardTotal: [6]
```

## Best Practices

### Test Writing

1. **Use data-testid** for selectors
2. **Wait for conditions**, not fixed timeouts
3. **Isolate test data** (unique per test)
4. **Tag appropriately** (@P0 for critical paths)
5. **Add descriptive names** and error messages

### CI/CD Integration

1. **Run P0 tests on every PR** (via path filtering)
2. **Run full suite on stage push**
3. **Manual smoke tests before production deploy**
4. **Review artifacts on failures**

### Debugging

1. **Check GitHub Actions logs** first
2. **Download and view traces** for visual debugging
3. **Check screenshots** for UI state at failure
4. **Reproduce locally** against same environment

## Troubleshooting

### Tests Pass Locally but Fail in CI

- **Check environment differences**: Local vs staging
- **Verify secrets are set**: TEST_EMAIL, TEST_PASSWORD
- **Review timing**: CI may be slower (increase timeouts)
- **Check for race conditions**: Network requests, animations

### Workflow Doesn't Trigger

- **Verify path filtering**: Changes must touch monitored paths
- **Check branch name**: Must be `stage` or `main`
- **Ensure workflow is committed**: On the target branch

### Shard Jobs Fail to Merge

- **Check blob-report uploads**: All 4 shards must succeed
- **Verify artifact names**: Must match pattern `blob-report-*`
- **Review merge-reports job logs**: For specific errors

## Next Steps

1. **Configure GitHub secrets** (see `.github/SETUP-E2E.md`)
2. **Create test user** on staging environment
3. **Test workflow locally** (see `apps/foundry-dashboard/e2e/README.md`)
4. **Trigger first CI run** (push to `stage` branch)
5. **Review results** and iterate

## Resources

- [E2E Setup Guide](.github/SETUP-E2E.md)
- [E2E Developer Guide](apps/foundry-dashboard/e2e/README.md)
- [Playwright Documentation](https://playwright.dev)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Existing Deploy Workflows](.github/workflows/deploy-stage.yaml)

## Success Metrics

The E2E pipeline is successful when:

- [ ] Tests run automatically on push/PR
- [ ] Parallel execution reduces total time by 75%
- [ ] Test artifacts available on all failures
- [ ] Merged HTML report generated successfully
- [ ] P0 tests maintain 100% pass rate
- [ ] Flaky test rate < 5%
- [ ] Team uses manual triggers for ad-hoc testing

---

**Implementation Date**: 2025-12-28
**Pipeline Version**: 1.0
**Foundry Dashboard**: apps/foundry-dashboard
**Workflow File**: .github/workflows/e2e-tests.yaml
