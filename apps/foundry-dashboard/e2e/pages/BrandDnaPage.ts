/**
 * Brand DNA Page Object
 * Handles brand DNA setup, training samples, and voice marker editing
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class BrandDnaPage extends BasePage {
  // Upload section
  readonly uploadDropzone: Locator;
  readonly pasteTextTab: Locator;
  readonly uploadTab: Locator;
  readonly textInput: Locator;
  readonly addSampleButton: Locator;

  // Training samples list
  readonly trainingSamplesList: Locator;
  readonly trainingSamples: Locator;

  // Progress and status
  readonly progressIndicator: Locator;
  readonly analysisStatus: Locator;

  // Brand DNA Report
  readonly dnaReport: Locator;
  readonly dnaStrength: Locator;
  readonly primaryTone: Locator;
  readonly signaturePhrases: Locator;

  // Voice markers
  readonly editVoiceMarkersButton: Locator;
  readonly voiceMarkerChips: Locator;
  readonly addPhraseInput: Locator;
  readonly addPhraseButton: Locator;

  constructor(page: Page) {
    super(page);

    // Upload section
    this.uploadDropzone = page.locator('[data-testid="dropzone"], .dropzone, [class*="drop"]');
    this.pasteTextTab = page.locator('button:has-text("Paste Text"), [role="tab"]:has-text("Paste")');
    this.uploadTab = page.locator('button:has-text("Upload"), [role="tab"]:has-text("Upload")');
    this.textInput = page.locator('textarea[data-testid="content-input"], textarea[placeholder*="paste" i]');
    this.addSampleButton = page.locator('button:has-text("Add Sample"), button:has-text("Submit")');

    // Training samples
    this.trainingSamplesList = page.locator('[data-testid="training-samples"], .training-samples');
    this.trainingSamples = page.locator('[data-testid="training-sample"], .training-sample');

    // Progress
    this.progressIndicator = page.locator('[data-testid="progress"], .progress-indicator, [role="progressbar"]');
    this.analysisStatus = page.locator('[data-testid="analysis-status"], .analysis-status');

    // DNA Report
    this.dnaReport = page.locator('[data-testid="dna-report"], .dna-report');
    this.dnaStrength = page.locator('[data-testid="dna-strength"], text=/DNA Strength/i');
    this.primaryTone = page.locator('[data-testid="primary-tone"], text=/Primary Tone/i');
    this.signaturePhrases = page.locator('[data-testid="signature-phrases"], .signature-phrases');

    // Voice markers
    this.editVoiceMarkersButton = page.locator('button:has-text("Edit Voice Markers"), button:has-text("Edit Markers")');
    this.voiceMarkerChips = page.locator('[data-testid="voice-marker"], .voice-marker-chip');
    this.addPhraseInput = page.locator('input[placeholder*="phrase" i], input[data-testid="add-phrase"]');
    this.addPhraseButton = page.locator('button:has-text("Add Phrase"), button[data-testid="add-phrase-btn"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/app/brand-dna');
    await this.waitForLoad();
  }

  /**
   * Upload a file via drag and drop simulation
   */
  async uploadFile(filePath: string): Promise<void> {
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    await this.waitForLoad();
  }

  /**
   * Switch to paste text tab
   */
  async switchToPasteText(): Promise<void> {
    await this.pasteTextTab.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Add text content as training sample
   */
  async addTextSample(content: string): Promise<void> {
    await this.switchToPasteText();
    await this.textInput.fill(content);
    await this.addSampleButton.click();
    await this.waitForLoad();
  }

  /**
   * Get count of training samples
   */
  async getSampleCount(): Promise<number> {
    const samples = await this.trainingSamples.all();
    return samples.length;
  }

  /**
   * Check if analysis is complete
   */
  async isAnalysisComplete(): Promise<boolean> {
    return this.isVisible(this.dnaReport);
  }

  /**
   * Wait for analysis to complete (up to 2 minutes)
   */
  async waitForAnalysis(): Promise<void> {
    await this.dnaReport.waitFor({ state: 'visible', timeout: 120000 });
  }

  /**
   * Get DNA strength score
   */
  async getDnaStrength(): Promise<string> {
    const text = await this.dnaStrength.textContent();
    return text ?? '';
  }

  /**
   * Open voice markers editor
   */
  async openVoiceMarkersEditor(): Promise<void> {
    await this.editVoiceMarkersButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Add a new voice marker phrase
   */
  async addVoiceMarker(phrase: string): Promise<void> {
    await this.addPhraseInput.fill(phrase);
    await this.addPhraseButton.click();
    await this.waitForLoad();
  }

  /**
   * Remove a voice marker by clicking its remove button
   */
  async removeVoiceMarker(phrase: string): Promise<void> {
    const chip = this.page.locator(`[data-testid="voice-marker"]:has-text("${phrase}")`);
    const removeBtn = chip.locator('button, [data-testid="remove"]');
    await removeBtn.click();
    await this.waitForLoad();
  }

  /**
   * Get list of voice marker phrases
   */
  async getVoiceMarkers(): Promise<string[]> {
    const chips = await this.voiceMarkerChips.all();
    const phrases: string[] = [];
    for (const chip of chips) {
      const text = await chip.textContent();
      if (text) phrases.push(text.trim());
    }
    return phrases;
  }
}
