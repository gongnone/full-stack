/**
 * Report Page Object
 * Handles Executive Producer Report display and actions
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ReportPage extends BasePage {
  // Report metrics
  readonly reportContainer: Locator;
  readonly timeSaved: Locator;
  readonly dollarValue: Locator;
  readonly itemsReviewed: Locator;
  readonly approvedCount: Locator;
  readonly killedCount: Locator;
  readonly zeroEditRate: Locator;
  readonly avgDecisionTime: Locator;

  // Action buttons
  readonly exportCalendarButton: Locator;
  readonly shareLinksButton: Locator;
  readonly reviewConflictsButton: Locator;
  readonly dashboardButton: Locator;

  // Batch complete state
  readonly batchCompleteIndicator: Locator;

  constructor(page: Page) {
    super(page);

    // Report container
    this.reportContainer = page.locator('[data-testid="executive-report"], .executive-report, [class*="report"]');

    // Metrics (large 64px display for key metrics)
    this.timeSaved = page.locator('[data-testid="time-saved"], text=/hours? saved/i');
    this.dollarValue = page.locator('[data-testid="dollar-value"], text=/\\$\\d+/');
    this.itemsReviewed = page.locator('[data-testid="items-reviewed"], text=/\\d+ items?/i');
    this.approvedCount = page.locator('[data-testid="approved-count"], text=/\\d+ approved/i');
    this.killedCount = page.locator('[data-testid="killed-count"], text=/\\d+ killed/i');
    this.zeroEditRate = page.locator('[data-testid="zero-edit-rate"], text=/zero.edit/i');
    this.avgDecisionTime = page.locator('[data-testid="avg-decision-time"], text=/\\d+\\.?\\d*s/i');

    // Action buttons
    this.exportCalendarButton = page.locator('button:has-text("Export Calendar"), a:has-text("Export Calendar")');
    this.shareLinksButton = page.locator('button:has-text("Share Links"), a:has-text("Share Links")');
    this.reviewConflictsButton = page.locator('button:has-text("Review Conflicts"), a:has-text("Review Conflicts")');
    this.dashboardButton = page.locator('button:has-text("Dashboard"), a:has-text("Dashboard")');

    // Batch complete indicator
    this.batchCompleteIndicator = page.locator('[data-testid="batch-complete"], text=/batch complete|sprint complete/i');
  }

  async goto(): Promise<void> {
    await this.page.goto('/app/report');
    await this.waitForLoad();
  }

  /**
   * Check if report is visible
   */
  async isReportVisible(): Promise<boolean> {
    return this.isVisible(this.reportContainer);
  }

  /**
   * Get time saved value
   */
  async getTimeSaved(): Promise<string> {
    const text = await this.timeSaved.textContent();
    return text?.trim() ?? '';
  }

  /**
   * Get dollar value
   */
  async getDollarValue(): Promise<string> {
    const text = await this.dollarValue.textContent();
    return text?.trim() ?? '';
  }

  /**
   * Get items reviewed count
   */
  async getItemsReviewed(): Promise<number> {
    const text = await this.itemsReviewed.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get approved count and percentage
   */
  async getApprovedStats(): Promise<{ count: number; percentage?: number }> {
    const text = await this.approvedCount.textContent();
    const countMatch = text?.match(/(\d+)/);
    const percentMatch = text?.match(/(\d+)%/);
    return {
      count: countMatch ? parseInt(countMatch[1], 10) : 0,
      percentage: percentMatch ? parseInt(percentMatch[1], 10) : undefined,
    };
  }

  /**
   * Get killed count and percentage
   */
  async getKilledStats(): Promise<{ count: number; percentage?: number }> {
    const text = await this.killedCount.textContent();
    const countMatch = text?.match(/(\d+)/);
    const percentMatch = text?.match(/(\d+)%/);
    return {
      count: countMatch ? parseInt(countMatch[1], 10) : 0,
      percentage: percentMatch ? parseInt(percentMatch[1], 10) : undefined,
    };
  }

  /**
   * Get zero-edit rate
   */
  async getZeroEditRate(): Promise<string> {
    const text = await this.zeroEditRate.textContent();
    return text?.trim() ?? '';
  }

  /**
   * Get average decision time in seconds
   */
  async getAvgDecisionTime(): Promise<number> {
    const text = await this.avgDecisionTime.textContent();
    const match = text?.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Click Export Calendar
   */
  async exportCalendar(): Promise<void> {
    await this.exportCalendarButton.click();
    await this.waitForLoad();
  }

  /**
   * Click Share Links
   */
  async shareLinks(): Promise<void> {
    await this.shareLinksButton.click();
    await this.waitForLoad();
  }

  /**
   * Click Review Conflicts
   */
  async reviewConflicts(): Promise<void> {
    await this.reviewConflictsButton.click();
    await this.waitForLoad();
  }

  /**
   * Return to Dashboard
   */
  async returnToDashboard(): Promise<void> {
    await this.dashboardButton.click();
    await this.waitForLoad();
  }

  /**
   * Check if batch is complete
   */
  async isBatchComplete(): Promise<boolean> {
    return this.isVisible(this.batchCompleteIndicator);
  }

  /**
   * Get all visible action buttons
   */
  async getAvailableActions(): Promise<string[]> {
    const actions: string[] = [];

    if (await this.isVisible(this.exportCalendarButton)) actions.push('Export Calendar');
    if (await this.isVisible(this.shareLinksButton)) actions.push('Share Links');
    if (await this.isVisible(this.reviewConflictsButton)) actions.push('Review Conflicts');
    if (await this.isVisible(this.dashboardButton)) actions.push('Dashboard');

    return actions;
  }
}
