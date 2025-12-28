# E2E Test Pipeline Setup Guide

This guide walks through setting up the E2E test pipeline for the Foundry Dashboard.

## Prerequisites

- GitHub repository with push access
- Cloudflare account with deployed Foundry applications
- Test user account on staging environment

## 1. Configure GitHub Secrets

Add these secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

### Required Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `E2E_TEST_EMAIL` | Test user email | Create a dedicated test user on staging |
| `E2E_TEST_PASSWORD` | Test user password | Password for the test user |

### Optional Secrets (for deployment workflows)

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | Cloudflare Dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | Cloudflare Dashboard → Account ID |

### Creating a Test User

#### Option 1: Via Staging Application

1. Navigate to `https://foundry-stage.williamjshaw.ca`
2. Sign up with a new account (e.g., `e2e-test@foundry.local`)
3. Complete the signup flow
4. Note the email and password for GitHub secrets

#### Option 2: Via E2E Test Script

```bash
cd apps/foundry-dashboard

# Run the test user creation script
pnpm exec playwright test create-test-user.spec.ts

# Note: This creates a user via the signup form
# Save the credentials shown in the test output
```

## 2. Verify Workflow Configuration

The E2E pipeline is configured in `.github/workflows/e2e-tests.yaml`.

### Triggers

The workflow runs automatically on:

- Push to `stage` or `main` branches
- Pull requests targeting `stage` or `main`
- Manual dispatch via GitHub UI

### Environment Mapping

| Git Branch | Target Environment | URL |
|------------|-------------------|-----|
| `stage` | Stage | https://foundry-stage.williamjshaw.ca |
| `main` | Production | https://foundry.williamjshaw.ca |

### Sharding Configuration

Tests run in parallel using **4 shards** by default:

```yaml
strategy:
  matrix:
    shardIndex: [1, 2, 3, 4]
    shardTotal: [4]
```

Adjust based on your test suite size:
- 50-100 tests: 2 shards
- 100-200 tests: 4 shards
- 200+ tests: 6-8 shards

## 3. Test Workflow Locally

Before pushing, test the workflow locally:

```bash
cd apps/foundry-dashboard

# Install Playwright browsers
pnpm exec playwright install --with-deps

# Run tests locally
pnpm exec playwright test

# Run against staging
BASE_URL=https://foundry-stage.williamjshaw.ca \
TEST_EMAIL=your-test-email@example.com \
TEST_PASSWORD=your-password \
pnpm exec playwright test
```

## 4. Trigger First CI Run

### Push to Stage Branch

```bash
git checkout stage
git pull origin stage
git push origin stage
```

This triggers the E2E pipeline automatically.

### Manual Trigger

1. Go to **GitHub Actions**
2. Select **E2E Test Pipeline**
3. Click **Run workflow**
4. Choose options:
   - Environment: `stage` or `production`
   - Test filter: (optional) e.g., `@P0` or `@smoke`
5. Click **Run workflow**

## 5. Monitor Test Results

### In GitHub Actions UI

1. Go to **Actions** tab
2. Click on the workflow run
3. View job status:
   - TypeCheck
   - E2E Tests (4 shards)
   - Merge Reports
   - Summary

### Download Artifacts

After the run completes:

1. Scroll to **Artifacts** section
2. Download:
   - `playwright-merged-report` - Combined HTML report
   - `test-artifacts-shard-*` - Screenshots/traces (on failure)

### View HTML Report

```bash
# Extract the downloaded artifact
unzip playwright-merged-report.zip

# Open in browser
open playwright-report/index.html
```

## 6. Debug Failures

### Local Debugging

```bash
cd apps/foundry-dashboard

# Run in debug mode
pnpm exec playwright test --debug

# Run with UI mode
pnpm exec playwright test --ui

# Show trace viewer
pnpm exec playwright show-trace test-results/*/trace.zip
```

### CI Debugging

1. Download `test-artifacts-shard-*` from GitHub Actions
2. Extract the archive
3. View traces:
   ```bash
   pnpm exec playwright show-trace test-results/*/trace.zip
   ```
