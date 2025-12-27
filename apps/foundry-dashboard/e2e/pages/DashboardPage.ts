/**
 * Dashboard Page Object
 * Handles dashboard interactions including empty state and quick actions
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  // Sidebar elements
  readonly sidebar: Locator;
  readonly navDashboard: Locator;
  readonly navHubs: Locator;
  readonly navReview: Locator;
  readonly navClients: Locator;
  readonly navAnalytics: Locator;
  readonly navSettings: Locator;

  // Command palette
  readonly commandPalette: Locator;
  readonly commandPaletteInput: Locator;

  // Empty state
  readonly emptyState: Locator;
  readonly createFirstClientCta: Locator;

  // Quick actions
  readonly quickActions: Locator;

  constructor(page: Page) {
    super(page);

    // Sidebar navigation
    this.sidebar = page.locator('aside');
    this.navDashboard = page.locator('a[href="/app"], nav >> text=Dashboard').first();
    this.navHubs = page.locator('a[href="/app/hubs"], nav >> text=Hubs').first();
    this.navReview = page.locator('a[href="/app/review"], nav >> text=Review').first();
    this.navClients = page.locator('a[href="/app/clients"], nav >> text=Clients').first();
    this.navAnalytics = page.locator('a[href="/app/analytics"], nav >> text=Analytics').first();
    this.navSettings = page.locator('a[href="/app/settings"], nav >> text=Settings').first();

    // Command palette (Cmd+K)
    this.commandPalette = page.locator('[role="dialog"][data-command-palette], [data-testid="command-palette"]');
    this.commandPaletteInput = page.locator('[data-command-palette] input, [data-testid="command-palette-input"]');

    // Empty state for new users
    this.emptyState = page.locator('[data-testid="empty-state"], text=/no clients|get started|create your first/i');
    this.createFirstClientCta = page.locator('button:has-text("Create Your First Client"), a:has-text("Create Your First Client"), button:has-text("Create Client")');

    // Quick actions section
    this.quickActions = page.locator('[data-testid="quick-actions"], section:has-text("Quick Actions")');
  }

  async goto(): Promise<void> {
    await this.page.goto('/app');
    await this.waitForLoad();
  }

  /**
   * Verify sidebar navigation is visible with all expected items
   */
  async verifySidebar(): Promise<void> {
    await expect(this.sidebar).toBeVisible({ timeout: 10000 });
  }

  /**
   * Check if this is an empty state (no clients)
   */
  async isEmptyState(): Promise<boolean> {
    return this.isVisible(this.emptyState) || this.isVisible(this.createFirstClientCta);
  }

  /**
   * Open command palette with Cmd+K
   */
  async openCommandPalette(): Promise<void> {
    await this.page.keyboard.press('Meta+k');
    await this.page.waitForTimeout(300);
  }

  /**
   * Close command palette
   */
  async closeCommandPalette(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(200);
  }

  /**
   * Check if command palette is open
   */
  async isCommandPaletteOpen(): Promise<boolean> {
    return this.isVisible(this.commandPalette);
  }

  /**
   * Navigate to a page using sidebar
   */
  async navigateToHubs(): Promise<void> {
    await this.navHubs.click();
    await this.waitForLoad();
  }

  async navigateToReview(): Promise<void> {
    await this.navReview.click();
    await this.waitForLoad();
  }

  async navigateToClients(): Promise<void> {
    await this.navClients.click();
    await this.waitForLoad();
  }

  async navigateToSettings(): Promise<void> {
    await this.navSettings.click();
    await this.waitForLoad();
  }

  /**
   * Click the "Create Your First Client" CTA
   */
  async clickCreateFirstClient(): Promise<void> {
    await this.createFirstClientCta.click();
    await this.waitForLoad();
  }

  /**
   * Measure page load time
   */
  async measureLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.goto();
    return Date.now() - startTime;
  }
}
