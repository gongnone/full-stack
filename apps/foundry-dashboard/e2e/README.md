# E2E Testing Guide

This directory contains end-to-end (E2E) tests for the Foundry Dashboard using Playwright.

## Quick Start

### Local Development

```bash
# Run all E2E tests locally
cd apps/foundry-dashboard
pnpm exec playwright test

# Run with UI mode (interactive)
pnpm exec playwright test --ui

# Run specific test file
pnpm exec playwright test story-1.3-dashboard-shell.spec.ts

# Run tests matching a tag
pnpm exec playwright test --grep "@P0"
pnpm exec playwright test --grep "@smoke"

# Debug mode (opens browser)
pnpm exec playwright test --debug

# Generate test code
pnpm exec playwright codegen http://localhost:5173
```

### Against Staging Environment

```bash
# Run against staging environment
BASE_URL=https://foundry-stage.williamjshaw.ca pnpm exec playwright test

# With test credentials
BASE_URL=https://foundry-stage.williamjshaw.ca \
TEST_EMAIL=your-test-user@example.com \
TEST_PASSWORD=your-password \
pnpm exec playwright test
```

## Test Organization

### Directory Structure

```
e2e/
├── smoke/                    # Critical path smoke tests
│   ├── walking-skeleton.spec.ts
│   └── production.spec.ts
├── journeys/                 # User journey tests
│   ├── post-signup-journey.spec.ts
│   └── ai-generation-journey.spec.ts
├── story-*.spec.ts          # Story-specific acceptance tests
├── accessibility.spec.ts    # Accessibility compliance tests
├── security-isolation.spec.ts
├── visual-regression.spec.ts
└── README.md               # This file
```

### Test Tags

Tests use tags for filtering and organization:

- `@P0` - Priority 0 (critical path)
- `@P1` - Priority 1 (important)
- `@P2` - Priority 2 (nice to have)
- `@smoke` - Smoke tests
- `@skeleton` - Walking skeleton tests
- `@seeded` - Tests requiring seeded data
- `@accessibility` - Accessibility tests
- `@security` - Security tests

## CI/CD Pipeline

### GitHub Actions Workflow

The E2E test pipeline runs automatically on:

- **Push to `stage` or `main` branches**
- **Pull requests** targeting `stage` or `main`
- **Manual trigger** via GitHub UI

Pipeline stages:

1. **TypeCheck**: Validates TypeScript compilation
2. **E2E Tests**: Runs tests in parallel (4 shards)
3. **Merge Reports**: Combines results from all shards
4. **Summary**: Displays results and uploads artifacts

### Required GitHub Secrets

Configure these secrets in **Settings → Secrets and variables → Actions**:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `E2E_TEST_EMAIL` | Test user email for authentication | `e2e-test@foundry.local` |
| `E2E_TEST_PASSWORD` | Test user password | `SecurePassword123!` |

Optional secrets for advanced scenarios:

| Secret Name | Description |
|-------------|-------------|
| `CLOUDFLARE_API_TOKEN` | For deployment workflows |
| `CLOUDFLARE_ACCOUNT_ID` | For deployment workflows |

### Manual Trigger

You can manually trigger the E2E pipeline with custom parameters:

1. Go to **Actions → E2E Test Pipeline**
2. Click **Run workflow**
3. Select options:
   - **Environment**: `stage` or `production`
   - **Test filter**: e.g., `@P0`, `@smoke`, or `story-1.3`

### Viewing Test Results

After pipeline runs:

1. **Go to the workflow run** in GitHub Actions
2. **Check the Summary** for overall status
3. **Download artifacts**:
   - `playwright-merged-report`: Combined HTML report
   - `test-artifacts-shard-*`: Screenshots, traces, videos (on failure)

To view the HTML report:
```bash
# Download and extract playwright-merged-report.zip
unzip playwright-merged-report.zip
open playwright-report/index.html
```

## Playwright Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:5173` | Target application URL |
| `WORKER_URL` | `http://localhost:8787` | Backend worker URL |
| `TEST_EMAIL` | - | Test user email |
| `TEST_PASSWORD` | - | Test user password |
| `CI` | - | Enables CI-specific behavior |

### Browser Configuration

Tests run on three browsers by default:
- **Chromium** (Chrome/Edge)
- **Firefox**
- **WebKit** (Safari)

In CI, tests run with:
- **Retries**: 2 attempts on failure
- **Workers**: 1 (sequential) for remote URLs
- **Timeout**: 60s per test
- **Trace**: On first retry
- **Screenshots**: On failure

### Sharding

The CI pipeline uses **4 parallel shards** for faster execution:

```yaml
strategy:
  matrix:
    shardIndex: [1, 2, 3, 4]
    shardTotal: [4]
```