4. Check screenshots in `test-results/*/test-failed-*.png`

## 7. Common Issues

### Issue: Tests fail with "Not authenticated"

**Cause**: Test credentials not set or invalid

**Solution**:
- Verify `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` secrets are set
- Ensure test user exists in target environment
- Check OAuth callback URLs in Google Console

### Issue: Workflow doesn't trigger on push

**Cause**: Workflow file not in `main` or `stage` branch

**Solution**:
```bash
# Ensure workflow is in the branch
git checkout stage
git pull origin stage
ls -la .github/workflows/e2e-tests.yaml

# If missing, merge from your feature branch
git merge your-feature-branch
git push origin stage
```

### Issue: Parallel tests fail with conflicts

**Cause**: Tests sharing state (e.g., same test user)

**Solution**:
- Tests run sequentially (`workers: 1`) when targeting remote URLs
- Ensure tests create isolated data
- Use unique test data per test

### Issue: Timeout errors in CI

**Cause**: Network latency, slow responses

**Solution**:
- Increase timeout in `playwright.config.ts`
- Add `waitForLoadState('networkidle')` before assertions
- Check Cloudflare Workers performance

## 8. Advanced Configuration

### Run Specific Test Priority

Add test filter to manual workflow:

1. **GitHub Actions → E2E Test Pipeline → Run workflow**
2. **Test filter**: `@P0`
3. Click **Run workflow**

This runs only P0 (critical path) tests.

### Run Single Test File

Test filter: `story-1.3-dashboard-shell.spec.ts`

### Adjust Sharding

Edit `.github/workflows/e2e-tests.yaml`:

```yaml
strategy:
  matrix:
    shardIndex: [1, 2, 3, 4, 5, 6]  # Increase for more parallel workers
    shardTotal: [6]
```

### Enable Video Recording

Edit `apps/foundry-dashboard/playwright.config.ts`:

```typescript
use: {
  video: 'on-first-retry', // or 'on' or 'retain-on-failure'
},
```

Note: Videos increase artifact size significantly.

## 9. Maintenance

### Update Playwright

```bash
cd apps/foundry-dashboard

# Update Playwright
pnpm update @playwright/test playwright

# Update browsers
pnpm exec playwright install --with-deps
```

### Add New Tests

1. Create test file in `apps/foundry-dashboard/e2e/`
2. Add appropriate tags (e.g., `@P0`, `@smoke`)
3. Run locally: `pnpm exec playwright test your-test.spec.ts`
4. Push to `stage` branch to run in CI

### Monitor Test Health

Regularly review:
- Test duration (aim for <60s per test)
- Flaky tests (pass rate < 95%)
- Coverage gaps (untested critical paths)

Use GitHub Actions insights to track trends.

## 10. Best Practices

### Test Organization

- Tag tests by priority: `@P0`, `@P1`, `@P2`
- Group related tests: `test.describe('Feature', () => {})`
- Use descriptive names: `test('should validate email format @P0')`

### Test Data

- Create isolated test data per test
- Clean up after tests (use `test.afterAll`)
- Avoid hardcoded data (use environment variables)

### Assertions

- Wait for conditions: `await expect(locator).toBeVisible()`
- Avoid fixed timeouts: Use `waitForSelector` instead of `setTimeout`
- Add context: `expect(value, 'Custom message').toBe(expected)`

### Performance

- Parallelize independent tests
- Share auth state across tests
- Minimize network requests in tests

## Support

For questions or issues:

1. Check [E2E Testing Guide](../apps/foundry-dashboard/e2e/README.md)
2. Review [Playwright Documentation](https://playwright.dev)
3. Check workflow logs in GitHub Actions
4. Review test artifacts (screenshots, traces)

## Next Steps

- [ ] Configure GitHub secrets
- [ ] Create test user on staging
- [ ] Test workflow locally
- [ ] Trigger first CI run
- [ ] Review test results
- [ ] Set up notifications (optional)

Once complete, the E2E pipeline will run automatically on every push to `stage` or `main` branches!
