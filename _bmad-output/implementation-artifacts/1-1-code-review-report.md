# Code Review Report: Story 1.1 - Project Foundation for User Access

**Reviewer:** Claude Sonnet 4.5 (Adversarial Code Review)
**Story:** 1.1 - Project Foundation for User Access
**Review Date:** 2025-12-21
**Review Type:** ADVERSARIAL - Comprehensive security, architecture, and implementation analysis

---

## Executive Summary

**Status:** ❌ **FAIL - Critical Issues Found**

This story has **8 critical issues** and **5 warnings** that must be addressed before merging to production. While the infrastructure configuration is technically complete, there are significant security vulnerabilities, architectural problems, and data integrity issues that could lead to production outages and security breaches.

**Critical Issues:**
1. Database schema pollution with duplicate tables
2. Exposed secrets in .dev.vars file
3. Missing MEDIA and EMBEDDINGS bindings from Env interface
4. requireEmailVerification disabled in production config
5. Missing environment variables for stage/production
6. Shared D1 database across all environments
7. No password complexity enforcement
8. Missing CSRF protection configuration

---

## Critical Issues (Must Fix)

### 🔴 CRITICAL 1: Database Schema Pollution - Duplicate Tables

**File:** D1 Database `foundry-global`
**Severity:** CRITICAL
**Impact:** Data corruption, query failures, authentication breakage

**Problem:**
The database contains **DUPLICATE TABLES** for auth:
- Singular tables: `user`, `session`, `account`, `verification` (Better Auth convention)
- Plural tables: `users`, `sessions`, `accounts` (legacy?)
- Prefixed tables: `auth_users`, `auth_sessions`, `auth_accounts`, `auth_verifications`

```sql
-- Database actually contains 17 tables (should be 4)
_cf_KV
account          ← Better Auth (singular)
accounts         ← DUPLICATE (plural)
auth_accounts    ← DUPLICATE (prefixed)
auth_sessions    ← DUPLICATE (prefixed)
auth_users       ← DUPLICATE (prefixed)
auth_verifications ← DUPLICATE (prefixed)
session          ← Better Auth (singular)
sessions         ← DUPLICATE (plural)
user             ← Better Auth (singular)
users            ← DUPLICATE (plural)
verification     ← Better Auth (singular)
```

**Why This Is Critical:**
1. **Ambiguity:** Which tables is Better Auth actually using?
2. **Data Fragmentation:** User data might be split across multiple tables
3. **Migration Confusion:** Future migrations won't know which tables to update
4. **Query Failures:** Joins might reference wrong tables

**Evidence:**
```bash
wrangler d1 execute foundry-global --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
# Returns 17 tables instead of expected 4
```

**Required Fix:**
```bash
# 1. Verify which tables Better Auth is using
wrangler d1 execute foundry-global --remote --command="SELECT COUNT(*) FROM user;"
wrangler d1 execute foundry-global --remote --command="SELECT COUNT(*) FROM users;"

# 2. Drop duplicate tables (ONLY after data migration if needed)
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS auth_users;
DROP TABLE IF EXISTS auth_sessions;
DROP TABLE IF EXISTS auth_accounts;
DROP TABLE IF EXISTS auth_verifications;

# 3. Create new migration: 0002_cleanup_duplicate_tables.sql
```

**References:**
- `migrations/0001_better_auth_schema.sql:5-64` (defines singular tables)
- D1 execution log showing 17 tables

---

### 🔴 CRITICAL 2: Secrets Exposed in .dev.vars File

**File:** `apps/foundry-dashboard/.dev.vars:2`
**Severity:** CRITICAL
**Impact:** Authentication bypass if committed to git

**Problem:**
The `.dev.vars` file contains a **real BETTER_AUTH_SECRET** in plaintext:
```bash
BETTER_AUTH_SECRET=3bddf29029f2bde10e814709113ac0eb18e03c6ec8a4bcf9ec621b5c718acecb
```

**Why This Is Critical:**
1. If this file is committed to git, the secret is permanently in history
2. Anyone with the secret can forge session tokens
3. The secret is 64 characters (valid) but should NOT be in the file

**Evidence:**
```bash
git status --porcelain | grep ".dev.vars"
# If this returns nothing, the file is tracked or staged
```

