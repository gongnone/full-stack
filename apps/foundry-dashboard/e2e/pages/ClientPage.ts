/**
 * Client Page Object
 * Handles client creation, listing, and workspace interactions
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ClientPage extends BasePage {
  // Client list
  readonly clientList: Locator;
  readonly clientCards: Locator;
  readonly createClientButton: Locator;

  // Client creation form
  readonly clientForm: Locator;
  readonly clientNameInput: Locator;
  readonly industrySelect: Locator;
  readonly contactEmailInput: Locator;
  readonly brandColorInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  // Client workspace
  readonly workspaceHeader: Locator;
  readonly activeClientIndicator: Locator;
  readonly clientBrandBorder: Locator;

  // Brand DNA section
  readonly brandDnaPrompt: Locator;
  readonly setupBrandDnaButton: Locator;

  constructor(page: Page) {
    super(page);

    // Client listing
    this.clientList = page.locator('[data-testid="client-list"], .client-grid');
    this.clientCards = page.locator('[data-testid="client-card"], .client-card');
    this.createClientButton = page.locator('button:has-text("Create Client"), button:has-text("New Client"), a:has-text("Create Client")');

    // Client creation form
    this.clientForm = page.locator('form[data-testid="client-form"], form:has(input[name="name"])');
    this.clientNameInput = page.locator('input[name="name"], input[id="client-name"], input[placeholder*="client name" i]');
    this.industrySelect = page.locator('select[name="industry"], [data-testid="industry-select"]');
    this.contactEmailInput = page.locator('input[name="contactEmail"], input[type="email"][name*="contact"]');
    this.brandColorInput = page.locator('input[name="brandColor"], input[type="color"]');
    this.submitButton = page.locator('button[type="submit"], button:has-text("Create")');
    this.cancelButton = page.locator('button:has-text("Cancel")');

    // Client workspace elements
    this.workspaceHeader = page.locator('header [data-testid="client-name"], header h1');
    this.activeClientIndicator = page.locator('[data-testid="active-client"], .active-client-indicator');
    this.clientBrandBorder = page.locator('[data-client-border], [style*="border-color"]');

    // Brand DNA
    this.brandDnaPrompt = page.locator('text=/Set Up Brand DNA|Brand DNA/i');
    this.setupBrandDnaButton = page.locator('button:has-text("Set Up Brand DNA"), a:has-text("Set Up Brand DNA")');
  }

  async goto(): Promise<void> {
    await this.page.goto('/app/clients');
    await this.waitForLoad();
  }

  async gotoNew(): Promise<void> {
    await this.page.goto('/app/clients/new');
    await this.waitForLoad();
  }

  /**
   * Create a new client with provided details
   */
  async createClient(options: {
    name: string;
    industry?: string;
    contactEmail?: string;
    brandColor?: string;
  }): Promise<void> {
    // Fill required name field
    await this.clientNameInput.fill(options.name);

    // Fill optional fields if provided
    if (options.industry) {
      await this.industrySelect.selectOption(options.industry);
    }

    if (options.contactEmail) {
      await this.contactEmailInput.fill(options.contactEmail);
    }

    if (options.brandColor) {
      await this.brandColorInput.fill(options.brandColor);
    }

    // Submit form
    await this.submitButton.click();
    await this.waitForLoad();
  }

  /**
   * Check if client creation form is visible
   */
  async isFormVisible(): Promise<boolean> {
    return this.isVisible(this.clientForm) || this.isVisible(this.clientNameInput);
  }

  /**
   * Get list of client names
   */
  async getClientNames(): Promise<string[]> {
    const cards = await this.clientCards.all();
    const names: string[] = [];
    for (const card of cards) {
      const name = await card.locator('h3, .client-name').textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }

  /**
   * Select a client by name
   */
  async selectClient(name: string): Promise<void> {
    const clientCard = this.page.locator(`[data-testid="client-card"]:has-text("${name}"), .client-card:has-text("${name}")`);
    await clientCard.click();
    await this.waitForLoad();
  }

  /**
   * Check if client workspace is showing the right client
   */
  async isClientActive(name: string): Promise<boolean> {
    const headerText = await this.workspaceHeader.textContent();
    return headerText?.includes(name) ?? false;
  }

  /**
   * Check if Brand DNA setup prompt is visible
   */
  async hasBrandDnaPrompt(): Promise<boolean> {
    return this.isVisible(this.brandDnaPrompt);
  }

  /**
   * Navigate to Brand DNA setup
   */
  async navigateToBrandDna(): Promise<void> {
    await this.setupBrandDnaButton.click();
    await this.waitForLoad();
  }
}
