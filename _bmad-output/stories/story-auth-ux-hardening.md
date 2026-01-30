# Story: Auth UX Hardening (Mobile-First)

## Summary
Harden the authentication flow (signup, login, forgot/reset password, onboarding) for mobile users. Every screen must be tested on mobile viewport before shipping.

## Acceptance Criteria

### AC1: Signup — Inline Password Validation
- [ ] Password field uses `PasswordInput` component (show/hide toggle)
- [ ] As user types password, live checklist shows ✓/○ for: 12+ chars, uppercase, lowercase, number, special character
- [ ] Checklist hidden when password field is empty, shows hint text instead
- [ ] Confirm password shows inline "Passwords do not match" when values differ
- [ ] Submit button disabled after first failed attempt if requirements not met
- [ ] `minLength` and `maxLength` HTML attributes set for mobile browser hints
- [ ] `autoComplete="new-password"` on both password fields

### AC2: Signup — Auto-Login After Account Creation
- [ ] After successful signup, user is redirected to `/app` with active session
- [ ] Session cookie is set (user does NOT need to log in again)
- [ ] Loading spinner visible during signup API call (3-4 second D1 write)
- [ ] All form fields disabled during submission (no double-submit)
- [ ] Error messages display clearly in alert banner

### AC3: Login — Forgot Password Link
- [ ] "Forgot password?" link visible next to Password label
- [ ] Link navigates to `/forgot-password`
- [ ] Login form has spinner + disabled fields during submission
- [ ] `autoComplete="current-password"` on password field
- [ ] `maxLength={128}` on password field

### AC4: Forgot Password Page (`/forgot-password`)
- [ ] Page renders at `/forgot-password` route
- [ ] Email input with "Send reset link" button
- [ ] On submit: calls `POST /api/auth/request-password-reset`
- [ ] Success state: shows "Check your email" message with 📧 icon
- [ ] "Try a different email" button resets form
- [ ] "Sign in" link back to login page
- [ ] Spinner + disabled form during submission

### AC5: Reset Password Page (`/reset-password?token=...`)
- [ ] Page renders at `/reset-password` route
- [ ] Without token: shows "Invalid or missing reset token" with link to request new one
- [ ] With token: shows new password form with same inline checklist as signup
- [ ] Confirm password with inline mismatch warning
- [ ] On submit: calls `POST /api/auth/reset-password` with token + newPassword
- [ ] Success state: shows "Password reset!" with "Go to Sign In" button
- [ ] Expired/invalid token: shows error message
- [ ] Spinner + disabled form during submission

### AC6: Onboarding — Clean Welcome Screen
- [ ] Sign out is a subtle text link with icon in top-right corner
- [ ] NOT the full SignOutButton card component (no heading, no description, no border)
- [ ] Welcome card centered, not overlapped by sign-out UI
- [ ] Mobile viewport: all elements visible without scrolling past sign-out card

### AC7: Cache Busting
- [ ] HTML responses include `Cache-Control: no-cache, no-store, must-revalidate`
- [ ] HTML responses include `Pragma: no-cache`
- [ ] JS/CSS assets use content-hashed filenames (Vite default)

### AC8: Deployment Integrity
- [ ] `npm run build` (Vite) runs before every `wrangler deploy`
- [ ] `dist/` contains freshly built assets matching current source code
- [ ] Deploy script exists at `scripts/deploy-stage.sh`

## Out of Scope
- Email template styling (uses Better Auth defaults)
- OAuth password reset flows
- Rate limiting on reset requests (handled by Better Auth)