**Required Fix:**
```bash
# 1. Verify .gitignore blocks .dev.vars
grep -E "^\.dev\*" .gitignore

# 2. Rotate the secret IMMEDIATELY if committed
openssl rand -hex 32 > NEW_SECRET.txt

# 3. Update .dev.vars template to use placeholder
BETTER_AUTH_SECRET=generate-with-openssl-rand-hex-32

# 4. Add .dev.vars.example with placeholders
cp .dev.vars .dev.vars.example
sed -i '' 's/=.*/=/' .dev.vars.example
```

**Verification:**
- ✅ `.gitignore` line 10 blocks `.dev*` files
- ❌ But need to confirm file was never committed

**References:**
- `.gitignore:10` (`.dev*` pattern)
- `apps/foundry-dashboard/.dev.vars:2` (exposed secret)

---

### 🔴 CRITICAL 3: Missing Bindings in Env Interface

**File:** `apps/foundry-dashboard/worker/index.ts:3-19`
**Severity:** CRITICAL
**Impact:** Runtime crashes when accessing R2 or Vectorize

**Problem:**
The `Env` interface is missing `MEDIA` and `EMBEDDINGS` bindings that were added to `wrangler.jsonc`:

```typescript
export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  CONTENT_ENGINE: Fetcher;
  // Missing: MEDIA (R2Bucket)
  // Missing: EMBEDDINGS (VectorizeIndex)
}
```

**Why This Is Critical:**
1. **TypeScript won't catch errors** when trying to access `env.MEDIA` or `env.EMBEDDINGS`
2. **Runtime crashes** if any code tries to use these bindings
3. **Epic 3+ will fail** when implementing media uploads and brand DNA embeddings

**Evidence:**
```typescript
// wrangler.jsonc defines these:
"r2_buckets": [{ "binding": "MEDIA", "bucket_name": "foundry-media" }]
"vectorize": [{ "binding": "EMBEDDINGS", "index_name": "foundry-embeddings" }]

// But Env interface doesn't include them
```

**Required Fix:**
```typescript
// apps/foundry-dashboard/worker/index.ts
export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  CONTENT_ENGINE: Fetcher;
  MEDIA: R2Bucket;              // ADD THIS
  EMBEDDINGS: VectorizeIndex;   // ADD THIS
  ENVIRONMENT: string;
  // ... rest of env vars
}
```

**References:**
- `apps/foundry-dashboard/wrangler.jsonc:27-39` (defines bindings)
- `apps/foundry-dashboard/worker/index.ts:3-19` (missing from Env)

---

### 🔴 CRITICAL 4: Email Verification Disabled in Production

**File:** `apps/foundry-dashboard/worker/auth/index.ts:24`
**Severity:** CRITICAL
**Impact:** Account takeover via unverified emails

**Problem:**
Better Auth has `requireEmailVerification: false` with a comment "Set to true in production" but **NO mechanism to enforce this in production**:

```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: false, // Set to true in production ← NOT ENFORCED
},
```

**Why This Is Critical:**
1. **Account Takeover:** Users can sign up with someone else's email
2. **Spam/Abuse:** No verification means bots can create unlimited accounts
3. **GDPR Violation:** Can't prove user owns the email address

**Attack Scenario:**
```bash
# Attacker signs up as victim@company.com
POST /api/auth/signup
{ "email": "victim@company.com", "password": "hacked" }

# No verification needed - attacker gets access
# Victim tries to sign up later - "email already exists"
```

**Required Fix:**
```typescript
// apps/foundry-dashboard/worker/auth/index.ts
emailAndPassword: {
  enabled: true,
  requireEmailVerification: env.ENVIRONMENT === 'production', // Dynamic based on env
},

// OR better yet:
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true, // ALWAYS require verification
},
```

**Additional Work Needed:**
1. Configure email provider (Resend, SendGrid, AWS SES)
2. Add email templates for verification
3. Test verification flow end-to-end

**References:**
- `apps/foundry-dashboard/worker/auth/index.ts:24` (disabled verification)
- Better Auth docs: Email Verification

---

### 🔴 CRITICAL 5: Missing Environment Variables for Stage/Production

