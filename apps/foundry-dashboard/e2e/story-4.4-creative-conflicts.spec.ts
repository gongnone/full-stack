import { test, expect } from '@playwright/test';

test.describe('Story 4.4: Creative Conflict Escalation', () => {
    test.beforeEach(async ({ page }) => {
        // In a real scenario, we might need to seed data or use a mock API
        await page.goto('/app/creative-conflicts');
    });

    test('should display creative conflicts dashboard with grouping', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Creative Conflicts');
        
        // Check for grouping headers (Hubs)
        await expect(page.locator('h2:has-text("Hub:")')).toBeVisible();
        
        // Check for at least one conflict card
        const conflictCards = page.locator('.bg-slate-900\/50.border.border-slate-800');
        await expect(conflictCards.first()).toBeVisible();
    });

    test('should filter by platform', async ({ page }) => {
        const platformSelect = page.locator('button:has-text("All Platforms")');
        await platformSelect.click();
        
        // Select Twitter if available
        const twitterOption = page.locator('span:has-text("Twitter")');
        if (await twitterOption.isVisible()) {
            await twitterOption.click();
            // Verify all cards are twitter
            const platformBadges = page.locator('.badge:has-text("twitter")');
            const totalCards = await page.locator('.conflict-card').count();
            if (totalCards > 0) {
                await expect(platformBadges).toHaveCount(totalCards);
            }
        }
    });

    test('should filter by gate failure', async ({ page }) => {
        const gateSelect = page.locator('button:has-text("Any Failure")');
        await gateSelect.click();
        
        await page.locator('span:has-text("G4 (Voice)")').click();
        
        // Verify only G4 failures are shown (this would need specific mock data to be reliable)
        const g4Badges = page.locator('div:has-text("G4: fail")');
        await expect(g4Badges.first()).toBeVisible();
    });

    test('should perform manual review actions', async ({ page }) => {
        // 1. Approve Anyway
        const approveButton = page.locator('button:has-text("Approve Anyway")').first();
        await approveButton.click();
        await expect(page.locator('text=Status updated successfully')).toBeVisible();

        // 2. Request Rewrite
        const rewriteButton = page.locator('button:has-text("Request Rewrite")').first();
        await rewriteButton.click();
        
        await expect(page.locator('text=Request Manual Rewrite')).toBeVisible();
        await page.fill('textarea', 'Please make the hook less salesy.');
        await page.click('button:has-text("Submit Feedback")');
        
        await expect(page.locator('text=Status updated successfully')).toBeVisible();
    });
});
