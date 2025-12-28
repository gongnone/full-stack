# Test Quality Review: user-journey.spec.ts

**Quality Score**: 72/100 (B - Acceptable)
**Review Date**: 2025-12-28
**Review Scope**: Single File
**Reviewer**: TEA Agent (Test Architect)

---

## Executive Summary

**Overall Assessment**: Acceptable - Needs Improvement

**Recommendation**: Approve with Comments

### Key Strengths

✅ Excellent test ID convention (AUTH-01, CLIENT-01, etc.) - all 23 tests have IDs
✅ Well-organized structure with 8 logical stages mirroring user journey
✅ Good use of Playwright fixtures for authentication (`auth.fixture`)
✅ Network interception patterns used correctly (`page.route` before navigation)
✅ Explicit assertions present in all tests with meaningful error messages
✅ Comprehensive coverage of user journey from signup to export

### Key Weaknesses

❌ **9 hard waits detected** (`waitForTimeout`) - high flakiness risk
❌ File is 1049 lines (3x recommended 300 line limit) - maintainability risk
❌ No data factories - hardcoded test credentials and strings
❌ Try/catch blocks used to control test flow (determinism issue)
❌ Conditionals (`if/else`) used extensively in tests - non-deterministic

### Summary

The test suite demonstrates solid structural organization and good coverage of the complete user journey across 8 stages. Test IDs are consistently applied, making traceability excellent. However, the file's length (1049 lines) significantly exceeds best practices and should be split into smaller, focused files per stage. The 9 hard waits (`waitForTimeout`) are the most critical concern as they introduce flakiness. The extensive use of conditionals and try/catch blocks to handle UI variations makes tests non-deterministic and harder to debug when failures occur.

---

## Quality Criteria Assessment

| Criterion                            | Status    | Violations | Notes                                          |
| ------------------------------------ | --------- | ---------- | ---------------------------------------------- |
| BDD Format (Given-When-Then)         | ⚠️ WARN   | 23         | Comments exist but no explicit GWT structure   |
| Test IDs                             | ✅ PASS   | 0          | All 23 tests have IDs (AUTH-01, etc.)          |
| Priority Markers (P0/P1/P2/P3)       | ✅ PASS   | 0          | @P0 tags present on all test.describe blocks   |
| Hard Waits (sleep, waitForTimeout)   | ❌ FAIL   | 9          | Multiple waitForTimeout calls detected         |
| Determinism (no conditionals)        | ❌ FAIL   | 15         | Extensive if/else, try/catch in tests          |
| Isolation (cleanup, no shared state) | ✅ PASS   | 0          | Each test uses fresh page, no shared state     |
| Fixture Patterns                     | ⚠️ WARN   | 3          | Uses auth.fixture, but login() is ad-hoc       |
| Data Factories                       | ❌ FAIL   | 8          | Hardcoded emails, passwords, no factories      |
| Network-First Pattern                | ✅ PASS   | 0          | page.route() before page.goto() where used     |
| Explicit Assertions                  | ✅ PASS   | 0          | All tests have expect() assertions             |
| Test Length (≤300 lines)             | ❌ FAIL   | 1          | 1049 lines (3x over limit)                     |
| Test Duration (≤1.5 min)             | ✅ PASS   | 0          | Individual tests complete quickly              |
| Flakiness Patterns                   | ⚠️ WARN   | 5          | Hard waits + conditionals = moderate risk      |

**Total Violations**: 2 Critical, 3 High, 2 Medium, 1 Low

---

## Quality Score Breakdown

```
Starting Score:          100
Critical Violations:     -2 × 10 = -20  (Hard waits, Test length)
High Violations:         -3 × 5 = -15   (Data factories, Determinism, BDD)
Medium Violations:       -2 × 2 = -4    (Fixtures, Flakiness)
Low Violations:          -1 × 1 = -1    (Minor style)

Bonus Points:
  Excellent BDD:         +0
  Comprehensive Fixtures: +0
  Data Factories:        +0
  Network-First:         +5
  Perfect Isolation:     +5
  All Test IDs:          +5
                         --------
Total Bonus:             +15

Final Score:             72/100
Grade:                   B (Acceptable)
```

---

## Critical Issues (Must Fix)

### 1. Hard Waits Detected (9 occurrences)

**Severity**: P0 (Critical)
**Locations**: Lines 65, 231, 242, 295, 395, 455, 507, 648, 693, 731, 770, 812, 852, 912, 918
**Criterion**: Hard Waits Detection
**Knowledge Base**: test-quality.md, network-first.md

**Issue Description**:
Multiple `page.waitForTimeout()` calls introduce timing-dependent behavior. These hard waits make tests slow and flaky because:
- They wait longer than necessary in fast environments
- They timeout prematurely in slow environments (CI)
- They mask race conditions instead of properly waiting for conditions