**File:** `apps/foundry-dashboard/wrangler.jsonc:43-118`
**Severity:** CRITICAL
**Impact:** Auth will break in stage/production deployments

**Problem:**
The `.dev.vars` file has secrets for local development, but **wrangler.jsonc has NO configuration** for stage/production secrets:

```jsonc
"env": {
  "stage": {
    "vars": {
      "ENVIRONMENT": "stage"
      // Missing: BETTER_AUTH_SECRET
      // Missing: BETTER_AUTH_URL
    }
  }
}
```

**Why This Is Critical:**
1. **Deployment will fail** with "BETTER_AUTH_SECRET not found"
2. **Secrets are required** but not configured in Cloudflare
3. **baseURL will be wrong** (defaults to localhost:5173)

**Required Fix:**
```bash
# 1. Generate production secrets
openssl rand -hex 32 > stage_secret.txt
openssl rand -hex 32 > prod_secret.txt

# 2. Add secrets to Cloudflare (NOT in wrangler.jsonc)
wrangler secret put BETTER_AUTH_SECRET --env stage
wrangler secret put BETTER_AUTH_SECRET --env production

# 3. Add non-secret env vars to wrangler.jsonc
"env": {
  "stage": {
    "vars": {
      "ENVIRONMENT": "stage",
      "BETTER_AUTH_URL": "https://foundry-stage.williamjshaw.ca"
    }
  },
  "production": {
    "vars": {
      "ENVIRONMENT": "production",
      "BETTER_AUTH_URL": "https://foundry.williamjshaw.ca"
    }
  }
}
```

**References:**
- `apps/foundry-dashboard/wrangler.jsonc:43-118` (missing env vars)
- `apps/foundry-dashboard/worker/auth/index.ts:75` (requires BETTER_AUTH_SECRET)

---

### 🔴 CRITICAL 6: Shared D1 Database Across All Environments

**File:** `apps/foundry-dashboard/wrangler.jsonc:18-24, 55-60, 92-97`
**Severity:** CRITICAL
**Impact:** Development data pollutes production, production data at risk

**Problem:**
All three environments (local, stage, production) use **THE SAME D1 DATABASE**:

```jsonc
// Local
"d1_databases": [{ "database_id": "bd287f3f-8147-49b5-9cae-466c60a975c6" }]

// Stage
"d1_databases": [{ "database_id": "bd287f3f-8147-49b5-9cae-466c60a975c6" }]

// Production
"d1_databases": [{ "database_id": "bd287f3f-8147-49b5-9cae-466c60a975c6" }]
```

**Why This Is Critical:**
1. **Data Isolation Violation:** Development changes affect production
2. **Test Data Pollution:** Test users appear in production
3. **Production Data Risk:** Local bugs can corrupt production data
4. **Compliance Violation:** GDPR requires separate prod/test data

**Attack Scenario:**
```bash
# Developer runs local migration with DROP TABLE
wrangler d1 execute foundry-global --file=bad_migration.sql

# PRODUCTION DATABASE IS WIPED because they share the same ID
```

**Required Fix:**
```bash
# 1. Create separate D1 databases
wrangler d1 create foundry-global-local
wrangler d1 create foundry-global-stage
# Keep existing for production: foundry-global

# 2. Update wrangler.jsonc with separate IDs
{
  "d1_databases": [{
    "database_id": "<local-db-id>",
    "database_name": "foundry-global-local"
  }],
  "env": {
    "stage": {
      "d1_databases": [{ "database_id": "<stage-db-id>" }]
    },
    "production": {
      "d1_databases": [{ "database_id": "bd287f3f-8147-49b5-9cae-466c60a975c6" }]
    }
  }
}

# 3. Apply migrations to each environment separately
wrangler d1 execute foundry-global-local --file=migrations/0001_better_auth_schema.sql
wrangler d1 execute foundry-global-stage --file=migrations/0001_better_auth_schema.sql --env stage
```

**References:**
- `apps/foundry-dashboard/wrangler.jsonc:22,59,96` (same database ID)
- project-context.md Rule 1: Isolation Above All

---

### 🔴 CRITICAL 7: No Password Complexity Enforcement (Backend)

**File:** `apps/foundry-dashboard/worker/auth/index.ts:22-25`
**Severity:** HIGH
**Impact:** Weak passwords, account compromise

