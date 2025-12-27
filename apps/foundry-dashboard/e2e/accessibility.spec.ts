import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (A11y)', () => {
  test('Login Page should pass full WCAG AA validation', async ({ page }) => {
    await page.goto('/login');

    // Wait for page to fully load - CardTitle renders as h3
    await expect(page.locator('h3')).toContainText('Sign in to Foundry');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging (if any)
    if (accessibilityScanResults.violations.length > 0) {
      console.log('A11y violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Signup Page should pass full WCAG AA validation', async ({ page }) => {
    await page.goto('/signup');

    // Wait for page to load - CardTitle renders as h3
    await expect(page.locator('h3')).toContainText('Create an account');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('A11y violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Form inputs should have accessible labels', async ({ page }) => {
    await page.goto('/login');

    // Check that form inputs have associated labels
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Verify inputs are keyboard accessible
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(passwordInput).toBeFocused();
  });
});
