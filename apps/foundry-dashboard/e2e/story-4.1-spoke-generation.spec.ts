import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = 'test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';

test.describe('Story 4.1: Spoke Generation', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[type="email"]', TEST_EMAIL);
        await page.fill('input[type="password"]', TEST_PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/app/);
    });

    test('should generate spokes and display them in the tree view', async ({ page }) => {
        // 1. Navigate to the hub detail page
        await page.goto('/app/hubs/123'); // TODO: use a real hub id

        // 2. Click the "Generate Spokes" button
        await page.click('text=Generate Spokes');

        // 3. Wait for the spokes to be generated and displayed in the tree view
        await page.waitForSelector('text=Pillar 123');
        await page.waitForSelector('text=twitter');

        // 4. Filter the spokes by platform and verify that the filter works
        await page.selectOption('select', 'twitter');
        await expect(page.locator('text=linkedin')).not.toBeVisible();
    });
});
