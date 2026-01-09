# E2E Testing Quick Reference

## Common Commands

### Run Tests Locally

```bash
# All tests with UI
pnpm exec playwright test --ui

# All tests (headless)
pnpm exec playwright test

# Specific test file
pnpm exec playwright test story-1.3-dashboard-shell.spec.ts

# Tests by tag
pnpm exec playwright test --grep "@P0"
pnpm exec playwright test --grep "@smoke"
pnpm exec playwright test --grep "@accessibility"

# Debug mode (opens browser, pauses at breakpoints)
pnpm exec playwright test --debug

# Show test report
pnpm exec playwright show-report
```

### Run Against Staging

```bash
# All tests against staging
BASE_URL=https://foundry-stage.williamjshaw.ca \
TEST_EMAIL=test@example.com \
TEST_PASSWORD=password \
pnpm exec playwright test

# Smoke tests only
BASE_URL=https://foundry-stage.williamjshaw.ca \
TEST_EMAIL=test@example.com \
TEST_PASSWORD=password \
pnpm exec playwright test --grep "@smoke"
```

### Generate Tests (Codegen)

```bash
# Record test against local app
pnpm exec playwright codegen http://localhost:5173

# Record against staging
pnpm exec playwright codegen https://foundry-stage.williamjshaw.ca
```

### View Traces

```bash
# View trace from failed test
pnpm exec playwright show-trace test-results/*/trace.zip

# View specific trace file
pnpm exec playwright show-trace test-results/story-1.3/trace.zip
```

## Test Tags Reference

| Tag | Purpose | Example |
|-----|---------|---------|
| `@P0` | Critical path (must pass) | Authentication, core flows |
| `@P1` | Important features | Secondary features |
| `@P2` | Nice to have | Edge cases, polish |
| `@smoke` | Smoke tests | Quick health check |
| `@skeleton` | Walking skeleton | End-to-end wiring |
| `@seeded` | Requires seeded data | Tests using pre-populated data |
| `@accessibility` | Accessibility tests | WCAG compliance |
| `@security` | Security tests | Auth, authorization, XSS |

## File Organization

```
e2e/
├── smoke/                              # Critical smoke tests
│   ├── walking-skeleton.spec.ts        # End-to-end wiring test
│   └── production.spec.ts              # Production health check
├── journeys/                           # Multi-step user journeys
│   ├── post-signup-journey.spec.ts     # New user flow
│   └── ai-generation-journey.spec.ts   # AI content flow
├── story-*.spec.ts                     # Story acceptance tests
├── accessibility.spec.ts               # Accessibility tests
├── security-isolation.spec.ts          # Security tests
├── visual-regression.spec.ts           # Visual regression
├── README.md                           # Full documentation
└── QUICK-REFERENCE.md                  # This file
```

## Playwright Selectors

### Recommended (Best → Worst)

1. **data-testid** (most stable)
   ```typescript
   await page.click('[data-testid="create-hub-button"]');
   ```

2. **Role + Name** (semantic)
   ```typescript
   await page.click('button', { name: 'Create Hub' });
   await page.getByRole('button', { name: 'Create Hub' }).click();
   ```

3. **Text** (fragile to changes)
   ```typescript
   await page.click('text=Create Hub');
   await page.getByText('Create Hub').click();
   ```

4. **CSS/XPath** (last resort)
   ```typescript
   await page.click('button.primary');
   await page.click('//button[@class="primary"]');
   ```

## Common Patterns

### Wait for Network Idle

```typescript
await page.goto('/');
await page.waitForLoadState('networkidle');
```

### Wait for Element

```typescript
// Visible
await page.waitForSelector('[data-testid="dashboard"]', { state: 'visible' });

// Using expect (recommended)
await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
```

### Fill Form

```typescript
await page.fill('[data-testid="email"]', 'test@example.com');
await page.fill('[data-testid="password"]', 'password');
await page.click('[data-testid="submit"]');
```

### Check Multiple Elements

```typescript
await expect(page.locator('[data-testid="hub-card"]')).toHaveCount(3);
```

### Upload File

```typescript
await page.setInputFiles('[data-testid="file-input"]', 'path/to/file.txt');
```

### Screenshot

