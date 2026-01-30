import { test, expect } from '@playwright/test';

const BASE = 'https://foundry-stage.williamjshaw.ca';

// Mobile iPhone viewport
test.use({ viewport: { width: 390, height: 844 } });

test.describe('Auth UX Hardening — Mobile First', () => {

  test('AC1: Signup has inline password validation checklist', async ({ page }) => {
    await page.goto(`${BASE}/signup`);
    await page.waitForLoadState('networkidle');

    // Password field should use PasswordInput (has show/hide button)
    const eyeBtn = page.locator('button[aria-label*="password" i], button[aria-label*="Password" i]');
    await expect(eyeBtn.first()).toBeVisible();

    // Checklist hidden when empty — hint text visible instead
    await expect(page.locator('text=12')).toBeVisible(); // "12+ characters" or "12–128 characters"
    
    // Type a weak password — checklist appears
    await page.fill('#password', 'weak');
    await page.waitForTimeout(300);
    
    // Should show requirement indicators
    await expect(page.locator('text=Uppercase')).toBeVisible();
    await expect(page.locator('text=Lowercase')).toBeVisible();
    await expect(page.locator('text=Number')).toBeVisible();
    await expect(page.locator('text=Special')).toBeVisible();
    await expect(page.locator('text=characters')).toBeVisible();

    // minLength and maxLength HTML attributes
    const pwInput = page.locator('#password');
    await expect(pwInput).toHaveAttribute('minlength', '12');
    await expect(pwInput).toHaveAttribute('maxlength', '128');
    await expect(pwInput).toHaveAttribute('autocomplete', 'new-password');

    // Confirm password mismatch warning
    await page.fill('#confirmPassword', 'different');
    await page.waitForTimeout(300);
    await expect(page.locator('text=do not match')).toBeVisible();
  });

  test('AC2: Signup auto-logs in and redirects to /app', async ({ page }) => {
    await page.goto(`${BASE}/signup`);
    await page.waitForLoadState('networkidle');

    const email = `e2e-signup-${Date.now()}@example.com`;
    await page.fill('#name', 'E2E Signup Test');
    await page.fill('#email', email);
    await page.fill('#password', 'E2eTest!ng99');
    await page.fill('#confirmPassword', 'E2eTest!ng99');

    // Submit
    await page.click('button[type="submit"]');

    // Should show loading state
    await expect(page.locator('text=Creating account')).toBeVisible({ timeout: 2000 });

    // Form fields should be disabled during submission
    await expect(page.locator('#name')).toBeDisabled();
    await expect(page.locator('#email')).toBeDisabled();

    // Should redirect to /app after signup (auto-login)
    await page.waitForURL('**/app**', { timeout: 15000 });
    expect(page.url()).toContain('/app');
  });

  test('AC3: Login has forgot password link and proper UX', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');

    // Forgot password link visible
    const forgotLink = page.locator('a[href*="forgot-password"], a:has-text("Forgot password")');
    await expect(forgotLink).toBeVisible();

    // Password field has show/hide toggle
    const eyeBtn = page.locator('button[aria-label*="password" i], button[aria-label*="Password" i]');
    await expect(eyeBtn.first()).toBeVisible();

    // maxLength on password
    await expect(page.locator('#password')).toHaveAttribute('maxlength', '128');
    await expect(page.locator('#password')).toHaveAttribute('autocomplete', 'current-password');
  });

  test('AC4: Forgot password page works end-to-end', async ({ page }) => {
    await page.goto(`${BASE}/forgot-password`);
    await page.waitForLoadState('networkidle');

    // Page renders
    await expect(page.locator('text=Reset your password')).toBeVisible();
    await expect(page.locator('button:has-text("Send reset link")')).toBeVisible();
    await expect(page.locator('a:has-text("Sign in")')).toBeVisible();

    // Submit with email
    await page.fill('#email', 'test@example.com');
    await page.click('button:has-text("Send reset link")');

    // Loading state
    await expect(page.locator('text=Sending')).toBeVisible({ timeout: 2000 });

    // Success state
    await expect(page.locator('text=Check your email')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=test@example.com')).toBeVisible();
    await expect(page.locator('text=Try a different email')).toBeVisible();
  });

  test('AC5: Reset password page handles missing token', async ({ page }) => {
    await page.goto(`${BASE}/reset-password`);
    await page.waitForLoadState('networkidle');

    // Should show error for missing token
    await expect(page.locator('text=Invalid or missing')).toBeVisible();
    await expect(page.locator('a:has-text("Request a new reset link")')).toBeVisible();
  });

  test('AC5b: Reset password page renders form with token', async ({ page }) => {
    await page.goto(`${BASE}/reset-password?token=fake-token-for-test`);
    await page.waitForLoadState('networkidle');

    // Should show the password form
    await expect(page.locator('text=Set new password')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
    await expect(page.locator('button:has-text("Reset password")')).toBeVisible();

    // Has same inline checklist as signup
    await page.fill('#password', 'weak');
    await page.waitForTimeout(300);
    await expect(page.locator('text=Uppercase')).toBeVisible();
    await expect(page.locator('text=Special')).toBeVisible();
  });

  test('AC6: Onboarding has subtle sign-out, not card', async ({ page }) => {
    // Create a fresh account to see onboarding
    const email = `e2e-onboard-${Date.now()}@example.com`;
    
    // Sign up via API
    await page.request.post(`${BASE}/api/auth/sign-up/email`, {
      data: { name: 'Onboard Test', email, password: 'E2eTest!ng99' }
    });

    // Login
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('#email', email);
    await page.fill('#password', 'E2eTest!ng99');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app**', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Should NOT have the full sign-out card
    const signOutCard = page.locator('text=Sign out of your current session');
    await expect(signOutCard).not.toBeVisible();

    // Should have subtle sign-out link
    const signOutLink = page.locator('text=Sign out');
    await expect(signOutLink.first()).toBeVisible();
  });

  test('AC3b: Login error clears spinner and re-enables form', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');

    await page.fill('#email', 'nonexistent@example.com');
    await page.fill('#password', 'WrongPassword1!');
    await page.click('button[type="submit"]');

    // Spinner should appear
    await expect(page.locator('text=Signing in')).toBeVisible({ timeout: 2000 });

    // After error, spinner should disappear and button should say "Sign in" again
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible({ timeout: 10000 });

    // Form fields should be re-enabled
    await expect(page.locator('#email')).toBeEnabled();
    await expect(page.locator('#password')).toBeEnabled();

    // Error message visible
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('AC4b: Forgot password with invalid email still shows success (no leak)', async ({ page }) => {
    await page.goto(`${BASE}/forgot-password`);
    await page.waitForLoadState('networkidle');

    // Submit with email that doesn't exist
    await page.fill('#email', 'doesnotexist@nowhere.fake');
    await page.click('button:has-text("Send reset link")');

    // Should still show success (don't reveal if email exists)
    await expect(page.locator('text=Check your email')).toBeVisible({ timeout: 10000 });
  });

  test('AC2b: Signup with existing email shows clear error', async ({ page }) => {
    // First create an account
    const email = `e2e-dupe-${Date.now()}@example.com`;
    await page.request.post(`${BASE}/api/auth/sign-up/email`, {
      data: { name: 'Dupe Test', email, password: 'E2eTest!ng99' }
    });

    // Try to sign up again with same email
    await page.goto(`${BASE}/signup`);
    await page.waitForLoadState('networkidle');
    await page.fill('#name', 'Dupe Test');
    await page.fill('#email', email);
    await page.fill('#password', 'E2eTest!ng99');
    await page.fill('#confirmPassword', 'E2eTest!ng99');
    await page.click('button[type="submit"]');

    // Should show error, NOT spinner forever
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Create account")')).toBeVisible();
    await expect(page.locator('#email')).toBeEnabled();
  });

  test('AC7: HTML responses have cache-busting headers', async ({ request }) => {
    const res = await request.get(`${BASE}/`);
    const cacheControl = res.headers()['cache-control'] || '';
    // Cloudflare Assets serves with max-age=0, must-revalidate which forces revalidation
    expect(cacheControl).toMatch(/max-age=0|no-cache|must-revalidate/);

    const res2 = await request.get(`${BASE}/login`);
    const cc2 = res2.headers()['cache-control'] || '';
    expect(cc2).toMatch(/max-age=0|no-cache|must-revalidate/);
  });

  test('AC8: JS bundle is fresh (contains forgot-password route)', async ({ request }) => {
    const html = await (await request.get(`${BASE}/`)).text();
    const jsMatch = html.match(/assets\/([^"]+\.js)/);
    expect(jsMatch).toBeTruthy();

    const jsRes = await request.get(`${BASE}/assets/${jsMatch![1]}`);
    const jsContent = await jsRes.text();
    expect(jsContent).toContain('forgot-password');
    expect(jsContent).toContain('reset-password');
    expect(jsContent).toContain('Reset your password');
  });
});