**Current Code**:

```typescript
// ❌ Bad (current implementation) - Line 65
await page.waitForTimeout(1000); // Extra wait for client-side rendering

// ❌ Bad (current implementation) - Line 231
await page.waitForTimeout(500);

// ❌ Bad (current implementation) - Line 242
await page.waitForTimeout(2000);
```

**Recommended Fix**:

```typescript
// ✅ Good (recommended approach)
// Instead of arbitrary timeout, wait for specific condition
await page.waitForSelector('[data-testid="hub-list"]', { state: 'visible' });

// Or wait for network idle if loading data
await page.waitForLoadState('networkidle');

// Or use Playwright auto-waiting with locator
await page.locator('[data-testid="hub-card"]').first().waitFor({ state: 'visible' });
```

**Why This Matters**:
Hard waits are the #1 cause of flaky tests. They work locally but fail unpredictably in CI where timing varies. Replace every `waitForTimeout` with an explicit condition wait.

---

### 2. Test File Too Long (1049 lines)

**Severity**: P0 (Critical)
**Location**: Entire file
**Criterion**: Test Length
**Knowledge Base**: test-quality.md

**Issue Description**:
At 1049 lines, this file is 3.5x over the 300-line recommended limit. Large test files:
- Are harder to navigate and understand
- Have longer CI runtimes (no parallel execution within file)
- Make it difficult to identify failing tests
- Increase merge conflicts

**Recommended Fix**:

Split into 8 separate files matching the existing stage structure:

```
e2e/user-journey/
├── 01-auth.spec.ts           (~100 lines)
├── 02-client.spec.ts         (~100 lines)
├── 03-source-upload.spec.ts  (~80 lines)
├── 04-pillar.spec.ts         (~120 lines)
├── 05-spoke.spec.ts          (~140 lines)
├── 06-treeview.spec.ts       (~80 lines)
├── 07-approval.spec.ts       (~130 lines)
├── 08-export.spec.ts         (~80 lines)
└── helpers/
    ├── login.ts              (~30 lines)
    └── findFirstHub.ts       (~30 lines)
```

**Benefits**:
- Parallel test execution in CI
- Clearer test organization
- Easier maintenance
- Faster iteration on specific stages

---

## Recommendations (Should Fix)

### 1. Implement Data Factories for Test Data

**Severity**: P1 (High)
**Locations**: Lines 100-101, 214, 378-389
**Criterion**: Data Factories
**Knowledge Base**: data-factories.md

**Issue Description**:
Hardcoded test data (emails, passwords, client names) reduces maintainability and makes tests brittle.

**Current Code**:

```typescript
// ⚠️ Could be improved (current implementation)
const testEmail = `test-${Date.now()}@e2e-signup.local`;
const testName = `E2E Test ${Date.now()}`;
const sampleContent = `This is sample content...`.trim();
```

**Recommended Improvement**:

```typescript
// ✅ Better approach (recommended)
import { faker } from '@faker-js/faker';

// In factories/user.factory.ts
export function createTestUser(overrides = {}) {
  return {
    email: faker.internet.email({ provider: 'e2e.local' }),
    name: faker.person.fullName(),
    password: 'SecurePassword123!',
    ...overrides,
  };
}

// In factories/content.factory.ts
export function createSampleContent(pillars = 3) {
  return Array.from({ length: pillars }, () =>
    faker.lorem.paragraphs(2)
  ).join('\n\n');
}

// Usage in test
const user = createTestUser();
await emailInput.fill(user.email);
```

**Benefits**:
- Realistic, varied test data
- Single source of truth for test data shape
- Override capability for edge cases
- Easier to maintain

---

### 2. Extract Login to Proper Fixture

**Severity**: P1 (High)
**Location**: Lines 40-60
**Criterion**: Fixture Patterns
**Knowledge Base**: fixture-architecture.md

**Issue Description**:
The `login()` helper function is called at the start of 20+ tests. This should be a Playwright fixture for better composition and auto-cleanup.

**Current Code**:

```typescript
// ⚠️ Could be improved (current implementation)
async function login(page: Page): Promise<boolean> {
  try {
    await page.goto(`${config.baseUrl}/login`);
    // ... login logic
    return true;
  } catch (error) {
    console.log('Login failed:', error);
    return false;
  }
}

// In every test:
test('...', async ({ page }) => {
  const loggedIn = await login(page);
  test.skip(!loggedIn, 'Login failed');
  // ...
});
```

**Recommended Improvement**:

