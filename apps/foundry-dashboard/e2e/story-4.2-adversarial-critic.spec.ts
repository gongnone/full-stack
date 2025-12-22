import { test, expect } from '@playwright/test';

test.describe('Story 4.2: Adversarial Critic Service', () => {
    test('should display spoke evaluations and "Why" hover', async ({ page }) => {
        // 1. Navigate to the hub detail page
        await page.goto('/app/hubs/123'); // TODO: use a real hub id

        // 2. Wait for spokes to be loaded
        await page.waitForSelector('text=Pillar 123');

        // 3. Find a spoke and its gate badges
        const spokeNode = page.locator('.spoke-node').first(); // Assuming a class for spoke nodes
        const g2Badge = spokeNode.locator('text=G2');
        const g4Badge = spokeNode.locator('text=G4');
        const g5Badge = spokeNode.locator('text=G5');

        // 4. Assert that the badges are visible
        await expect(g2Badge).toBeVisible();
        await expect(g4Badge).toBeVisible();
        await expect(g5Badge).toBeVisible();

        // 5. Hover over the G2 badge and check the tooltip
        await g2Badge.hover();
        await page.waitForSelector('text=Hook Strength');
        await expect(page.locator('text=Pattern Interrupt')).toBeVisible();
        await expect(page.locator('text=Benefit Signal')).toBeVisible();
        await expect(page.locator('text=Curiosity Gap')).toBeVisible();
    });
});
