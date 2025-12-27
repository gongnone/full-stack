/**
 * Base Page Object
 * Common functionality shared across all page objects
 */

import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to this page's URL
   */
  abstract goto(): Promise<void>;

  /**
   * Wait for page to be fully loaded
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    // Wait for any loading spinners to disappear
    const spinner = this.page.locator('.animate-spin, [data-loading="true"]');
    await spinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  /**
   * Check if element is visible with timeout
   */
  async isVisible(locator: Locator, timeout = 5000): Promise<boolean> {
    return locator.isVisible({ timeout }).catch(() => false);
  }

  /**
   * Take screenshot with descriptive name
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }

  /**
   * Get current URL
   */
  get url(): string {
    return this.page.url();
  }

  /**
   * Check for console errors
   */
  async hasNoConsoleErrors(): Promise<boolean> {
    const errors: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await this.page.waitForTimeout(500);
    return errors.length === 0;
  }
}