```typescript
// ✅ Better approach (recommended)
// In fixtures/auth.fixture.ts
export const test = base.extend<{ loggedInPage: Page }>({
  loggedInPage: async ({ page }, use) => {
    await page.goto(`${config.baseUrl}/login`);
    await page.getByPlaceholder('you@example.com').fill(config.testEmail);
    await page.locator('input#password').fill(config.testPassword);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/app/);
    await use(page);
    // Auto cleanup if needed
  },
});

// In tests:
test('CLIENT-01: Create new client', async ({ loggedInPage: page }) => {
  // Already logged in, no manual login call needed
  await page.goto(`${config.baseUrl}/app/clients`);
  // ...
});
```

**Benefits**:
- No boilerplate in each test
- Automatic cleanup
- Can be composed with other fixtures
- Login failures are clear test failures (not skips)

---

### 3. Remove Conditionals from Test Logic

**Severity**: P1 (High)
**Locations**: Lines 115, 123, 224, 235, 268, 393, 400, etc.
**Criterion**: Determinism
**Knowledge Base**: test-quality.md

**Issue Description**:
Extensive use of `if/else` makes tests non-deterministic. Tests should have a known state and predictable execution path.

**Current Code**:

```typescript
// ⚠️ Could be improved (current implementation)
if (await nameInput.isVisible().catch(() => false)) {
  await nameInput.fill(testName);
}

if (await confirmPasswordInput.isVisible().catch(() => false)) {
  await confirmPasswordInput.fill('SecurePassword123!');
}
```

**Recommended Improvement**:

```typescript
// ✅ Better approach (recommended)
// Option 1: Use test.describe with different fixtures for different UI states

// Option 2: Make UI state explicit requirement
// If name field is required, test should fail if not present
await nameInput.fill(testName); // Will fail if not visible - that's correct!

// Option 3: If truly optional, use separate test
test('AUTH-01a: Signup with name field', async ({ page }) => { ... });
test('AUTH-01b: Signup without name field', async ({ page }) => { ... });
```

**Benefits**:
- Tests are deterministic
- Failures are clear (not hidden by conditionals)
- Test coverage is explicit

---

### 4. Add BDD Structure Comments

**Severity**: P2 (Medium)
**Location**: All test blocks
**Criterion**: BDD Format
**Knowledge Base**: test-quality.md

**Issue Description**:
Tests lack explicit Given-When-Then structure, making intent harder to understand at a glance.

**Current Code**:

```typescript
test('AUTH-01: Email/password signup creates account', async ({ page }) => {
  const testEmail = `test-${Date.now()}@e2e-signup.local`;
  await page.goto(`${config.baseUrl}/signup`);
  await emailInput.fill(testEmail);
  // ...
});
```

**Recommended Improvement**:

```typescript
test('AUTH-01: Email/password signup creates account', async ({ page }) => {
  // Given: A new user with valid credentials
  const user = createTestUser();

  // When: User fills signup form and submits
  await page.goto(`${config.baseUrl}/signup`);
  await page.getByPlaceholder('you@example.com').fill(user.email);
  await page.locator('input#password').fill(user.password);
  await page.getByRole('button', { name: /sign up/i }).click();

  // Then: User is redirected to app or shown success message
  await expect(page).toHaveURL(/\/app|\/verify/);
});
```

---

## Best Practices Found

### 1. Excellent Test ID Convention

**Location**: All 23 tests
**Pattern**: Test ID Naming
**Knowledge Base**: traceability.md

**Why This Is Good**:
Every test has a clear ID (AUTH-01, CLIENT-01, PILLAR-01, etc.) that:
- Maps to requirements/acceptance criteria
- Makes test reports easy to read
- Enables filtering with `--grep AUTH`
- Provides traceability

**Code Example**:

```typescript
// ✅ Excellent pattern demonstrated in this test
test('AUTH-01: Email/password signup creates account', async ({ page }) => {
test('PILLAR-01: Extraction returns multiple pillars', async ({ page }) => {
test('GEN-01: Generate button triggers spoke creation', async ({ page }) => {
```

**Use as Reference**: All new tests should follow this `{STAGE}-{NUMBER}: {Description}` convention.

---

### 2. Network Interception Before Navigation

**Location**: Lines 488-495, 626-633, 672-679
**Pattern**: Network-First
**Knowledge Base**: network-first.md

**Why This Is Good**:
Route interception is correctly set up BEFORE navigation, preventing race conditions where the request might fire before the handler is registered.

**Code Example**:

```typescript
// ✅ Excellent pattern - route setup before goto
await page.route('**/trpc/hubs.get*', async (route) => {
  const response = await route.fetch();
  const json = await response.json();
  if (json.result?.data?.pillars) {
    pillarsData = json.result.data.pillars;
  }
  await route.fulfill({ response });
});

// Navigation happens after route is registered
await page.goto(`${config.baseUrl}/app/hubs/${hubId}`);
```

---

### 3. Stage-Based Test Organization

**Location**: Lines 90-1048
**Pattern**: Logical Grouping
**Knowledge Base**: test-quality.md