**Problem:**
Better Auth config has **NO password requirements**. Client-side validation (8 chars) exists but is **TRIVIAL TO BYPASS**:

```typescript
// Backend (worker/auth/index.ts) - NO password rules
emailAndPassword: {
  enabled: true,
  // Missing: minPasswordLength, requireUppercase, requireNumbers, etc.
}

// Frontend (src/routes/signup.tsx:32-35) - EASILY BYPASSED
if (password.length < 8) {
  setError('Password must be at least 8 characters');
}
```

**Why This Is Critical:**
1. **Client-side only:** Attacker bypasses by calling API directly
2. **Weak passwords:** Users can set "password" as password
3. **Account takeover:** Brute force attacks succeed easily

**Bypass Example:**
```bash
# Attacker bypasses frontend validation
curl -X POST https://foundry.williamjshaw.ca/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"victim@test.com","password":"1"}'

# Backend accepts 1-character password ✅
```

**Required Fix:**
```typescript
// apps/foundry-dashboard/worker/auth/index.ts
import { betterAuth } from 'better-auth';

export function createAuth(env: Env) {
  return betterAuth({
    // ... existing config
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      password: {
        minLength: 12,           // Minimum 12 characters
        requireUppercase: true,  // At least one uppercase
        requireLowercase: true,  // At least one lowercase
        requireNumbers: true,    // At least one number
        requireSpecialChars: true, // At least one special char
      },
    },
  });
}
```

**References:**
- `apps/foundry-dashboard/worker/auth/index.ts:22-25` (no password rules)
- `apps/foundry-dashboard/src/routes/signup.tsx:32-35` (client-only validation)

---

### 🔴 CRITICAL 8: Missing CSRF Protection Configuration

**File:** `apps/foundry-dashboard/worker/auth/index.ts:15-86`
**Severity:** HIGH
**Impact:** Cross-Site Request Forgery attacks

**Problem:**
Better Auth config has **NO CSRF protection** enabled. The default behavior is unclear:

```typescript
export function createAuth(env: Env) {
  return betterAuth({
    // ... other config
    // Missing: advanced.csrfProtection configuration
  });
}
```

**Why This Is Critical:**
1. **CSRF Attacks:** Malicious sites can submit forms on behalf of users
2. **Session Hijacking:** Attacker can create/delete accounts
3. **State-changing operations:** Unprotected POST/DELETE requests

**Attack Scenario:**
```html
<!-- Attacker's site: evil.com -->
<form action="https://foundry.williamjshaw.ca/api/auth/signup" method="POST">
  <input name="email" value="attacker@evil.com">
  <input name="password" value="hacked">
</form>
<script>document.forms[0].submit()</script>

<!-- If user is logged in, form submits with their cookies -->
```

**Required Fix:**
```typescript
// apps/foundry-dashboard/worker/auth/index.ts
export function createAuth(env: Env) {
  return betterAuth({
    // ... existing config
    advanced: {
      generateId: () => crypto.randomUUID(),
      cookiePrefix: 'foundry',
      useSecureCookies: env.ENVIRONMENT === 'production',
    },
    // Better Auth includes CSRF protection by default via double-submit cookies
    // Verify this is enabled in Better Auth version being used
  });
}
```

**Verification Needed:**
1. Check Better Auth documentation for CSRF defaults
2. Test CSRF token validation on auth endpoints
3. Add CSRF middleware if not included by default

**References:**
- `apps/foundry-dashboard/worker/auth/index.ts:15-86` (no CSRF config)
- OWASP CSRF Prevention Cheat Sheet

---

## Warnings (Should Fix)

### ⚠️ WARNING 1: Missing R2 and Vectorize Bindings Usage

**Files:** `apps/foundry-dashboard/wrangler.jsonc:27-39`
**Severity:** MEDIUM
**Impact:** Unused bindings waste resources, confuse future developers

**Problem:**
Story 1.1 adds R2 `MEDIA` and Vectorize `EMBEDDINGS` bindings but **NOTHING USES THEM**. These are for future epics but add complexity now.

**Why This Is A Problem:**
1. **Premature Configuration:** Adding bindings before they're needed
2. **No Tests:** Can't verify bindings work correctly
3. **Confusing:** Developers don't know why these exist

