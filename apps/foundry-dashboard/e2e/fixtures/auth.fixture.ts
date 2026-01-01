/**
 * Authentication Fixture
 * Provides authenticated page context for E2E tests
 *
 * Usage:
 *   import { test, expect } from '../fixtures/auth.fixture';
 *   test('my authenticated test', async ({ authenticatedPage, dashboardPage }) => {
 *     // Already logged in, page objects ready to use
 *   });
 *
 * Features:
 *   - Session persistence via storage state (avoids re-login per test)
 *   - Per-worker isolation (prevents parallel shard conflicts)
 *   - Automatic session recovery on failure
 */

import { test as base, expect, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { DashboardPage } from '../pages/DashboardPage';
import { ClientPage } from '../pages/ClientPage';
import { BrandDnaPage } from '../pages/BrandDnaPage';
import { HubPage } from '../pages/HubPage';
import { ReviewPage } from '../pages/ReviewPage';
import { ReportPage } from '../pages/ReportPage';
import { SourceIngestionPage } from '../pages/SourceIngestionPage';
import { ExtractionPage } from '../pages/ExtractionPage';
import { GenerationPage } from '../pages/GenerationPage';
import { QualityGatesPage } from '../pages/QualityGatesPage';
import { CreativeConflictsPage } from '../pages/CreativeConflictsPage';

/**
 * Get per-worker test credentials
 * Each parallel worker gets its own test user to prevent session conflicts
 *
 * Worker 0 → E2E_TEST_EMAIL_1 / E2E_TEST_PASSWORD_1 (or fallback to E2E_TEST_EMAIL)
 * Worker 1 → E2E_TEST_EMAIL_2 / E2E_TEST_PASSWORD_2
 * Worker 2 → E2E_TEST_EMAIL_3 / E2E_TEST_PASSWORD_3
 * Worker 3 → E2E_TEST_EMAIL_4 / E2E_TEST_PASSWORD_4
 */
const getWorkerCredentials = (): { email: string; password: string } => {
  const workerIndex = parseInt(process.env.TEST_PARALLEL_INDEX || '0', 10);
  const shardNum = workerIndex + 1; // 1-indexed for secrets naming

  // Try shard-specific credentials first
  const shardEmail = process.env[`E2E_TEST_EMAIL_${shardNum}`];
  const shardPassword = process.env[`E2E_TEST_PASSWORD_${shardNum}`];

  if (shardEmail && shardPassword) {
    return { email: shardEmail, password: shardPassword };
  }

  // Fallback to single test user (backwards compatible)
  return {
    email: process.env.TEST_EMAIL || 'e2e-test@foundry.local',
    password: process.env.TEST_PASSWORD || 'TestPassword123!',
  };
};

// Configuration
const getConfig = () => {
  const credentials = getWorkerCredentials();
  return {
    baseUrl: process.env.BASE_URL || 'http://localhost:5173',
    testEmail: credentials.email,
    testPassword: credentials.password,
  };
};

// Per-worker storage state file to prevent parallel login conflicts
const getStorageStatePath = (): string => {
  const workerIndex = process.env.TEST_PARALLEL_INDEX || '0';
  const storageDir = path.join(process.cwd(), '.auth');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  return path.join(storageDir, `storage-state-${workerIndex}.json`);
};

// Check if storage state exists and is valid (not expired)
const isStorageStateValid = (storagePath: string): boolean => {
  if (!fs.existsSync(storagePath)) return false;
  try {
    const stat = fs.statSync(storagePath);
    // Storage state expires after 30 minutes
    const maxAge = 30 * 60 * 1000;
    return Date.now() - stat.mtimeMs < maxAge;
  } catch {
    return false;
  }
};

// Fixture types
type AuthFixtures = {
  authenticatedPage: Page;
  dashboardPage: DashboardPage;
  clientPage: ClientPage;
  brandDnaPage: BrandDnaPage;
  hubPage: HubPage;
  reviewPage: ReviewPage;
  reportPage: ReportPage;
  // AI Generation journey pages
  sourceIngestionPage: SourceIngestionPage;
  extractionPage: ExtractionPage;
  generationPage: GenerationPage;
  qualityGatesPage: QualityGatesPage;
  creativeConflictsPage: CreativeConflictsPage;
};

/**
 * Perform login and save storage state for session reuse
 */
async function performLogin(page: Page, context: BrowserContext, storagePath: string): Promise<void> {
  const config = getConfig();

  // Navigate to login
  await page.goto(`${config.baseUrl}/login`);

  // Wait for login form to be visible
  await page.waitForLoadState('domcontentloaded');

  // Fill login form using placeholder-based selectors (most reliable cross-browser)
  const emailInput = page.getByPlaceholder('you@example.com');
  const passwordInput = page.getByPlaceholder('••••••••');
  const signInButton = page.getByRole('button', { name: 'Sign in' });

  await emailInput.waitFor({ state: 'visible', timeout: 15000 });
  await emailInput.fill(config.testEmail);
  await passwordInput.fill(config.testPassword);
  await signInButton.click();

  // Wait for successful login with increased timeout for CI
  try {
    await page.waitForURL(/\/app/, { timeout: 45000 });
  } catch {
    // Check for error message
    const error = await page.locator('text=/invalid|error/i').isVisible().catch(() => false);
    if (error) {
      throw new Error(
        'E2E Auth Fixture: Login failed. Ensure test user exists.\n' +
        'Run: npx tsx scripts/create-e2e-user.ts'
      );
    }
    throw new Error('E2E Auth Fixture: Login timeout');
  }

  // Wait for page to stabilize
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

  // Save storage state for reuse in subsequent tests
  await context.storageState({ path: storagePath });
}

/**
 * Extended test with authentication and page objects
 */
export const test = base.extend<AuthFixtures>({
  // Authenticated page fixture - reuses session via storage state
  authenticatedPage: async ({ page, context }, use) => {
    const storagePath = getStorageStatePath();
    const config = getConfig();

    // Try to reuse existing session
    if (isStorageStateValid(storagePath)) {
      try {
        // Load saved storage state
        const storageState = JSON.parse(fs.readFileSync(storagePath, 'utf-8'));
        await context.addCookies(storageState.cookies || []);

        // Navigate to app and verify session is valid
        await page.goto(`${config.baseUrl}/app`);
        await page.waitForLoadState('domcontentloaded');

        // Check if we're still authenticated (not redirected to login)
        const currentUrl = page.url();
        if (!currentUrl.includes('/login') && !currentUrl.includes('/signup')) {
          await use(page);
          return;
        }
        // Session expired, fall through to fresh login
      } catch {
        // Storage state invalid, fall through to fresh login
      }
    }

    // Perform fresh login
    await performLogin(page, context, storagePath);

    // Double-check we're on an authenticated page
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/signup')) {
      throw new Error(`E2E Auth Fixture: Session not persisted. Current URL: ${currentUrl}`);
    }

    await use(page);
  },

  // Page object fixtures
  dashboardPage: async ({ authenticatedPage }, use) => {
    await use(new DashboardPage(authenticatedPage));
  },

  clientPage: async ({ authenticatedPage }, use) => {
    await use(new ClientPage(authenticatedPage));
  },

  brandDnaPage: async ({ authenticatedPage }, use) => {
    await use(new BrandDnaPage(authenticatedPage));
  },

  hubPage: async ({ authenticatedPage }, use) => {
    await use(new HubPage(authenticatedPage));
  },

  reviewPage: async ({ authenticatedPage }, use) => {
    await use(new ReviewPage(authenticatedPage));
  },

  reportPage: async ({ authenticatedPage }, use) => {
    await use(new ReportPage(authenticatedPage));
  },

  // AI Generation journey page objects
  sourceIngestionPage: async ({ authenticatedPage }, use) => {
    await use(new SourceIngestionPage(authenticatedPage));
  },

  extractionPage: async ({ authenticatedPage }, use) => {
    await use(new ExtractionPage(authenticatedPage));
  },

  generationPage: async ({ authenticatedPage }, use) => {
    await use(new GenerationPage(authenticatedPage));
  },

  qualityGatesPage: async ({ authenticatedPage }, use) => {
    await use(new QualityGatesPage(authenticatedPage));
  },

  creativeConflictsPage: async ({ authenticatedPage }, use) => {
    await use(new CreativeConflictsPage(authenticatedPage));
  },
});

export { expect };

/**
 * Helper to get authentication cookies for API requests
 */
export async function getAuthCookies(context: BrowserContext): Promise<string> {
  const cookies = await context.cookies();
  return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}

/**
 * Helper to create a unique test identifier
 */
export function uniqueTestId(prefix = 'e2e'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