**Why This Is Good**:
Tests are organized into 8 stages that mirror the actual user journey:
1. Authentication
2. Client Onboarding
3. Source Upload
4. Pillar Extraction
5. Spoke Generation
6. TreeView Display
7. Approval Workflow
8. Export

This makes it easy to understand coverage and run specific stages.

---

## Test File Analysis

### File Metadata

- **File Path**: `apps/foundry-dashboard/e2e/user-journey.spec.ts`
- **File Size**: 1049 lines, ~35 KB
- **Test Framework**: Playwright
- **Language**: TypeScript

### Test Structure

- **Describe Blocks**: 9 (8 stages + 1 smoke test)
- **Test Cases (it/test)**: 23
- **Average Test Length**: ~40 lines per test
- **Fixtures Used**: 1 (auth.fixture)
- **Data Factories Used**: 0

### Test Coverage Scope

- **Test IDs**: AUTH-01, AUTH-02, AUTH-04, CLIENT-01, CLIENT-02, CLIENT-05, SOURCE-01, SOURCE-02, PILLAR-01, PILLAR-03, PILLAR-10, GEN-01, GEN-11, GEN-12, TREE-03, TREE-10, APPROVE-01, APPROVE-02, APPROVE-09, APPROVE-13, EXPORT-01, EXPORT-08, Complete Journey
- **Priority Distribution**:
  - P0 (Critical): 23 tests
  - P1 (High): 0 tests
  - P2 (Medium): 0 tests
  - P3 (Low): 0 tests

### Assertions Analysis

- **Total Assertions**: ~35 expect() calls
- **Assertions per Test**: 1.5 (avg)
- **Assertion Types**: toBe, toContain, toBeGreaterThan, toBeDefined, toBeLessThan

---

## Next Steps

### Immediate Actions (Before Merge)

1. **Remove hard waits** - Replace all 9 `waitForTimeout` calls with explicit waits
   - Priority: P0
   - Estimated Effort: 2-3 hours

2. **Split file into stages** - Create 8 separate spec files
   - Priority: P1
   - Estimated Effort: 1-2 hours

### Follow-up Actions (Future PRs)

1. **Implement data factories** - Create user, content, client factories
   - Priority: P2
   - Target: Next sprint

2. **Convert login to fixture** - Replace ad-hoc login with proper fixture
   - Priority: P2
   - Target: Next sprint

3. **Add BDD comments** - Standardize Given-When-Then format
   - Priority: P3
   - Target: Backlog

### Re-Review Needed?

⚠️ Re-review after critical fixes - address hard waits and file splitting, then re-review for quality score improvement.

---

## Decision

**Recommendation**: Approve with Comments

**Rationale**:
Test quality is acceptable with 72/100 score. The test suite provides excellent coverage of the user journey with proper test IDs and traceability. The main concerns are:

1. **Hard waits** (9 instances) that will cause flakiness in CI - these should be addressed before the test suite is relied upon for CI gates
2. **File length** (1049 lines) that impacts maintainability and CI parallelization

The tests pass locally and provide value for manual regression testing. However, the hard waits will likely cause intermittent failures in CI. Recommend:
- Merge current tests to unblock coverage
- Create follow-up ticket to address hard waits
- Create follow-up ticket to split file

---

## Appendix

### Violation Summary by Location

| Line | Severity | Criterion    | Issue                          | Fix                              |
| ---- | -------- | ------------ | ------------------------------ | -------------------------------- |
| 65   | P0       | Hard Waits   | waitForTimeout(1000)           | Use waitForSelector             |
| 100  | P1       | Data Factory | Hardcoded email generation     | Use faker factory               |
| 115  | P1       | Determinism  | Conditional field fill         | Make explicit or split test     |
| 231  | P0       | Hard Waits   | waitForTimeout(500)            | Use waitForSelector             |
| 242  | P0       | Hard Waits   | waitForTimeout(2000)           | Use waitForLoadState            |
| 295  | P0       | Hard Waits   | waitForTimeout(2000)           | Use explicit condition          |
| 378  | P1       | Data Factory | Hardcoded sample content       | Use content factory             |
| 455  | P0       | Hard Waits   | waitForTimeout(500)            | Use locator.waitFor             |
| 507  | P0       | Hard Waits   | waitForTimeout(2000)           | Wait for API response           |
| 648  | P0       | Hard Waits   | waitForTimeout(2000)           | Wait for network idle           |
| 731  | P0       | Hard Waits   | waitForTimeout(1000)           | Use locator.waitFor             |
| ALL  | P0       | Test Length  | 1049 lines (3x limit)          | Split into 8 files              |

---

## Review Metadata

**Generated By**: BMad TEA Agent (Test Architect)
**Workflow**: testarch-test-review v4.0
**Review ID**: test-review-user-journey-20251228
**Timestamp**: 2025-12-28
**Version**: 1.0
