/**
 * Extraction Page Object
 * Handles thematic extraction and pillar configuration
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ExtractionPage extends BasePage {
  // Processing status
  readonly processingIndicator: Locator;
  readonly processingStage: Locator;
  readonly processingProgress: Locator;

  // Processing stages
  readonly parsingStage: Locator;
  readonly themeDetectionStage: Locator;
  readonly claimExtractionStage: Locator;
  readonly pillarGenerationStage: Locator;

  // Pillar list
  readonly pillarList: Locator;
  readonly pillarItems: Locator;
  readonly pillarCount: Locator;

  // Pillar item elements
  readonly pillarTitle: Locator;
  readonly pillarClaim: Locator;
  readonly pillarAngle: Locator;
  readonly pillarSpokeCount: Locator;
  readonly modifiedBadge: Locator;
  readonly manualBadge: Locator;

  // Pillar actions
  readonly removePillarButton: Locator;
  readonly addPillarButton: Locator;
  readonly editPillarButton: Locator;

  // Confirmation modal
  readonly confirmationModal: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  // Navigation
  readonly createHubButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);

    // Processing status
    this.processingIndicator = page.locator('[data-testid="processing"], .processing-indicator, .extraction-progress');
    this.processingStage = page.locator('[data-testid="processing-stage"], .processing-stage');
    this.processingProgress = page.locator('[data-testid="processing-progress"], [role="progressbar"]');

    // Processing stages
    this.parsingStage = page.locator('text=/parsing|processing document/i');
    this.themeDetectionStage = page.locator('text=/identifying themes|theme detection/i');
    this.claimExtractionStage = page.locator('text=/extracting claims/i');
    this.pillarGenerationStage = page.locator('text=/generating pillars/i');

    // Pillar list
    this.pillarList = page.locator('[data-testid="pillar-list"], .pillar-list');
    this.pillarItems = page.locator('[data-testid="pillar-item"], .pillar-item, .pillar-card');
    this.pillarCount = page.locator('[data-testid="pillar-count"], text=/\\d+ pillars?/i');

    // Pillar item elements (relative selectors, use with .nth())
    this.pillarTitle = page.locator('[data-testid="pillar-title"], input[name*="title"], .pillar-title');
    this.pillarClaim = page.locator('[data-testid="pillar-claim"], input[name*="claim"], textarea[name*="claim"], .pillar-claim');
    this.pillarAngle = page.locator('[data-testid="pillar-angle"], input[name*="angle"], .pillar-angle');
    this.pillarSpokeCount = page.locator('[data-testid="spoke-count"], .spoke-count');
    this.modifiedBadge = page.locator('[data-testid="modified-badge"], .modified-badge, text=Modified');
    this.manualBadge = page.locator('[data-testid="manual-badge"], .manual-badge, text=Manual');

    // Pillar actions
    this.removePillarButton = page.locator('button[data-action="remove"], button:has-text("Remove"), button[aria-label*="remove" i]');
    this.addPillarButton = page.locator('button:has-text("Add Pillar"), button:has-text("Add New")');
    this.editPillarButton = page.locator('button[data-action="edit"], button:has-text("Edit")');

    // Confirmation modal
    this.confirmationModal = page.locator('[role="dialog"], [data-testid="confirm-modal"]');
    this.confirmButton = page.locator('[role="dialog"] button:has-text("Confirm"), [role="dialog"] button:has-text("Yes")');
    this.cancelButton = page.locator('[role="dialog"] button:has-text("Cancel"), [role="dialog"] button:has-text("No")');

    // Navigation
    this.createHubButton = page.locator('button:has-text("Create Hub")');
    this.backButton = page.locator('button:has-text("Back")');
  }

  async goto(): Promise<void> {
    await this.page.goto('/app/hubs/new/extract');
    await this.waitForLoad();
  }

  /**
   * Wait for extraction to complete (max 30 seconds per NFR-P2)
   */
  async waitForExtraction(): Promise<number> {
    const startTime = Date.now();

    // Wait for processing to start
    await this.processingIndicator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    // Wait for pillars to appear
    await this.pillarItems.first().waitFor({ state: 'visible', timeout: 30000 });

    return Date.now() - startTime;
  }

  /**
   * Check if extraction is in progress
   */
  async isExtracting(): Promise<boolean> {
    return this.isVisible(this.processingIndicator);
  }

  /**
   * Get current processing stage
   */
  async getCurrentStage(): Promise<string> {
    const text = await this.processingStage.textContent();
    return text?.trim() ?? '';
  }

  /**
   * Get number of extracted pillars
   */
  async getPillarCount(): Promise<number> {
    const pillars = await this.pillarItems.all();
    return pillars.length;
  }

  /**
   * Get pillar data by index
   */
  async getPillarData(index: number): Promise<{
    title: string;
    claim: string;
    angle: string;
    isModified: boolean;
    isManual: boolean;
  }> {
    const pillar = this.pillarItems.nth(index);

    const title = await pillar.locator('[data-testid="pillar-title"], .pillar-title, input[name*="title"]').inputValue().catch(() =>
      pillar.locator('[data-testid="pillar-title"], .pillar-title, h3, h4').textContent()
    );

    const claim = await pillar.locator('[data-testid="pillar-claim"], .pillar-claim, textarea[name*="claim"]').inputValue().catch(() =>
      pillar.locator('[data-testid="pillar-claim"], .pillar-claim').textContent()
    );

    const angle = await pillar.locator('[data-testid="pillar-angle"], .pillar-angle').textContent().catch(() => '');

    const isModified = await pillar.locator('.modified-badge, text=Modified').isVisible().catch(() => false);
    const isManual = await pillar.locator('.manual-badge, text=Manual').isVisible().catch(() => false);

    return {
      title: (title ?? '').trim(),
      claim: (claim ?? '').trim(),
      angle: (angle ?? '').trim(),
      isModified,
      isManual,
    };
  }

  /**
   * Edit pillar title
   */
  async editPillarTitle(index: number, newTitle: string): Promise<void> {
    const pillar = this.pillarItems.nth(index);
    const titleInput = pillar.locator('[data-testid="pillar-title"], input[name*="title"]');

    // Click to focus
    await titleInput.click();
    // Clear and fill
    await titleInput.fill(newTitle);
    // Blur to trigger save
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(300);
  }

  /**
   * Edit pillar claim
   */
  async editPillarClaim(index: number, newClaim: string): Promise<void> {
    const pillar = this.pillarItems.nth(index);
    const claimInput = pillar.locator('[data-testid="pillar-claim"], textarea[name*="claim"], input[name*="claim"]');

    await claimInput.click();
    await claimInput.fill(newClaim);
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(300);
  }

  /**
   * Remove a pillar
   */
  async removePillar(index: number): Promise<void> {
    const pillar = this.pillarItems.nth(index);
    const removeBtn = pillar.locator('button[data-action="remove"], button:has-text("Remove"), button[aria-label*="remove" i]');

    await removeBtn.click();

    // Confirm if modal appears
    if (await this.isVisible(this.confirmationModal)) {
      await this.confirmButton.click();
    }

    await this.waitForLoad();
  }

  /**
   * Add a new custom pillar
   */
  async addCustomPillar(data: { title: string; claim: string; angle?: string }): Promise<void> {
    await this.addPillarButton.click();
    await this.page.waitForTimeout(300);

    // Fill the new pillar form (assumes it's the last one)
    const count = await this.getPillarCount();
    const newPillar = this.pillarItems.nth(count - 1);

    const titleInput = newPillar.locator('[data-testid="pillar-title"], input[name*="title"]');
    const claimInput = newPillar.locator('[data-testid="pillar-claim"], textarea[name*="claim"], input[name*="claim"]');

    await titleInput.fill(data.title);
    await claimInput.fill(data.claim);

    if (data.angle) {
      const angleInput = newPillar.locator('[data-testid="pillar-angle"], input[name*="angle"]');
      if (await angleInput.isVisible().catch(() => false)) {
        await angleInput.fill(data.angle);
      }
    }

    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(300);
  }

  /**
   * Check if any pillar has modified badge
   */
  async hasModifiedPillars(): Promise<boolean> {
    return this.isVisible(this.modifiedBadge);
  }

  /**
   * Create the Hub with current pillars
   */
  async createHub(): Promise<void> {
    await this.createHubButton.click();
    await this.waitForLoad();
  }

  /**
   * Measure extraction time
   */
  async measureExtractionTime(): Promise<number> {
    return this.waitForExtraction();
  }
}