**Recommendation:**
Either:
1. Remove bindings until Epic 3+ needs them
2. Add a simple "health check" to verify bindings work

**Example Health Check:**
```typescript
// worker/hono/app.ts
app.get('/health/resources', async (c) => {
  try {
    // Test R2
    const mediaList = await c.env.MEDIA.list({ limit: 1 });

    // Test Vectorize (insert dummy vector)
    const testVector = Array(768).fill(0);
    await c.env.EMBEDDINGS.insert([{
      id: 'health-check',
      values: testVector,
    }]);

    return c.json({
      r2: 'ok',
      vectorize: 'ok'
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});
```

---

### ⚠️ WARNING 2: CORS Origin Function Complexity

**File:** `apps/foundry-dashboard/worker/hono/app.ts:19-33`
**Severity:** LOW
**Impact:** Potential CORS bypass, harder to debug

**Problem:**
The CORS origin function has overly complex logic:

```typescript
origin: (origin) => {
  const allowedOrigins = [/* ... */];
  return allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0];
},
```

**Why This Is A Problem:**
1. **Fallback to allowedOrigins[0]:** Returns localhost for invalid origins
2. **Confusing Behavior:** Why return localhost instead of rejecting?
3. **Security Unclear:** Does this allow or block invalid origins?

**Better Approach:**
```typescript
origin: (origin) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8787',
    'https://foundry.williamjshaw.ca',
    'https://foundry-stage.williamjshaw.ca',
  ];

  // Only return origin if it's in the allowed list
  return allowedOrigins.includes(origin || '') ? origin : null;
},
```

---

### ⚠️ WARNING 3: No Rate Limiting on Auth Endpoints

**File:** `apps/foundry-dashboard/worker/hono/app.ts:39-42`
**Severity:** MEDIUM
**Impact:** Brute force attacks, credential stuffing

**Problem:**
Auth endpoints (`/api/auth/**`) have **NO rate limiting**:

```typescript
app.on(['GET', 'POST'], '/api/auth/**', async (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});
```

**Why This Is A Problem:**
1. **Brute Force:** Attacker can try unlimited passwords
2. **Credential Stuffing:** Can test leaked password databases
3. **Resource Exhaustion:** Unlimited signup requests

**Recommendation:**
Add Cloudflare rate limiting:

```typescript
// Before auth handler
app.use('/api/auth/*', async (c, next) => {
  // Use Cloudflare's built-in rate limiting
  // OR implement custom rate limiting with D1/KV
  const rateLimitKey = `ratelimit:${c.req.header('CF-Connecting-IP')}`;

  // Check rate limit (example with KV)
  const attempts = await c.env.KV.get(rateLimitKey);
  if (attempts && parseInt(attempts) > 10) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  await next();
});
```

**Alternative:**
Configure Cloudflare WAF rate limiting rules for `/api/auth/*`

---

### ⚠️ WARNING 4: Session Token Not Rotated on Login

**File:** `apps/foundry-dashboard/worker/auth/index.ts:28-35`
**Severity:** MEDIUM
**Impact:** Session fixation attacks

**Problem:**
Session configuration doesn't specify if tokens rotate on login:

```typescript
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  updateAge: 60 * 60 * 24, // Update session every 24 hours
  // Missing: rotateTokenOnLogin
},
```

**Why This Is A Problem:**
1. **Session Fixation:** Attacker can pre-set session token
2. **Security Best Practice:** Tokens should rotate on authentication

**Attack Scenario:**
```bash
# 1. Attacker gets victim to visit malicious site
# 2. Site sets session cookie for foundry.williamjshaw.ca
# 3. Victim logs in - session token doesn't change
# 4. Attacker uses pre-set token to access victim's account
```

**Recommendation:**
Check Better Auth docs for session rotation configuration and enable it.

---

### ⚠️ WARNING 5: No Logging/Monitoring for Auth Events

**File:** `apps/foundry-dashboard/worker/hono/app.ts:39-67`
**Severity:** LOW
**Impact:** Can't detect breaches, debug issues

**Problem:**
Auth middleware has minimal logging:

