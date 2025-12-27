/**
 * Review Page Object
 * Handles Sprint Mode review, keyboard shortcuts, and content actions
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ReviewPage extends BasePage {
  // Sprint mode
  readonly startSprintButton: Locator;
  readonly sprintModeIndicator: Locator;
  readonly sprintCounter: Locator;

  // Content card (Signal Header)
  readonly contentCard: Locator;
  readonly g2Score: Locator;
  readonly g7Score: Locator;
  readonly contextBar: Locator;
  readonly contentPreview: Locator;
  readonly g4Badge: Locator;
  readonly g5Badge: Locator;

  // Action buttons
  readonly killButton: Locator;
  readonly editButton: Locator;
  readonly approveButton: Locator;

  // Flash animations
  readonly greenFlash: Locator;
  readonly redFlash: Locator;
  readonly yellowFlash: Locator;

  // Hub Kill modal
  readonly hubKillModal: Locator;
  readonly hubKillTitle: Locator;
  readonly spokeCountWarning: Locator;
  readonly confirmKillButton: Locator;
  readonly cancelKillButton: Locator;
  readonly undoToast: Locator;

  // Creative Conflicts
  readonly creativeConflictsBucket: Locator;
  readonly forceApproveButton: Locator;
  readonly quickEditButton: Locator;
  readonly voiceCalibrateButton: Locator;
  readonly permanentKillButton: Locator;

  // Buckets
  readonly highConfidenceBucket: Locator;
  readonly mediumConfidenceBucket: Locator;
  readonly lowConfidenceBucket: Locator;

  constructor(page: Page) {
    super(page);

    // Sprint mode elements
    this.startSprintButton = page.locator('button:has-text("Start Sprint"), button:has-text("Begin Sprint")');
    this.sprintModeIndicator = page.locator('[data-testid="sprint-mode"], .sprint-mode-active');
    this.sprintCounter = page.locator('[data-testid="sprint-counter"], text=/\\d+ \\/ \\d+/');

    // Content card with Signal Header
    this.contentCard = page.locator('[data-testid="content-card"], .content-card, .spoke-card');
    this.g2Score = page.locator('[data-testid="g2-score"], .g2-score');
    this.g7Score = page.locator('[data-testid="g7-score"], .g7-score');
    this.contextBar = page.locator('[data-testid="context-bar"], .context-bar');
    this.contentPreview = page.locator('[data-testid="content-preview"], .content-preview, .spoke-content');
    this.g4Badge = page.locator('[data-testid="g4-badge"], .g4-badge');
    this.g5Badge = page.locator('[data-testid="g5-badge"], .g5-badge');

    // Action buttons
    this.killButton = page.locator('button:has-text("Kill"), button[data-action="kill"]');
    this.editButton = page.locator('button:has-text("Edit"), button[data-action="edit"]');
    this.approveButton = page.locator('button:has-text("Approve"), button[data-action="approve"]');

    // Flash animations
    this.greenFlash = page.locator('.green-flash, [data-flash="approve"]');
    this.redFlash = page.locator('.red-flash, [data-flash="kill"]');
    this.yellowFlash = page.locator('.yellow-flash, [data-flash="skip"]');

    // Hub Kill modal
    this.hubKillModal = page.locator('[data-testid="hub-kill-modal"], [role="dialog"]:has-text("Kill")');
    this.hubKillTitle = page.locator('[data-testid="hub-kill-title"], .hub-kill-title');
    this.spokeCountWarning = page.locator('[data-testid="spoke-count-warning"], text=/\\d+ spokes?/i');
    this.confirmKillButton = page.locator('button:has-text("Confirm Kill"), button:has-text("Kill Hub")');
    this.cancelKillButton = page.locator('[role="dialog"] button:has-text("Cancel")');
    this.undoToast = page.locator('[data-testid="undo-toast"], .undo-toast, text=/undo/i');

    // Creative Conflicts
    this.creativeConflictsBucket = page.locator('[data-testid="creative-conflicts"], text=Creative Conflicts');
    this.forceApproveButton = page.locator('button:has-text("Force Approve")');
    this.quickEditButton = page.locator('button:has-text("Quick Edit")');
    this.voiceCalibrateButton = page.locator('button:has-text("Voice Calibrate")');
    this.permanentKillButton = page.locator('button:has-text("Kill"):not(:has-text("Hub"))');

    // Confidence buckets
    this.highConfidenceBucket = page.locator('[data-testid="high-confidence"], text=High Confidence');
    this.mediumConfidenceBucket = page.locator('[data-testid="medium-confidence"], text=Medium Confidence');
    this.lowConfidenceBucket = page.locator('[data-testid="low-confidence"], text=Low Confidence');
  }

  async goto(): Promise<void> {
    await this.page.goto('/app/review');
    await this.waitForLoad();
  }

  /**
   * Enter Sprint Mode
   */
  async startSprint(): Promise<void> {
    await this.startSprintButton.click();
    await this.waitForLoad();
  }

  /**
   * Check if in Sprint Mode
   */
  async isInSprintMode(): Promise<boolean> {
    return this.isVisible(this.sprintModeIndicator) || this.isVisible(this.contentCard);
  }

  /**
   * Approve current content using keyboard (Right Arrow)
   */
  async approveWithKeyboard(): Promise<void> {
    await this.page.keyboard.press('ArrowRight');
    await this.page.waitForTimeout(250); // Wait for animation
  }

  /**
   * Kill current content using keyboard (Left Arrow)
   */
  async killWithKeyboard(): Promise<void> {
    await this.page.keyboard.press('ArrowLeft');
    await this.page.waitForTimeout(250);
  }

  /**
   * Skip current content using keyboard (Space)
   */
  async skipWithKeyboard(): Promise<void> {
    await this.page.keyboard.press('Space');
    await this.page.waitForTimeout(250);
  }

  /**
   * Trigger Hub Kill by holding H for 500ms
   */
  async triggerHubKill(): Promise<void> {
    await this.page.keyboard.down('h');
    await this.page.waitForTimeout(550);
    await this.page.keyboard.up('h');
    await this.page.waitForTimeout(300);
  }

  /**
   * Confirm Hub Kill
   */
  async confirmHubKill(): Promise<void> {
    await this.confirmKillButton.click();
    await this.waitForLoad();
  }

  /**
   * Cancel Hub Kill
   */
  async cancelHubKill(): Promise<void> {
    await this.cancelKillButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Check if Hub Kill modal is visible
   */
  async isHubKillModalVisible(): Promise<boolean> {
    return this.isVisible(this.hubKillModal);
  }

  /**
   * Check if undo toast is visible
   */
  async isUndoToastVisible(): Promise<boolean> {
    return this.isVisible(this.undoToast);
  }

  /**
   * Click undo in toast
   */
  async clickUndo(): Promise<void> {
    await this.undoToast.locator('button:has-text("Undo")').click();
    await this.waitForLoad();
  }

  /**
   * Get current sprint progress
   */
  async getSprintProgress(): Promise<{ current: number; total: number }> {
    const text = await this.sprintCounter.textContent();
    const match = text?.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      return { current: parseInt(match[1], 10), total: parseInt(match[2], 10) };
    }
    return { current: 0, total: 0 };
  }

  /**
   * Get G2 score from current content card
   */
  async getG2Score(): Promise<number> {
    const text = await this.g2Score.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get G7 score from current content card
   */
  async getG7Score(): Promise<number> {
    const text = await this.g7Score.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Check if G4 gate passed
   */
  async isG4Passed(): Promise<boolean> {
    const badge = this.g4Badge;
    const text = await badge.textContent();
    return text?.toLowerCase().includes('pass') ?? false;
  }

  /**
   * Check if G5 gate passed
   */
  async isG5Passed(): Promise<boolean> {
    const badge = this.g5Badge;
    const text = await badge.textContent();
    return text?.toLowerCase().includes('pass') ?? false;
  }

  /**
   * Navigate to Creative Conflicts
   */
  async navigateToCreativeConflicts(): Promise<void> {
    await this.page.goto('/app/creative-conflicts');
    await this.waitForLoad();
  }

  /**
   * Force approve a creative conflict
   */
  async forceApprove(): Promise<void> {
    await this.forceApproveButton.click();
    await this.waitForLoad();
  }

  /**
   * Measure keyboard action response time
   */
  async measureKeyboardResponseTime(action: 'approve' | 'kill' | 'skip'): Promise<number> {
    const startTime = Date.now();

    switch (action) {
      case 'approve':
        await this.page.keyboard.press('ArrowRight');
        break;
      case 'kill':
        await this.page.keyboard.press('ArrowLeft');
        break;
      case 'skip':
        await this.page.keyboard.press('Space');
        break;
    }

    // Wait for UI to update
    await this.page.waitForTimeout(50);

    return Date.now() - startTime;
  }
}
