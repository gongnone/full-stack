/**
 * Hub Page Object
 * Handles hub creation wizard, pillar configuration, and spoke generation
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HubPage extends BasePage {
  // Hub list
  readonly hubList: Locator;
  readonly hubCards: Locator;
  readonly createHubButton: Locator;

  // Wizard navigation
  readonly wizardSteps: Locator;
  readonly currentStep: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;

  // Step 1: Select Client
  readonly clientSelector: Locator;

  // Step 2: Upload Source
  readonly sourceDropzone: Locator;
  readonly pasteTextTab: Locator;
  readonly sourceTextInput: Locator;
  readonly charCount: Locator;

  // Step 3: Configure Pillars
  readonly pillarList: Locator;
  readonly pillarItems: Locator;
  readonly pillarTitle: Locator;
  readonly pillarClaim: Locator;
  readonly pillarAngle: Locator;
  readonly modifiedBadge: Locator;

  // Step 4: Generate
  readonly createHubFinalButton: Locator;
  readonly successAnimation: Locator;
  readonly startGenerationButton: Locator;

  // Processing indicators
  readonly processingAnimation: Locator;
  readonly processingStage: Locator;

  // Spoke generation
  readonly spokeProgressBar: Locator;
  readonly spokeCount: Locator;
  readonly websocketStatus: Locator;

  constructor(page: Page) {
    super(page);

    // Hub listing
    this.hubList = page.locator('[data-testid="hub-list"], .hub-grid');
    this.hubCards = page.locator('[data-testid="hub-card"], .hub-card, a[href*="/app/hubs/"]');
    this.createHubButton = page.locator('button:has-text("New Hub"), a:has-text("New Hub"), button:has-text("Create Hub")');

    // Wizard navigation
    this.wizardSteps = page.locator('[data-testid="wizard-steps"], .wizard-steps');
    this.currentStep = page.locator('[data-testid="current-step"], .step-active, [aria-current="step"]');
    this.nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');
    this.backButton = page.locator('button:has-text("Back"), button:has-text("Previous")');

    // Step 1: Client selection
    this.clientSelector = page.locator('[data-testid="client-select"], select[name="client"]');

    // Step 2: Source upload
    this.sourceDropzone = page.locator('[data-testid="source-dropzone"], .dropzone');
    this.pasteTextTab = page.locator('button:has-text("Paste Text"), [role="tab"]:has-text("Paste")');
    this.sourceTextInput = page.locator('textarea[data-testid="source-input"], textarea[placeholder*="transcript" i]');
    this.charCount = page.locator('[data-testid="char-count"], text=/\\d+ characters/i');

    // Step 3: Pillars
    this.pillarList = page.locator('[data-testid="pillar-list"], .pillar-list');
    this.pillarItems = page.locator('[data-testid="pillar-item"], .pillar-item');
    this.pillarTitle = page.locator('input[name="pillar-title"], [data-testid="pillar-title"]');
    this.pillarClaim = page.locator('input[name="pillar-claim"], [data-testid="pillar-claim"]');
    this.pillarAngle = page.locator('input[name="pillar-angle"], [data-testid="pillar-angle"]');
    this.modifiedBadge = page.locator('[data-testid="modified-badge"], .modified-badge, text=Modified');

    // Step 4: Final
    this.createHubFinalButton = page.locator('button:has-text("Create Hub")');
    this.successAnimation = page.locator('[data-testid="success-animation"], .success-animation, [class*="celebrate"]');
    this.startGenerationButton = page.locator('button:has-text("Start Generation"), button:has-text("Generate")');

    // Processing
    this.processingAnimation = page.locator('[data-testid="processing"], .processing-animation');
    this.processingStage = page.locator('[data-testid="processing-stage"], .processing-stage');

    // Spoke generation
    this.spokeProgressBar = page.locator('[data-testid="spoke-progress"], [role="progressbar"]');
    this.spokeCount = page.locator('[data-testid="spoke-count"], text=/\\d+ spokes?/i');
    this.websocketStatus = page.locator('[data-testid="ws-status"], .websocket-status');
  }

  async goto(): Promise<void> {
    await this.page.goto('/app/hubs');
    await this.waitForLoad();
  }

  async gotoNew(): Promise<void> {
    await this.page.goto('/app/hubs/new');
    await this.waitForLoad();
  }

  /**
   * Start the hub creation wizard
   */
  async startWizard(): Promise<void> {
    await this.createHubButton.click();
    await this.waitForLoad();
  }

  /**
   * Select a client in step 1
   */
  async selectClient(clientName: string): Promise<void> {
    await this.clientSelector.selectOption({ label: clientName });
    await this.nextButton.click();
    await this.waitForLoad();
  }

  /**
   * Upload source file
   */
  async uploadSource(filePath: string): Promise<void> {
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    await this.waitForLoad();
  }

  /**
   * Paste source text
   */
  async pasteSourceText(content: string): Promise<void> {
    await this.pasteTextTab.click();
    await this.page.waitForTimeout(300);
    await this.sourceTextInput.fill(content);
    await this.nextButton.click();
    await this.waitForLoad();
  }

  /**
   * Wait for pillar extraction to complete (max 30 seconds per NFR-P2)
   */
  async waitForPillarExtraction(): Promise<void> {
    // Wait for processing stages
    const stages = ['Parsing document', 'Identifying themes', 'Extracting claims', 'Generating pillars'];

    // Wait for pillars to appear
    await this.pillarItems.first().waitFor({ state: 'visible', timeout: 30000 });
  }

  /**
   * Get pillar count
   */
  async getPillarCount(): Promise<number> {
    const pillars = await this.pillarItems.all();
    return pillars.length;
  }

  /**
   * Edit a pillar title
   */
  async editPillarTitle(index: number, newTitle: string): Promise<void> {
    const pillar = this.pillarItems.nth(index);
    const titleInput = pillar.locator('input[name="pillar-title"], [data-testid="pillar-title"]');
    await titleInput.fill(newTitle);
  }

  /**
   * Check if any pillar shows modified badge
   */
  async hasModifiedPillars(): Promise<boolean> {
    return this.isVisible(this.modifiedBadge);
  }

  /**
   * Complete the hub creation
   */
  async completeHubCreation(): Promise<void> {
    await this.createHubFinalButton.click();
    await this.waitForLoad();
  }

  /**
   * Check if success animation is showing
   */
  async hasSuccessAnimation(): Promise<boolean> {
    return this.isVisible(this.successAnimation);
  }

  /**
   * Start spoke generation
   */
  async startGeneration(): Promise<void> {
    await this.startGenerationButton.click();
    await this.waitForLoad();
  }

  /**
   * Wait for spoke generation to complete (max 60 seconds per NFR-P3)
   */
  async waitForSpokeGeneration(): Promise<void> {
    // Wait for progress to complete or spokes to appear
    await this.page.waitForFunction(
      () => {
        const progress = document.querySelector('[role="progressbar"]');
        const value = progress?.getAttribute('aria-valuenow');
        return value === '100';
      },
      { timeout: 60000 }
    ).catch(async () => {
      // Fallback: check for spoke count
      await this.spokeCount.waitFor({ state: 'visible', timeout: 5000 });
    });
  }

  /**
   * Get generated spoke count
   */
  async getSpokeCount(): Promise<number> {
    const text = await this.spokeCount.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Navigate to a specific hub
   */
  async navigateToHub(hubId: string): Promise<void> {
    await this.page.goto(`/app/hubs/${hubId}`);
    await this.waitForLoad();
  }

  /**
   * Get list of hub IDs
   */
  async getHubIds(): Promise<string[]> {
    const cards = await this.hubCards.all();
    const ids: string[] = [];
    for (const card of cards) {
      const href = await card.getAttribute('href');
      const match = href?.match(/\/app\/hubs\/([a-f0-9-]+)/);
      if (match) ids.push(match[1]);
    }
    return ids;
  }
}
