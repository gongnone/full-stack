/**
 * E2E Tests: FR-1.5.16 Testimonial Request Modal
 *
 * Tests the testimonial request flow that triggers after batch approval.
 *
 * Acceptance Criteria:
 * - AC-1: Testimonial prompt triggers after batch approval (10+ spokes)
 * - AC-2: Sentiment check gates testimonial request
 * - AC-3: Accept → Shows recording interface
 * - AC-4: Snooze → Saves with snooze count, max 2 reminders
 * - AC-5: Decline → Saves as declined, no follow-up
 * - AC-6: Data integrity verified
 *
 * @tags @P1 @testimonials @sprint-complete
 */

import { test, expect } from '@playwright/test';

test.describe('FR-1.5.16: Testimonial Request Modal', () => {
  test.beforeEach(async ({ page: _page }) => {
    // TODO: Login with test user and navigate to review page
    // await loginAsTestUser(page);
    // await createTestClient(page);
    // await createTestSpokes(page, { count: 10, status: 'approved' });
  });

  test('AC-1: Modal triggers after 10+ spoke approvals @P1', async ({ page: _page }) => {
    test.skip(true, 'Requires test data seeding infrastructure');

    // Navigate to review page with 10+ approved spokes
    await page.goto('/app/review?clientId=test-client-123&filter=all');

    // Complete sprint (approve all remaining spokes)
    // This should trigger SprintComplete component

    // After 2-second delay, testimonial modal should appear
    await expect(page.getByText(/How's it going so far/i)).toBeVisible({
      timeout: 5000,
    });

    // Modal should show approved count
    await expect(page.getByText(/You've approved \d+ pieces of content/i)).toBeVisible();
  });

  test('AC-2: Sentiment "excited" allows testimonial request @P1', async ({ page: _page }) => {
    test.skip(true, 'Requires test data seeding infrastructure');

    // Trigger modal
    await page.goto('/app/review?clientId=test-client-123&showTestimonialModal=true');

    // Wait for sentiment check step
    await expect(page.getByText(/How's it going so far/i)).toBeVisible();

    // Select "Loving it!" (excited sentiment)
    await page.getByRole('button', { name: /Loving it/i }).click();

    // Should show testimonial request step
    await expect(
      page.getByText(/Would you mind sharing a quick testimonial/i)
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Yes, I'd love to/i })).toBeVisible();
  });

  test('AC-2: Sentiment "solid" allows testimonial request @P1', async ({ page: _page }) => {
    test.skip(true, 'Requires test data seeding infrastructure');

    await page.goto('/app/review?clientId=test-client-123&showTestimonialModal=true');
    await expect(page.getByText(/How's it going so far/i)).toBeVisible();

    // Select "Solid" sentiment
    await page.getByRole('button', { name: /Solid/i }).click();

    // Should still show testimonial request
    await expect(
      page.getByText(/Would you mind sharing a quick testimonial/i)
    ).toBeVisible();
  });

  test('AC-2: Sentiment "needs_work" skips testimonial, offers support @P1', async ({
    page,
  }) => {
    test.skip(true, 'Requires test data seeding infrastructure');

    await page.goto('/app/review?clientId=test-client-123&showTestimonialModal=true');
    await expect(page.getByText(/How's it going so far/i)).toBeVisible();

    // Select "Needs work" sentiment
    await page.getByRole('button', { name: /Needs work/i }).click();

    // Should show support message toast
    await expect(
      page.getByText(/Thanks for your feedback! We're here to help/i)
    ).toBeVisible();

    // Modal should close (not show testimonial request)
    await expect(page.getByText(/Would you mind sharing/i)).not.toBeVisible({
      timeout: 3000,
    });
  });

  test('AC-3: Accept shows VideoRecorder with 60s max duration @P1', async ({ page: _page }) => {
    test.skip(true, 'Requires test data seeding infrastructure');

    await page.goto('/app/review?clientId=test-client-123&showTestimonialModal=true');

    // Navigate through sentiment to request step
    await expect(page.getByText(/How's it going so far/i)).toBeVisible();
    await page.getByRole('button', { name: /Loving it/i }).click();

    // Accept testimonial request
    await page.getByRole('button', { name: /Yes, I'd love to/i }).click();

    // Should show video recording interface
    await expect(page.getByText(/Record Your Testimonial/i)).toBeVisible();
    await expect(page.getByText(/Keep it under 60 seconds/i)).toBeVisible();

    // Should show VideoRecorder component with video element
    await expect(page.locator('video')).toBeVisible();
  });

  test('AC-4: Snooze saves request with snooze_count=1 @P1', async ({ page: _page }) => {
    test.skip(true, 'Requires test data seeding infrastructure');

    await page.goto('/app/review?clientId=test-client-123&showTestimonialModal=true');

    // Navigate to request step
    await expect(page.getByText(/How's it going so far/i)).toBeVisible();
    await page.getByRole('button', { name: /Loving it/i }).click();

    // Click "Ask me later"
    await page.getByRole('button', { name: /Ask me later/i }).click();

    // Should show snooze confirmation toast
    await expect(page.getByText(/We'll remind you later/i)).toBeVisible();

    // TODO: Verify database using tRPC call or direct D1 query:
    // - status = 'snoozed'
    // - snooze_count = 1
    // - sentiment = 'excited'
  });

  test('AC-4: Second snooze increments snooze_count to 2 @P1', async ({ page: _page }) => {
    test.skip(true, 'Requires test data seeding infrastructure');

    // Setup: Create existing snoozed request with snooze_count=1
    // await createTestimonialRequest(page, { status: 'snoozed', snooze_count: 1 });

    await page.goto('/app/review?clientId=test-client-123&showTestimonialModal=true');

    // Snooze again
    await expect(page.getByText(/How's it going so far/i)).toBeVisible();
    await page.getByRole('button', { name: /Loving it/i }).click();
    await page.getByRole('button', { name: /Ask me later/i }).click();

    // TODO: Verify database has snooze_count=2
  });

  test('AC-4: Third snooze should not trigger modal (max 2 reminders) @P1', async ({
    page,
  }) => {
    test.skip(true, 'Requires test data seeding infrastructure');

    // Setup: Create existing snoozed request with snooze_count=2
    // await createTestimonialRequest(page, { status: 'snoozed', snooze_count: 2 });

    // Complete another sprint
    await page.goto('/app/review?clientId=test-client-123&filter=all');
    // (approve more spokes to complete sprint...)

    // Modal should NOT appear (snooze count limit reached)
    await expect(page.getByText(/How's it going so far/i)).not.toBeVisible({
      timeout: 5000,
    });
  });

  test('AC-5: Decline saves as declined, never triggers again @P1', async ({ page: _page }) => {
    test.skip(true, 'Requires test data seeding infrastructure');

    await page.goto('/app/review?clientId=test-client-123&showTestimonialModal=true');

    // Navigate to request step
    await expect(page.getByText(/How's it going so far/i)).toBeVisible();
    await page.getByRole('button', { name: /Loving it/i }).click();

    // Click "No thanks"
    await page.getByRole('button', { name: /No thanks/i }).click();

    // Should show decline confirmation toast
    await expect(page.getByText(/No problem! Thanks for letting us know/i)).toBeVisible();

    // TODO: Verify database has status='declined'

    // Complete another sprint - modal should NOT appear
    await page.goto('/app/review?clientId=test-client-123&filter=all');
    // (approve more spokes...)
    await expect(page.getByText(/How's it going so far/i)).not.toBeVisible({
      timeout: 5000,
    });
  });

  test('AC-6: Video upload flow completes successfully @P1', async ({ page: _page }) => {
    test.skip(true, 'Requires camera permissions and test infrastructure');

    await page.goto('/app/review?clientId=test-client-123&showTestimonialModal=true');

    // Navigate to recording step
    await expect(page.getByText(/How's it going so far/i)).toBeVisible();
    await page.getByRole('button', { name: /Loving it/i }).click();
    await page.getByRole('button', { name: /Yes, I'd love to/i }).click();

    // VideoRecorder component should be visible
    await expect(page.locator('video')).toBeVisible();

    // Note: Playwright cannot actually use camera in headless mode
    // Would need to mock MediaRecorder API for automated testing

    // Simulate successful upload (would require mocking)
    // After upload: should show progress bar, then complete step

    await expect(page.getByText(/Thank you/i)).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByText(/Your testimonial has been submitted/i)
    ).toBeVisible();

    // TODO: Verify database record:
    // - r2_key populated with testimonials/{clientId}/{timestamp}-testimonial.webm
    // - duration > 0
    // - status = 'approved'
    // - type = 'video'
  });

  test('AC-6: Upload error shows error message and returns to request @P1', async ({
    page,
  }) => {
    test.skip(true, 'Requires network mocking infrastructure');

    await page.goto('/app/review?clientId=test-client-123&showTestimonialModal=true');

    // Navigate to recording step
    await expect(page.getByText(/How's it going so far/i)).toBeVisible();
    await page.getByRole('button', { name: /Loving it/i }).click();
    await page.getByRole('button', { name: /Yes, I'd love to/i }).click();

    // Simulate upload failure (mock network error)
    // await page.route('/api/upload/testimonials/**', (route) => route.abort());

    // Complete recording and attempt upload
    // (Would require camera mock)

    // Should show error toast
    await expect(
      page.getByText(/Failed to submit testimonial. Please try again/i)
    ).toBeVisible();

    // Should return to request step (not crash or get stuck)
    await expect(
      page.getByText(/Would you mind sharing a quick testimonial/i)
    ).toBeVisible();
  });
});
