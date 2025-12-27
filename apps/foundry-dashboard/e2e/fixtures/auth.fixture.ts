/**
 * Authentication Fixture
 * Provides authenticated page context for E2E tests
 *
 * Usage:
 *   import { test, expect } from '../fixtures/auth.fixture';
 *   test('my authenticated test', async ({ authenticatedPage, dashboardPage }) => {
 *     // Already logged in, page objects ready to use
 *   });
 */

import { test as base, expect, Page, BrowserContext } from '@playwright/test';
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

// Configuration
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  testEmail: process.env.TEST_EMAIL || 'e2e-test@foundry.local',
  testPassword: process.env.TEST_PASSWORD || 'TestPassword123!',
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
 * Extended test with authentication and page objects
 */
export const test = base.extend<AuthFixtures>({
  // Authenticated page fixture - logs in before each test
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login
    await page.goto(`${config.baseUrl}/login`);

    // Fill login form
    await page.fill('#email, input[type="email"]', config.testEmail);
    await page.fill('#password, input[type="password"]', config.testPassword);
    await page.click('button[type="submit"]');

    // Wait for successful login
    try {
      await page.waitForURL(/\/app/, { timeout: 30000 });
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
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

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