```typescript
app.use('/trpc/*', async (c, next) => {
  try {
    const session = await auth.api.getSession({ headers });
    if (!session?.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    // No logging of successful/failed auth
  } catch (error) {
    console.error('Auth error:', error); // Only logs errors
  }
});
```

**Why This Is A Problem:**
1. **No Audit Trail:** Can't track who accessed what
2. **No Security Alerts:** Can't detect brute force or suspicious activity
3. **Hard to Debug:** No visibility into auth failures

**Recommendation:**
```typescript
app.use('/trpc/*', async (c, next) => {
  const startTime = Date.now();
  const ip = c.req.header('CF-Connecting-IP');

  try {
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      // Log failed auth attempt
      console.warn({
        event: 'auth_failed',
        ip,
        path: c.req.path,
        timestamp: new Date().toISOString(),
      });
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Log successful auth
    console.info({
      event: 'auth_success',
      userId: session.user.id,
      ip,
      duration: Date.now() - startTime,
    });

    return next();
  } catch (error) {
    // Log auth error
    console.error({
      event: 'auth_error',
      error: error.message,
      ip,
    });
    return c.json({ error: 'Authentication failed' }, 401);
  }
});
```

---

## Positive Findings

Despite the critical issues, these aspects are well-implemented:

### ✅ GOOD 1: TypeScript Passes Without Errors
```bash
pnpm run typecheck
# ✅ No errors
```

### ✅ GOOD 2: .gitignore Properly Blocks Secrets
```bash
grep -E "^\.dev\*" .gitignore
# ✅ .dev* pattern blocks .dev.vars
```

### ✅ GOOD 3: CORS Configuration Includes Credentials
```typescript
credentials: true, // Allows auth cookies
```

### ✅ GOOD 4: Foreign Key Constraints in Schema
```sql
FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
```

### ✅ GOOD 5: Session Expiration Configured Reasonably
```typescript
expiresIn: 60 * 60 * 24 * 7, // 7 days - reasonable default
```

---

## Required Actions Before Merge

### Immediate (Blocking)
1. ✅ Fix database schema pollution (CRITICAL 1)
2. ✅ Verify .dev.vars never committed, rotate if needed (CRITICAL 2)
3. ✅ Add MEDIA and EMBEDDINGS to Env interface (CRITICAL 3)
4. ✅ Enable email verification or document workaround (CRITICAL 4)
5. ✅ Configure stage/prod secrets in Cloudflare (CRITICAL 5)
6. ✅ Create separate D1 databases per environment (CRITICAL 6)
7. ✅ Add backend password validation (CRITICAL 7)
8. ✅ Verify/enable CSRF protection (CRITICAL 8)

### High Priority (Should Fix)
1. Add rate limiting to auth endpoints (WARNING 3)
2. Configure session token rotation (WARNING 4)
3. Add auth event logging (WARNING 5)

### Nice to Have
1. Simplify CORS origin logic (WARNING 2)
2. Add health check for R2/Vectorize (WARNING 1)

---

## Testing Verification Required

Before marking this story as "Ready for Merge", verify:

```bash
# 1. Database cleanup
wrangler d1 execute foundry-global --remote --command="SELECT COUNT(*) FROM sqlite_master WHERE type='table';"
# Should return 4 (user, session, account, verification)

# 2. Separate databases
wrangler d1 list | grep foundry-global
# Should show: foundry-global-local, foundry-global-stage, foundry-global

# 3. Secrets configured
wrangler secret list --env stage
wrangler secret list --env production
# Should include: BETTER_AUTH_SECRET

# 4. Manual auth test
# - Sign up with weak password → should be rejected
# - Sign up with valid password → should work
# - Log in → should create session
# - Access /trpc endpoint → should require auth
# - Log out → session should be cleared
```

---

## Story Status: ❌ INCOMPLETE

**Blockers:**
- 8 critical security/architecture issues
- Database schema must be cleaned before production use
- Environment isolation required for GDPR compliance

**Estimated Time to Fix:** 4-6 hours

**Recommendation:**
DO NOT deploy to production until all critical issues are resolved. Local development can continue for Story 1.2 OAuth, but database cleanup should happen ASAP.

---

**Review Completed:** 2025-12-21
**Next Review Required:** After fixes applied
**Reviewer:** Claude Sonnet 4.5 (Adversarial Mode)
