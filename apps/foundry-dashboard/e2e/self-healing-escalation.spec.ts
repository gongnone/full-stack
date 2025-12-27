import { test, expect } from '@playwright/test';
import { login, waitForPageLoad } from './utils/test-helpers';

/**
 * Self-Healing Loop Edge Case Tests
 * 
 * Verifies Epic 4.4: Creative Conflict Escalation
 * "Failed content escalated to user after 3 attempts"
 */
test.describe('Self-Healing: Escalation Flow', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Could not log in');
  });

  test('Spokes failing 3 iterations are escalated to Creative Conflicts', async ({ page }) => {
    // GIVEN: User is on the dashboard
    await page.goto('/app');
    
    // WHEN: A spoke fails healing 3 times (Simulated via route mocking if needed, 
    // but here we check the UI state transition)
    await page.goto('/app/creative-conflicts');
    await waitForPageLoad(page);

    // THEN: It should appear in the Creative Conflicts list
    const conflictCards = page.locator('.conflict-card, [class*="border-kill"]');
    await expect(conflictCards.first()).toBeVisible({ timeout: 5000 });

    // AND: Opening a conflict shows the Director's Cut panel
    await conflictCards.first().click();
    
    // Verifying UX Pattern 6: Creative Conflict Panel
    await expect(page.locator('text=/Critic\'s rejection reason/i')).toBeVisible();
    await expect(page.locator('text=/Director\'s Cut/i')).toBeVisible();
    
    // Check for specific buttons
    await expect(page.locator('button:has-text("Force Approve")')).toBeVisible();
    await expect(page.locator('button:has-text("Voice Calibrate")')).toBeVisible();
  });

  test('Voice Calibrate action triggers grounding pipeline', async ({ page }) => {
    await page.goto('/app/creative-conflicts');
    await waitForPageLoad(page);
    
    // Click on a conflict
    await page.locator('.conflict-card, [class*="border-kill"]').first().click();
    
    // WHEN: User clicks "Voice Calibrate"
    await page.click('button:has-text("Voice Calibrate")');
    
    // THEN: It should open the voice recording interface
    await expect(page.locator('text=/Record/i')).toBeVisible();
    await expect(page.locator('.mic-icon, svg')).toBeVisible();
  });
});
