/**
 * Creative Conflicts Page Object
 * Handles Director's Cut actions for spokes that failed self-healing
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ConflictData {
  id: string;
  content: string;
  failureReason: string;
  attempts: number;
  g2Score: number;
  g4Passed: boolean;
  g5Passed: boolean;
}

export class CreativeConflictsPage extends BasePage {
  // Page header
  readonly pageTitle: Locator;
  readonly conflictCount: Locator;

  // Conflict list
  readonly conflictList: Locator;
  readonly conflictCards: Locator;

  // Conflict card elements
  readonly conflictContent: Locator;
  readonly failureReason: Locator;
  readonly attemptHistory: Locator;
  readonly gateScores: Locator;

  // Director's Cut actions
  readonly forceApproveButton: Locator;
  readonly quickEditButton: Locator;
  readonly voiceCalibrateButton: Locator;
  readonly killButton: Locator;

  // Force Approve modal
  readonly forceApproveModal: Locator;
  readonly warningMessage: Locator;
  readonly overrideReasonInput: Locator;
  readonly confirmForceApproveButton: Locator;
  readonly cancelForceApproveButton: Locator;

  // Quick Edit modal
  readonly quickEditModal: Locator;
  readonly editTextarea: Locator;
  readonly saveEditButton: Locator;
  readonly cancelEditButton: Locator;

  // Voice Calibrate interface
  readonly voiceCalibrateModal: Locator;
  readonly recordButton: Locator;
  readonly recordingTimer: Locator;
  readonly stopRecordingButton: Locator;
  readonly transcriptionPreview: Locator;
  readonly submitCalibrationButton: Locator;

  // Kill confirmation
  readonly killConfirmModal: Locator;
  readonly confirmKillButton: Locator;
  readonly cancelKillButton: Locator;

  // Empty state
  readonly emptyState: Locator;
  readonly noConflictsMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Page header
    this.pageTitle = page.locator('h1:has-text("Creative Conflicts")');
    this.conflictCount = page.locator('[data-testid="conflict-count"], text=/\\d+ conflicts?/i');

    // Conflict list
    this.conflictList = page.locator('[data-testid="conflict-list"], .conflict-list');
    this.conflictCards = page.locator('[data-testid="conflict-card"], .conflict-card');

    // Conflict card elements
    this.conflictContent = page.locator('[data-testid="conflict-content"], .conflict-content');
    this.failureReason = page.locator('[data-testid="failure-reason"], .failure-reason');
    this.attemptHistory = page.locator('[data-testid="attempt-history"], .attempt-history');
    this.gateScores = page.locator('[data-testid="gate-scores"], .gate-scores');

    // Director's Cut actions
    this.forceApproveButton = page.locator('button:has-text("Force Approve")');
    this.quickEditButton = page.locator('button:has-text("Quick Edit")');
    this.voiceCalibrateButton = page.locator('button:has-text("Voice Calibrate")');
    this.killButton = page.locator('button:has-text("Kill"):not([data-testid="hub-kill"])');

    // Force Approve modal
    this.forceApproveModal = page.locator('[data-testid="force-approve-modal"], [role="dialog"]:has-text("Force Approve")');
    this.warningMessage = page.locator('[data-testid="warning-message"], .warning-message');
    this.overrideReasonInput = page.locator('textarea[name="override-reason"], input[name="reason"]');
    this.confirmForceApproveButton = page.locator('[role="dialog"] button:has-text("Confirm"), [role="dialog"] button:has-text("Force Approve")');
    this.cancelForceApproveButton = page.locator('[role="dialog"] button:has-text("Cancel")');

    // Quick Edit modal
    this.quickEditModal = page.locator('[data-testid="quick-edit-modal"], [role="dialog"]:has-text("Edit")');
    this.editTextarea = page.locator('[role="dialog"] textarea, [data-testid="edit-content"]');
    this.saveEditButton = page.locator('[role="dialog"] button:has-text("Save")');
    this.cancelEditButton = page.locator('[role="dialog"] button:has-text("Cancel")');

    // Voice Calibrate interface
    this.voiceCalibrateModal = page.locator('[data-testid="voice-calibrate-modal"], [role="dialog"]:has-text("Voice")');
    this.recordButton = page.locator('button:has-text("Record"), button[aria-label*="record" i]');
    this.recordingTimer = page.locator('[data-testid="recording-timer"], .recording-timer');
    this.stopRecordingButton = page.locator('button:has-text("Stop"), button[aria-label*="stop" i]');
    this.transcriptionPreview = page.locator('[data-testid="transcription"], .transcription-preview');
    this.submitCalibrationButton = page.locator('button:has-text("Submit"), button:has-text("Update Brand DNA")');

    // Kill confirmation
    this.killConfirmModal = page.locator('[data-testid="kill-confirm-modal"], [role="dialog"]:has-text("Kill")');
    this.confirmKillButton = page.locator('[role="dialog"] button:has-text("Confirm Kill"), [role="dialog"] button:has-text("Yes, Kill")');
    this.cancelKillButton = page.locator('[role="dialog"] button:has-text("Cancel"), [role="dialog"] button:has-text("No")');

    // Empty state
    this.emptyState = page.locator('[data-testid="empty-state"], .empty-state');
    this.noConflictsMessage = page.locator('text=/no creative conflicts|all resolved/i');
  }

  async goto(): Promise<void> {
    await this.page.goto('/app/creative-conflicts');
    await this.waitForLoad();
  }

  /**
   * Check if page has conflicts
   */
  async hasConflicts(): Promise<boolean> {
    const empty = await this.isVisible(this.emptyState);
    return !empty;
  }

  /**
   * Get count of conflicts
   */
  async getConflictCount(): Promise<number> {
    const cards = await this.conflictCards.all();
    return cards.length;
  }

  /**
   * Get conflict data for a specific card
   */
  async getConflictData(index: number): Promise<ConflictData> {
    const card = this.conflictCards.nth(index);

    const id = await card.getAttribute('data-conflict-id') ?? `conflict-${index}`;
    const content = await card.locator('[data-testid="conflict-content"], .conflict-content').textContent() ?? '';
    const failureReason = await card.locator('[data-testid="failure-reason"], .failure-reason').textContent() ?? '';

    // Parse attempt count
    const attemptText = await card.locator('[data-testid="attempt-history"]').textContent().catch(() => '0');
    const attemptMatch = attemptText?.match(/(\d+)/);
    const attempts = attemptMatch ? parseInt(attemptMatch[1], 10) : 0;

    // Parse gate scores
    const g2Text = await card.locator('[data-gate="g2"], .g2-score').textContent().catch(() => '0');
    const g2Match = g2Text?.match(/(\d+)/);
    const g2Score = g2Match ? parseInt(g2Match[1], 10) : 0;

    const g4Badge = await card.locator('[data-gate="g4"]').textContent().catch(() => '');
    const g4Passed = g4Badge?.toLowerCase().includes('pass') ?? false;

    const g5Badge = await card.locator('[data-gate="g5"]').textContent().catch(() => '');
    const g5Passed = g5Badge?.toLowerCase().includes('pass') ?? false;

    return {
      id,
      content: content.trim(),
      failureReason: failureReason.trim(),
      attempts,
      g2Score,
      g4Passed,
      g5Passed,
    };
  }

  /**
   * Force approve a conflict
   */
  async forceApprove(index: number, reason?: string): Promise<void> {
    const card = this.conflictCards.nth(index);
    await card.locator('button:has-text("Force Approve")').click();

    await this.page.waitForTimeout(300);

    if (await this.isVisible(this.forceApproveModal)) {
      if (reason) {
        await this.overrideReasonInput.fill(reason);
      }
      await this.confirmForceApproveButton.click();
    }

    await this.waitForLoad();
  }

  /**
   * Quick edit a conflict
   */
  async quickEdit(index: number, newContent: string): Promise<void> {
    const card = this.conflictCards.nth(index);
    await card.locator('button:has-text("Quick Edit")').click();

    await this.page.waitForTimeout(300);

    if (await this.isVisible(this.quickEditModal)) {
      await this.editTextarea.fill(newContent);
      await this.saveEditButton.click();
    }

    await this.waitForLoad();
  }

  /**
   * Start voice calibration (opens modal)
   */
  async startVoiceCalibrate(index: number): Promise<void> {
    const card = this.conflictCards.nth(index);
    await card.locator('button:has-text("Voice Calibrate")').click();

    await this.page.waitForTimeout(300);
  }

  /**
   * Check if voice calibrate modal is open
   */
  async isVoiceCalibrateOpen(): Promise<boolean> {
    return this.isVisible(this.voiceCalibrateModal);
  }

  /**
   * Start recording voice note
   */
  async startRecording(): Promise<void> {
    await this.recordButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Stop recording voice note
   */
  async stopRecording(): Promise<void> {
    await this.stopRecordingButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Submit voice calibration
   */
  async submitCalibration(): Promise<void> {
    await this.submitCalibrationButton.click();
    await this.waitForLoad();
  }

  /**
   * Kill a conflict permanently
   */
  async killConflict(index: number): Promise<void> {
    const card = this.conflictCards.nth(index);
    await card.locator('button:has-text("Kill"):not([data-testid="hub-kill"])').click();

    await this.page.waitForTimeout(300);

    if (await this.isVisible(this.killConfirmModal)) {
      await this.confirmKillButton.click();
    }

    await this.waitForLoad();
  }

  /**
   * Get all available Director's Cut actions for a conflict
   */
  async getAvailableActions(index: number): Promise<string[]> {
    const card = this.conflictCards.nth(index);
    const actions: string[] = [];

    if (await card.locator('button:has-text("Force Approve")').isVisible().catch(() => false)) {
      actions.push('Force Approve');
    }
    if (await card.locator('button:has-text("Quick Edit")').isVisible().catch(() => false)) {
      actions.push('Quick Edit');
    }
    if (await card.locator('button:has-text("Voice Calibrate")').isVisible().catch(() => false)) {
      actions.push('Voice Calibrate');
    }
    if (await card.locator('button:has-text("Kill")').isVisible().catch(() => false)) {
      actions.push('Kill');
    }

    return actions;
  }

  /**
   * Check if empty state is showing
   */
  async isEmptyState(): Promise<boolean> {
    return this.isVisible(this.noConflictsMessage);
  }
}