Adjust `shardTotal` based on test suite size:
- 50-100 tests: 2 shards
- 100-200 tests: 4 shards
- 200+ tests: 6-8 shards

## Writing Tests

### Test Structure

```typescript
/**
 * Story X.X: Feature Name
 *
 * @tags @P0 @story-x.x
 */
import { test, expect } from '@playwright/test';

test.describe('Story X.X: Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should do something @P0', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Act
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.locator('.success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use data-testid attributes** for reliable selectors:
   ```typescript
   await page.click('[data-testid="create-hub-button"]');
   ```

2. **Wait for network stability**:
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

3. **Use page object models** for complex flows:
   ```typescript
   class HubWizard {
     constructor(private page: Page) {}

     async createHub(name: string) {
       await this.page.fill('[data-testid="hub-name"]', name);
       await this.page.click('[data-testid="submit"]');
     }
   }
   ```

4. **Add descriptive test names and tags**:
   ```typescript
   test('should validate email format on signup @P0 @validation', async ({ page }) => {
     // ...
   });
   ```

5. **Capture context on failure**:
   ```typescript
   test.afterEach(async ({ page }, testInfo) => {
     if (testInfo.status !== testInfo.expectedStatus) {
       await testInfo.attach('screenshot', {
         body: await page.screenshot(),
         contentType: 'image/png',
       });
     }
   });
   ```

## Debugging Failed Tests

### Local Debugging

```bash
# Run with debug mode
pnpm exec playwright test --debug story-1.3

# Show browser during test
pnpm exec playwright test --headed

# Run in slow motion
pnpm exec playwright test --slow-mo=1000

# Generate trace
pnpm exec playwright test --trace on
```

### Viewing Traces

```bash
# View trace from test-results/
pnpm exec playwright show-trace test-results/story-1.3/trace.zip
```

### CI Debugging

1. **Download test artifacts** from GitHub Actions
2. **Extract and open trace files**:
   ```bash
   unzip test-artifacts-shard-1.zip
   pnpm exec playwright show-trace test-results/*/trace.zip
   ```
3. **View screenshots** in `test-results/*/test-failed-*.png`

## Common Issues

### Authentication Failures

**Problem**: Tests fail with "Not authenticated" errors

**Solution**:
- Ensure `TEST_EMAIL` and `TEST_PASSWORD` are set
- Check that test user exists in target environment
- Verify OAuth callback URLs in Google Console

### Timeout Errors

**Problem**: Tests timeout waiting for elements

**Solution**:
- Increase timeout in `playwright.config.ts`
- Add `waitForLoadState('networkidle')` before assertions
- Check network tab for slow requests

### Flaky Tests

**Problem**: Tests pass/fail intermittently

**Solution**:
- Use `waitForSelector` instead of fixed `waitForTimeout`
- Ensure proper wait conditions (visibility, enabled state)
- Check for race conditions in async operations
- Add retries for specific tests

### Worker/Database Issues

**Problem**: Tests fail in CI but pass locally

**Solution**:
- Verify environment variables are set in GitHub secrets
- Check Cloudflare Workers are deployed and healthy
- Ensure D1 database is accessible
- Review worker logs in Cloudflare dashboard

## Test Data Management

### Seeded Tests

Tests tagged with `@seeded` require specific data:

```bash
# Run setup script first
pnpm exec playwright test setup-stage-data.spec.ts

# Then run seeded tests
pnpm exec playwright test --grep @seeded
```

### Test User Creation

Use `create-test-user.spec.ts` to create test users:

```bash
# Create a test user via signup flow
pnpm exec playwright test create-test-user.spec.ts
```

### Cleanup

Add cleanup logic in `test.afterAll`:

```typescript
test.afterAll(async () => {
  // Cleanup test data
  await cleanupTestUser(testEmail);
});
```

## Performance Testing

### Load Testing

Use Playwright's workers for basic load testing:

```typescript
test.describe.configure({ mode: 'parallel' });

for (let i = 0; i < 10; i++) {
  test(`concurrent user ${i}`, async ({ page }) => {
    // Simulate concurrent users
  });
}
```

### Metrics Collection

Capture performance metrics:

```typescript
const metrics = await page.evaluate(() => ({
  fcp: performance.getEntriesByType('paint')
    .find(e => e.name === 'first-contentful-paint')?.startTime,
  lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime,
}));

expect(metrics.fcp).toBeLessThan(2000); // 2s threshold
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Guide](https://playwright.dev/docs/ci)
- [GitHub Actions](https://docs.github.com/en/actions)

## Support

For issues or questions:

1. Check existing test files for examples
2. Review Playwright documentation
3. Check GitHub Actions logs for CI failures
4. Review test artifacts (screenshots, traces)
