/**
 * Source Ingestion Page Object
 * Handles source material upload (PDF, text, URL) for Hub creation
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SourceIngestionPage extends BasePage {
  // Tab navigation
  readonly uploadTab: Locator;
  readonly pasteTextTab: Locator;
  readonly urlTab: Locator;

  // Upload zone
  readonly uploadDropzone: Locator;
  readonly fileInput: Locator;
  readonly uploadProgress: Locator;
  readonly uploadedFile: Locator;
  readonly uploadError: Locator;

  // Paste text
  readonly textInput: Locator;
  readonly charCount: Locator;
  readonly wordCount: Locator;
  readonly minLengthWarning: Locator;

  // URL input
  readonly urlInput: Locator;
  readonly fetchButton: Locator;
  readonly urlPreview: Locator;
  readonly urlError: Locator;

  // Validation
  readonly validationStatus: Locator;
  readonly validationChecks: Locator;

  // Navigation
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly extractThemesButton: Locator;

  constructor(page: Page) {
    super(page);

    // Tab navigation
    this.uploadTab = page.locator('button:has-text("Upload"), [role="tab"]:has-text("Upload")');
    this.pasteTextTab = page.locator('button:has-text("Paste Text"), [role="tab"]:has-text("Paste")');
    this.urlTab = page.locator('button:has-text("URL"), [role="tab"]:has-text("URL")');

    // Upload zone
    this.uploadDropzone = page.locator('[data-testid="dropzone"], .dropzone, [class*="drop-zone"]');
    this.fileInput = page.locator('input[type="file"]');
    this.uploadProgress = page.locator('[data-testid="upload-progress"], .upload-progress, [role="progressbar"]');
    this.uploadedFile = page.locator('[data-testid="uploaded-file"], .uploaded-file');
    this.uploadError = page.locator('[data-testid="upload-error"], .upload-error, text=/error|failed/i');

    // Paste text
    this.textInput = page.locator('textarea[data-testid="source-text"], textarea[placeholder*="paste" i], textarea[placeholder*="transcript" i]');
    this.charCount = page.locator('[data-testid="char-count"], text=/\\d+ characters/i');
    this.wordCount = page.locator('[data-testid="word-count"], text=/\\d+ words/i');
    this.minLengthWarning = page.locator('[data-testid="min-length-warning"], text=/minimum/i');

    // URL input
    this.urlInput = page.locator('input[type="url"], input[placeholder*="URL" i], input[name="url"]');
    this.fetchButton = page.locator('button:has-text("Fetch"), button:has-text("Scrape")');
    this.urlPreview = page.locator('[data-testid="url-preview"], .url-preview');
    this.urlError = page.locator('[data-testid="url-error"], .url-error');

    // Validation
    this.validationStatus = page.locator('[data-testid="validation-status"], .validation-status');
    this.validationChecks = page.locator('[data-testid="validation-check"], .validation-check');

    // Navigation
    this.nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');
    this.backButton = page.locator('button:has-text("Back"), button:has-text("Previous")');
    this.extractThemesButton = page.locator('button:has-text("Extract Themes"), button:has-text("Extract")');
  }

  async goto(): Promise<void> {
    await this.page.goto('/app/hubs/new');
    await this.waitForLoad();
  }

  /**
   * Switch to upload tab
   */
  async selectUploadTab(): Promise<void> {
    await this.uploadTab.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Switch to paste text tab
   */
  async selectPasteTextTab(): Promise<void> {
    await this.pasteTextTab.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Switch to URL tab
   */
  async selectUrlTab(): Promise<void> {
    await this.urlTab.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Upload a file
   */
  async uploadFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
    // Wait for upload to complete
    await this.uploadProgress.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
  }

  /**
   * Check if file was uploaded successfully
   */
  async isFileUploaded(): Promise<boolean> {
    return this.isVisible(this.uploadedFile);
  }

  /**
   * Paste text content
   */
  async pasteText(content: string): Promise<void> {
    await this.selectPasteTextTab();
    await this.textInput.fill(content);
  }

  /**
   * Get current word count
   */
  async getWordCount(): Promise<number> {
    const text = await this.wordCount.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get current character count
   */
  async getCharCount(): Promise<number> {
    const text = await this.charCount.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Check if minimum length warning is shown
   */
  async hasMinLengthWarning(): Promise<boolean> {
    return this.isVisible(this.minLengthWarning);
  }

  /**
   * Enter URL and fetch content
   */
  async fetchUrl(url: string): Promise<void> {
    await this.selectUrlTab();
    await this.urlInput.fill(url);
    await this.fetchButton.click();
    await this.waitForLoad();
  }

  /**
   * Check if URL preview is shown
   */
  async hasUrlPreview(): Promise<boolean> {
    return this.isVisible(this.urlPreview);
  }

  /**
   * Get validation check statuses
   */
  async getValidationChecks(): Promise<{ check: string; passed: boolean }[]> {
    const checks = await this.validationChecks.all();
    const results: { check: string; passed: boolean }[] = [];

    for (const check of checks) {
      const text = await check.textContent();
      const hasCheckmark = await check.locator('[data-passed="true"], .check-pass, svg.check').isVisible().catch(() => false);
      results.push({
        check: text?.trim() ?? '',
        passed: hasCheckmark,
      });
    }

    return results;
  }

  /**
   * Proceed to next step
   */
  async proceedToExtraction(): Promise<void> {
    await this.nextButton.click();
    await this.waitForLoad();
  }

  /**
   * Click Extract Themes button
   */
  async extractThemes(): Promise<void> {
    await this.extractThemesButton.click();
    await this.waitForLoad();
  }

  /**
   * Measure upload time
   */
  async measureUploadTime(filePath: string): Promise<number> {
    const startTime = Date.now();
    await this.uploadFile(filePath);
    return Date.now() - startTime;
  }
}
