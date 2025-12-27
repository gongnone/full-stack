/**
 * Quality Gates Page Object
 * Handles G2/G4/G5/G6 quality gate display and interactions
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface GateScore {
  gate: string;
  score: number | null;
  passed: boolean;
  reason?: string;
}

export interface SpokeQuality {
  id: string;
  g2: GateScore;
  g4: GateScore;
  g5: GateScore;
  g6?: GateScore;
  overallPassed: boolean;
}

export class QualityGatesPage extends BasePage {
  // Spoke list with quality scores
  readonly spokeList: Locator;
  readonly spokeCards: Locator;

  // Quality gate badges
  readonly g2Badge: Locator;
  readonly g4Badge: Locator;
  readonly g5Badge: Locator;
  readonly g6Badge: Locator;

  // Score displays
  readonly g2Score: Locator;
  readonly hookStrengthLabel: Locator;
  readonly voiceMatchBadge: Locator;
  readonly platformComplianceBadge: Locator;
  readonly visualClicheBadge: Locator;

  // Tooltips/Details
  readonly gateTooltip: Locator;
  readonly gateDetailPanel: Locator;
  readonly failureReason: Locator;

  // Filters
  readonly filterByGate: Locator;
  readonly filterHighConfidence: Locator;
  readonly filterNeedsReview: Locator;
  readonly filterFailed: Locator;

  // Self-healing indicators
  readonly selfHealingBadge: Locator;
  readonly healingProgress: Locator;
  readonly attemptCounter: Locator;

  // Override controls
  readonly overrideButton: Locator;
  readonly overrideModal: Locator;
  readonly overrideReasonInput: Locator;
  readonly confirmOverrideButton: Locator;

  constructor(page: Page) {
    super(page);

    // Spoke list
    this.spokeList = page.locator('[data-testid="spoke-list"], .spoke-list');
    this.spokeCards = page.locator('[data-testid="spoke-card"], .spoke-card');

    // Quality gate badges
    this.g2Badge = page.locator('[data-gate="g2"], [data-testid="g2-badge"], .g2-badge');
    this.g4Badge = page.locator('[data-gate="g4"], [data-testid="g4-badge"], .g4-badge');
    this.g5Badge = page.locator('[data-gate="g5"], [data-testid="g5-badge"], .g5-badge');
    this.g6Badge = page.locator('[data-gate="g6"], [data-testid="g6-badge"], .g6-badge');

    // Score displays
    this.g2Score = page.locator('[data-testid="g2-score"], .g2-score, .hook-score');
    this.hookStrengthLabel = page.locator('text=/hook strength/i');
    this.voiceMatchBadge = page.locator('[data-testid="voice-match"], text=/voice|G4/i');
    this.platformComplianceBadge = page.locator('[data-testid="platform-compliance"], text=/platform|G5/i');
    this.visualClicheBadge = page.locator('[data-testid="visual-cliche"], text=/visual|G6/i');

    // Tooltips/Details
    this.gateTooltip = page.locator('[role="tooltip"], .gate-tooltip');
    this.gateDetailPanel = page.locator('[data-testid="gate-details"], .gate-detail-panel');
    this.failureReason = page.locator('[data-testid="failure-reason"], .failure-reason');

    // Filters
    this.filterByGate = page.locator('[data-testid="filter-gate"], select[name="gate-filter"]');
    this.filterHighConfidence = page.locator('button:has-text("High Confidence"), [data-filter="high"]');
    this.filterNeedsReview = page.locator('button:has-text("Needs Review"), [data-filter="review"]');
    this.filterFailed = page.locator('button:has-text("Failed"), [data-filter="failed"]');

    // Self-healing indicators
    this.selfHealingBadge = page.locator('[data-testid="self-healed"], .self-healed-badge, text=/healed/i');
    this.healingProgress = page.locator('[data-testid="healing-progress"], .healing-progress');
    this.attemptCounter = page.locator('[data-testid="attempt-counter"], text=/attempt \\d/i');

    // Override controls
    this.overrideButton = page.locator('button:has-text("Override"), button:has-text("Force")');
    this.overrideModal = page.locator('[data-testid="override-modal"], [role="dialog"]:has-text("Override")');
    this.overrideReasonInput = page.locator('textarea[name="override-reason"], input[name="override-reason"]');
    this.confirmOverrideButton = page.locator('[role="dialog"] button:has-text("Confirm"), [role="dialog"] button:has-text("Override")');
  }

  async goto(hubId?: string): Promise<void> {
    if (hubId) {
      await this.page.goto(`/app/hubs/${hubId}`);
    } else {
      await this.page.goto('/app/hubs');
    }
    await this.waitForLoad();
  }

  /**
   * Get G2 score from a spoke card
   */
  async getG2Score(spokeIndex: number): Promise<number> {
    const spoke = this.spokeCards.nth(spokeIndex);
    const scoreElement = spoke.locator('[data-testid="g2-score"], .g2-score');
    const text = await scoreElement.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get G4 (Voice) pass/fail status
   */
  async getG4Status(spokeIndex: number): Promise<{ passed: boolean; reason?: string }> {
    const spoke = this.spokeCards.nth(spokeIndex);
    const badge = spoke.locator('[data-gate="g4"], .g4-badge');

    const text = await badge.textContent();
    const passed = text?.toLowerCase().includes('pass') ?? false;

    // Get failure reason if failed
    let reason: string | undefined;
    if (!passed) {
      const reasonEl = spoke.locator('[data-testid="g4-reason"], .g4-reason');
      reason = await reasonEl.textContent().catch(() => undefined);
    }

    return { passed, reason: reason?.trim() };
  }

  /**
   * Get G5 (Platform) pass/fail status
   */
  async getG5Status(spokeIndex: number): Promise<{ passed: boolean; reason?: string }> {
    const spoke = this.spokeCards.nth(spokeIndex);
    const badge = spoke.locator('[data-gate="g5"], .g5-badge');

    const text = await badge.textContent();
    const passed = text?.toLowerCase().includes('pass') ?? false;

    let reason: string | undefined;
    if (!passed) {
      const reasonEl = spoke.locator('[data-testid="g5-reason"], .g5-reason');
      reason = await reasonEl.textContent().catch(() => undefined);
    }

    return { passed, reason: reason?.trim() };
  }

  /**
   * Get full quality data for a spoke
   */
  async getSpokeQuality(spokeIndex: number): Promise<SpokeQuality> {
    const spoke = this.spokeCards.nth(spokeIndex);
    const id = await spoke.getAttribute('data-spoke-id') ?? `spoke-${spokeIndex}`;

    const g2Score = await this.getG2Score(spokeIndex);
    const g4Status = await this.getG4Status(spokeIndex);
    const g5Status = await this.getG5Status(spokeIndex);

    // Check G6 if visual
    let g6: GateScore | undefined;
    const hasG6 = await spoke.locator('[data-gate="g6"]').isVisible().catch(() => false);
    if (hasG6) {
      const g6Badge = spoke.locator('[data-gate="g6"]');
      const g6Text = await g6Badge.textContent();
      g6 = {
        gate: 'G6',
        score: null,
        passed: g6Text?.toLowerCase().includes('pass') ?? false,
      };
    }

    return {
      id,
      g2: {
        gate: 'G2',
        score: g2Score,
        passed: g2Score >= 70,
      },
      g4: {
        gate: 'G4',
        score: null,
        passed: g4Status.passed,
        reason: g4Status.reason,
      },
      g5: {
        gate: 'G5',
        score: null,
        passed: g5Status.passed,
        reason: g5Status.reason,
      },
      g6,
      overallPassed: g2Score >= 70 && g4Status.passed && g5Status.passed && (g6?.passed ?? true),
    };
  }

  /**
   * Hover over gate badge to see tooltip
   */
  async hoverGateBadge(spokeIndex: number, gate: 'g2' | 'g4' | 'g5' | 'g6'): Promise<string> {
    const spoke = this.spokeCards.nth(spokeIndex);
    const badge = spoke.locator(`[data-gate="${gate}"]`);

    await badge.hover();
    await this.page.waitForTimeout(500);

    const tooltip = this.gateTooltip;
    if (await tooltip.isVisible().catch(() => false)) {
      return (await tooltip.textContent()) ?? '';
    }

    return '';
  }

  /**
   * Filter spokes by quality level
   */
  async filterByHighConfidence(): Promise<void> {
    await this.filterHighConfidence.click();
    await this.waitForLoad();
  }

  async filterByNeedsReview(): Promise<void> {
    await this.filterNeedsReview.click();
    await this.waitForLoad();
  }

  async filterByFailed(): Promise<void> {
    await this.filterFailed.click();
    await this.waitForLoad();
  }

  /**
   * Get count of spokes by quality category
   */
  async getQualityCounts(): Promise<{ high: number; review: number; failed: number }> {
    const spokes = await this.spokeCards.all();

    let high = 0;
    let review = 0;
    let failed = 0;

    for (let i = 0; i < spokes.length; i++) {
      const quality = await this.getSpokeQuality(i);

      if (quality.overallPassed && quality.g2.score! >= 80) {
        high++;
      } else if (quality.overallPassed) {
        review++;
      } else {
        failed++;
      }
    }

    return { high, review, failed };
  }

  /**
   * Check if spoke is self-healed
   */
  async isSelfHealed(spokeIndex: number): Promise<boolean> {
    const spoke = this.spokeCards.nth(spokeIndex);
    return spoke.locator('[data-testid="self-healed"], .self-healed-badge').isVisible().catch(() => false);
  }

  /**
   * Get self-healing attempt count
   */
  async getHealingAttempts(spokeIndex: number): Promise<number> {
    const spoke = this.spokeCards.nth(spokeIndex);
    const counterText = await spoke.locator('[data-testid="attempt-counter"]').textContent().catch(() => null);

    if (counterText) {
      const match = counterText.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }

    return 0;
  }

  /**
   * Override a gate decision
   */
  async overrideGate(spokeIndex: number, reason?: string): Promise<void> {
    const spoke = this.spokeCards.nth(spokeIndex);
    const overrideBtn = spoke.locator('button:has-text("Override"), button:has-text("Force")');

    await overrideBtn.click();
    await this.page.waitForTimeout(300);

    if (await this.isVisible(this.overrideModal)) {
      if (reason) {
        await this.overrideReasonInput.fill(reason);
      }
      await this.confirmOverrideButton.click();
    }

    await this.waitForLoad();
  }
}
