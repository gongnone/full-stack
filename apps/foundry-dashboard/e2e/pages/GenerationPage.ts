/**
 * Generation Page Object
 * Handles spoke generation progress and real-time updates
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class GenerationPage extends BasePage {
  // Generation controls
  readonly startGenerationButton: Locator;
  readonly pauseGenerationButton: Locator;
  readonly cancelGenerationButton: Locator;

  // Progress display
  readonly overallProgress: Locator;
  readonly progressBar: Locator;
  readonly spokeCounter: Locator;
  readonly timeElapsed: Locator;
  readonly etaDisplay: Locator;

  // Platform status
  readonly platformStatusList: Locator;
  readonly twitterStatus: Locator;
  readonly linkedinStatus: Locator;
  readonly tiktokStatus: Locator;
  readonly instagramStatus: Locator;
  readonly newsletterStatus: Locator;

  // WebSocket indicator
  readonly websocketStatus: Locator;
  readonly connectionIndicator: Locator;
  readonly reconnectingIndicator: Locator;

  // Generated spokes
  readonly spokeList: Locator;
  readonly spokeCards: Locator;
  readonly spokeContent: Locator;

  // Pillar progress
  readonly pillarProgressList: Locator;
  readonly pillarProgressItems: Locator;

  // Success/Complete state
  readonly generationComplete: Locator;
  readonly successAnimation: Locator;
  readonly viewSpokesButton: Locator;

  // Error state
  readonly generationError: Locator;
  readonly retryButton: Locator;

  constructor(page: Page) {
    super(page);

    // Generation controls
    this.startGenerationButton = page.locator('button:has-text("Start Generation"), button:has-text("Generate")');
    this.pauseGenerationButton = page.locator('button:has-text("Pause")');
    this.cancelGenerationButton = page.locator('button:has-text("Cancel Generation")');

    // Progress display
    this.overallProgress = page.locator('[data-testid="overall-progress"], .overall-progress');
    this.progressBar = page.locator('[data-testid="progress-bar"], [role="progressbar"], .progress-bar');
    this.spokeCounter = page.locator('[data-testid="spoke-counter"], text=/\\d+ of \\d+/i, text=/\\d+\\/\\d+/');
    this.timeElapsed = page.locator('[data-testid="time-elapsed"], text=/\\d+s|\\d+:\\d+/');
    this.etaDisplay = page.locator('[data-testid="eta"], text=/ETA|remaining/i');

    // Platform status
    this.platformStatusList = page.locator('[data-testid="platform-status"], .platform-status-list');
    this.twitterStatus = page.locator('[data-platform="twitter"], [data-platform="x"], text=/twitter|x/i');
    this.linkedinStatus = page.locator('[data-platform="linkedin"], text=/linkedin/i');
    this.tiktokStatus = page.locator('[data-platform="tiktok"], text=/tiktok/i');
    this.instagramStatus = page.locator('[data-platform="instagram"], text=/instagram/i');
    this.newsletterStatus = page.locator('[data-platform="newsletter"], text=/newsletter|email/i');

    // WebSocket indicator
    this.websocketStatus = page.locator('[data-testid="ws-status"], .websocket-status');
    this.connectionIndicator = page.locator('[data-testid="connected"], .connected-indicator');
    this.reconnectingIndicator = page.locator('[data-testid="reconnecting"], text=/reconnecting/i');

    // Generated spokes
    this.spokeList = page.locator('[data-testid="spoke-list"], .spoke-list');
    this.spokeCards = page.locator('[data-testid="spoke-card"], .spoke-card');
    this.spokeContent = page.locator('[data-testid="spoke-content"], .spoke-content');

    // Pillar progress
    this.pillarProgressList = page.locator('[data-testid="pillar-progress"], .pillar-progress-list');
    this.pillarProgressItems = page.locator('[data-testid="pillar-progress-item"], .pillar-progress-item');

    // Success/Complete state
    this.generationComplete = page.locator('[data-testid="generation-complete"], text=/complete|finished|done/i');
    this.successAnimation = page.locator('[data-testid="success-animation"], .success-animation, [class*="celebrate"]');
    this.viewSpokesButton = page.locator('button:has-text("View Spokes"), button:has-text("Review")');

    // Error state
    this.generationError = page.locator('[data-testid="generation-error"], .generation-error, text=/error|failed/i');
    this.retryButton = page.locator('button:has-text("Retry"), button:has-text("Try Again")');
  }

  async goto(hubId?: string): Promise<void> {
    if (hubId) {
      await this.page.goto(`/app/hubs/${hubId}/generate`);
    } else {
      await this.page.goto('/app/hubs');
    }
    await this.waitForLoad();
  }

  /**
   * Start spoke generation
   */
  async startGeneration(): Promise<void> {
    await this.startGenerationButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Wait for generation to complete (max 60 seconds per NFR-P3)
   */
  async waitForGenerationComplete(): Promise<number> {
    const startTime = Date.now();

    // Wait for completion indicator
    await this.generationComplete.waitFor({ state: 'visible', timeout: 60000 }).catch(async () => {
      // Fallback: check for progress bar at 100%
      await this.page.waitForFunction(
        () => {
          const progressBar = document.querySelector('[role="progressbar"]');
          const value = progressBar?.getAttribute('aria-valuenow');
          return value === '100';
        },
        { timeout: 60000 }
      );
    });

    return Date.now() - startTime;
  }

  /**
   * Check if generation is in progress
   */
  async isGenerating(): Promise<boolean> {
    const hasProgress = await this.isVisible(this.progressBar);
    const isComplete = await this.isVisible(this.generationComplete);
    return hasProgress && !isComplete;
  }

  /**
   * Get current progress percentage
   */
  async getProgressPercentage(): Promise<number> {
    const progressBar = this.progressBar;

    // Try aria-valuenow
    const ariaValue = await progressBar.getAttribute('aria-valuenow');
    if (ariaValue) {
      return parseInt(ariaValue, 10);
    }

    // Try style width
    const style = await progressBar.getAttribute('style');
    const widthMatch = style?.match(/width:\s*(\d+)%/);
    if (widthMatch) {
      return parseInt(widthMatch[1], 10);
    }

    return 0;
  }

  /**
   * Get spoke generation count
   */
  async getSpokeCount(): Promise<{ current: number; total: number }> {
    const text = await this.spokeCounter.textContent();
    const match = text?.match(/(\d+)\s*(?:of|\/)\s*(\d+)/i);
    if (match) {
      return {
        current: parseInt(match[1], 10),
        total: parseInt(match[2], 10),
      };
    }
    return { current: 0, total: 0 };
  }

  /**
   * Get platform generation status
   */
  async getPlatformStatus(platform: string): Promise<{ count: number; status: string }> {
    const platformLocator = this.page.locator(`[data-platform="${platform}"], text=/${platform}/i`);

    if (!(await platformLocator.isVisible().catch(() => false))) {
      return { count: 0, status: 'unknown' };
    }

    const text = await platformLocator.textContent();
    const countMatch = text?.match(/(\d+)/);
    const hasCheck = await platformLocator.locator('svg.check, [data-complete="true"]').isVisible().catch(() => false);

    return {
      count: countMatch ? parseInt(countMatch[1], 10) : 0,
      status: hasCheck ? 'complete' : 'in-progress',
    };
  }

  /**
   * Check WebSocket connection status
   */
  async isWebSocketConnected(): Promise<boolean> {
    return this.isVisible(this.connectionIndicator);
  }

  /**
   * Check if reconnecting
   */
  async isReconnecting(): Promise<boolean> {
    return this.isVisible(this.reconnectingIndicator);
  }

  /**
   * Get number of generated spoke cards visible
   */
  async getVisibleSpokeCount(): Promise<number> {
    const cards = await this.spokeCards.all();
    return cards.length;
  }

  /**
   * Check if generation had errors
   */
  async hasErrors(): Promise<boolean> {
    return this.isVisible(this.generationError);
  }

  /**
   * Retry failed generation
   */
  async retryGeneration(): Promise<void> {
    await this.retryButton.click();
    await this.waitForLoad();
  }

  /**
   * Navigate to view generated spokes
   */
  async viewSpokes(): Promise<void> {
    await this.viewSpokesButton.click();
    await this.waitForLoad();
  }

  /**
   * Measure generation time
   */
  async measureGenerationTime(): Promise<number> {
    await this.startGeneration();
    return this.waitForGenerationComplete();
  }

  /**
   * Get elapsed time
   */
  async getElapsedTime(): Promise<number> {
    const text = await this.timeElapsed.textContent();

    // Parse "30s" format
    const secondsMatch = text?.match(/(\d+)s/);
    if (secondsMatch) {
      return parseInt(secondsMatch[1], 10);
    }

    // Parse "1:30" format
    const minSecMatch = text?.match(/(\d+):(\d+)/);
    if (minSecMatch) {
      return parseInt(minSecMatch[1], 10) * 60 + parseInt(minSecMatch[2], 10);
    }

    return 0;
  }
}