```typescript
await page.screenshot({ path: 'screenshot.png', fullPage: true });
```

### Custom Timeout

```typescript
await page.click('[data-testid="slow-button"]', { timeout: 90000 }); // 90s
```

## Debugging

### Show Browser During Test

```bash
pnpm exec playwright test --headed
```

### Slow Motion

```bash
pnpm exec playwright test --slow-mo=1000  # 1s delay between actions
```

### Pause on Failure

```typescript
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.pause(); // Opens Playwright Inspector
  }
});
```

### Console Logs

```typescript
page.on('console', msg => console.log(msg.text()));
```

### Network Logs

```typescript
page.on('request', request => {
  console.log('>>', request.method(), request.url());
});

page.on('response', response => {
  console.log('<<', response.status(), response.url());
});
```

## CI/CD

### Trigger Workflow Manually

1. **GitHub → Actions → E2E Test Pipeline**
2. **Run workflow**
3. Select **environment** (stage/production)
4. (Optional) Add **test filter** (@P0, @smoke, etc.)
5. **Run workflow**

### View Results

1. **Actions → Latest workflow run**
2. **Jobs → E2E Tests (Shard X/4)**
3. **Artifacts → Download reports**

### Download and View HTML Report

```bash
# Download playwright-merged-report.zip from GitHub Actions
unzip playwright-merged-report.zip
open playwright-report/index.html
```

### View Trace from CI

```bash
# Download test-artifacts-shard-X.zip from GitHub Actions
unzip test-artifacts-shard-1.zip
pnpm exec playwright show-trace test-results/*/trace.zip
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:5173` | Target app URL |
| `WORKER_URL` | `http://localhost:8787` | Backend worker URL |
| `TEST_EMAIL` | - | Test user email |
| `TEST_PASSWORD` | - | Test user password |
| `CI` | - | CI environment flag |

## Assertions

### Visibility

```typescript
await expect(page.locator('.selector')).toBeVisible();
await expect(page.locator('.selector')).toBeHidden();
```

### Text Content

```typescript
await expect(page.locator('.selector')).toHaveText('Expected text');
await expect(page.locator('.selector')).toContainText('partial');
```

### Count

```typescript
await expect(page.locator('.item')).toHaveCount(5);
```

### Value (form inputs)

```typescript
await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
```

### URL

```typescript
await expect(page).toHaveURL(/.*dashboard/);
await expect(page).toHaveURL('http://localhost:5173/dashboard');
```

### Attribute

```typescript
await expect(page.locator('button')).toHaveAttribute('disabled');
await expect(page.locator('a')).toHaveAttribute('href', '/dashboard');
```

### CSS Class

```typescript
await expect(page.locator('.btn')).toHaveClass('btn-primary');
await expect(page.locator('.btn')).toHaveClass(/primary/);
```

## Performance

### Measure Page Load

```typescript
const startTime = Date.now();
await page.goto('/');
const loadTime = Date.now() - startTime;
expect(loadTime).toBeLessThan(3000); // 3s threshold
```

### Web Vitals

```typescript
const metrics = await page.evaluate(() => {
  const navigation = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');

  return {
    fcp: paint.find(e => e.name === 'first-contentful-paint')?.startTime,
    lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime,
    cls: navigation.cumulativeLayoutShift || 0,
  };
});

expect(metrics.fcp).toBeLessThan(1800);   // 1.8s
expect(metrics.lcp).toBeLessThan(2500);   // 2.5s
expect(metrics.cls).toBeLessThan(0.1);    // CLS < 0.1
```

## Tips

1. **Use UI mode for development**: `pnpm exec playwright test --ui`
2. **Tag tests appropriately**: Makes filtering easier
3. **Wait for conditions**, not timeouts: More reliable
4. **Use data-testid**: More stable than CSS selectors
5. **Check traces on failure**: Visual debugging is powerful
6. **Keep tests isolated**: Each test should be independent
7. **Run P0 tests frequently**: Catch regressions early
8. **Review CI artifacts**: Screenshots and traces reveal issues

## Resources

- Full Documentation: [README.md](./README.md)
- Setup Guide: [./setup/README.md](./setup/README.md)
- Playwright Docs: https://playwright.dev
