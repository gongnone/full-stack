# Story 1.2: Better Auth Integration with OAuth

Status: done

## Story

As a **user**,
I want **to sign up and log in using Google or email/password**,
So that **I can securely access my Executive Producer Dashboard**.

## Acceptance Criteria

### AC1: Google OAuth Login
**Given** I am on the login page
**When** I click "Continue with Google"
**Then** I am redirected to Google OAuth consent
**And** after approval, I am logged in and redirected to `/app`

### AC2: Email/Password Registration
**Given** I am on the registration page
**When** I enter a valid email and password
**Then** my account is created in the `user` table
**And** I receive a session cookie
**And** I am redirected to `/app`

### AC3: Email/Password Login
**Given** I have an existing account
**When** I enter correct credentials
**Then** I am authenticated and redirected to `/app`
**And** my session expires after 7 days

### AC4: Invalid Credentials Error
**Given** I enter incorrect credentials
**When** I submit the login form
**Then** I see an error message "Invalid email or password"

### AC5: GitHub OAuth Login (Bonus)
**Given** I am on the login page
**When** I click "Continue with GitHub"
**Then** I am redirected to GitHub OAuth consent
**And** after approval, I am logged in and redirected to `/app`

## Tasks / Subtasks

- [x] **Task 1: Add Social Login UI Components**
  - [x] Create Google sign-in button component (inline SVG icon)
  - [x] Create GitHub sign-in button component (inline SVG icon)
  - [x] Add social buttons to login page with divider
  - [x] Add social buttons to signup page with divider

- [x] **Task 2: Configure OAuth Client**
  - [x] signIn.social() already exported from auth-client
  - [x] OAuth redirect flow configured in Better Auth

- [x] **Task 3: Update Environment Configuration**
  - [x] Add OAuth env vars to .dev.vars.example
  - [x] Document OAuth setup with callback URLs

- [ ] **Task 4: Test OAuth Flow** (requires credentials)
  - [ ] Test Google OAuth login (requires real credentials)
  - [ ] Test GitHub OAuth login (requires real credentials)
  - [ ] Verify session creation after OAuth

## Dev Notes

### OAuth Configuration

The Better Auth config already has OAuth providers configured in `worker/auth/index.ts`:

```typescript
socialProviders: {
  google: {
    clientId: env.GOOGLE_CLIENT_ID || '',
    clientSecret: env.GOOGLE_CLIENT_SECRET || '',
    enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  },
  github: {
    clientId: env.GITHUB_CLIENT_ID || '',
    clientSecret: env.GITHUB_CLIENT_SECRET || '',
    enabled: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
  },
},
```

### OAuth Setup Instructions

1. **Google OAuth:**
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URI: `http://localhost:8787/api/auth/callback/google`
   - Copy Client ID and Secret to `.dev.vars`

2. **GitHub OAuth:**
   - Go to GitHub → Settings → Developer Settings → OAuth Apps
   - Create new OAuth App
   - Add authorization callback URL: `http://localhost:8787/api/auth/callback/github`
   - Copy Client ID and Secret to `.dev.vars`

### UI Design

- Social buttons should be above the email/password form
- Use "or" divider between social and email options
- Match Midnight Command theme (dark mode)
- Button styles: outlined with hover effects

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Checklist

- [x] Social login buttons added to login page
- [x] Social login buttons added to signup page
- [x] OAuth client methods exported (signIn.social)
- [x] .dev.vars.example updated with OAuth vars
- [x] TypeScript compiles without errors
- [ ] OAuth flow tested (requires credentials - manual verification)

### Completion Notes

1. **Task 1 Complete:** Added Google and GitHub social login buttons to both login and signup pages. Buttons use inline SVG icons for brand logos. Added "Or continue with email" divider between social buttons and email/password form.

2. **Task 2 Complete:** The auth-client already exports `signIn.social()` method from Better Auth. OAuth providers are conditionally enabled based on env vars being present.

3. **Task 3 Complete:** Updated `.dev.vars.example` with detailed OAuth setup instructions including:
   - Google OAuth: Console URL, callback URIs for local and production
   - GitHub OAuth: Developer settings URL, callback URIs for local and production

4. **Task 4 Note:** OAuth flow requires actual OAuth credentials to test. The UI implementation is complete - buttons will redirect to OAuth provider when credentials are configured.

### Files Modified

**Frontend:**
- `src/routes/login.tsx` - Added social login buttons, handleSocialSignIn function, loading states
- `src/routes/signup.tsx` - Added social login buttons, handleSocialSignIn function, loading states

**Configuration:**
- `.dev.vars.example` - Added OAuth provider setup instructions

### Security Notes

- OAuth providers are conditionally enabled (`enabled: !!(env.CLIENT_ID && env.CLIENT_SECRET)`)
- Social login buttons gracefully handle errors without exposing OAuth configuration
- Account linking enabled for trusted providers (Google, GitHub)

### Testing Instructions

To test OAuth flow:

1. **Google OAuth:**
   ```bash
   # Add to .dev.vars:
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
   - Callback URL: `http://localhost:8787/api/auth/callback/google`

2. **GitHub OAuth:**
   ```bash
   # Add to .dev.vars:
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```
   - Callback URL: `http://localhost:8787/api/auth/callback/github`

3. Start the dev server:
   ```bash
   pnpm dev && pnpm dev:worker
   ```

4. Navigate to `http://localhost:5173/login` and click social buttons

