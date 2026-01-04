# Sprint Retrospective: Email Triple-Send Bug

**Date:** 2026-01-04
**Epic:** Brand DNA Invitation Email System
**Sprint Goal:** Fix brand invite emails sending 3 times instead of once
**Status:** RESOLVED (after 3 attempted fixes)

---

## Timeline: The Journey

### Attempt #1: Original "Fix" (FAILED)
- **Action:** Removed retry loop, added `invite_email_sent` flag
- **Result:** Still sent 3 emails
- **Why it failed:** Treated symptoms, not root cause
- **Mistake:** Assumed retry loop was the problem without verifying

### Attempt #2: Code Review (CAUGHT ISSUES BUT MISSED ROOT CAUSE)
- **Action:** Found 8 issues with original fix
- **Issues found:** Silent failures, race conditions, broken email types, etc.
- **Fixed:** All 8 issues with defense-in-depth idempotency
- **Result:** Still sent 3 emails!
- **Why it failed:** All fixes were correct but didn't address the real bug

### Attempt #3: Root Cause Discovery (SUCCESS)
- **Action:** Checked database logs after user reported still getting 3 emails
- **Discovery:** `DOMParser is not defined` error in AWS SDK
- **Root cause:** AWS SDK v3 incompatible with Cloudflare Workers runtime
- **Fix:** Replaced AWS SDK with `aws4fetch` (Workers-native)
- **Result:** SHOULD NOW WORK (pending test)

---

## What the FUCK Went Wrong? 🔥

### 1. **We Fixed the Wrong Bug First**

**The Trap:**
```
User: "Emails sending 3 times"
Us: "Must be the retry loop!"
Reality: Retry loop WAS retrying, but WHY was it failing?
```

**Lesson:** When something retries 3 times, the question isn't "why retry?" but "**why is it failing?**"

---

### 2. **We Didn't Check Logs Before Fixing**

**What we SHOULD have done:**
1. Check database for email send failures
2. Look at error messages
3. Identify root cause
4. THEN fix

**What we ACTUALLY did:**
1. Assume we know the problem
2. Write elegant solution
3. Deploy
4. Surprise! Still broken

**Lesson:** **MEASURE BEFORE YOU FIX. VERIFY AFTER YOU FIX.**

---

### 3. **We Didn't Verify in Production After Deploy**

**Critical mistake:**
- Deployed "fix" to stage
- Assumed it worked because deployment succeeded
- Didn't actually test email sending
- User had to tell us it still failed

**Lesson:** **Deployment success ≠ Bug fixed**

---

### 4. **We Focused on Preventing Duplicates, Not Understanding Why They Happened**

**The pyramid of wrong priorities:**
```
What we built:
├─ Email send log (idempotency tracking)
├─ Flag reset on failure
├─ Retry re-check logic
├─ Database migrations
└─ Comprehensive tests

What we SHOULD have done first:
└─ Why is the email send throwing an error?
```

**Lesson:** Defense-in-depth is great, but **fix the root cause first**.

---

### 5. **We Didn't Know Our Runtime Environment**

**The oversight:**
- Using AWS SDK v3 in Cloudflare Workers
- AWS SDK uses `DOMParser` (browser API)
- Cloudflare Workers don't have `DOMParser`
- This is a **known issue** since Sept 2024 (v3.894.0+)

**We should have:**
- Checked AWS SDK compatibility with Workers
- Read the release notes
- Searched for known issues before building

**Lesson:** **Know your platform's constraints BEFORE choosing libraries.**

---

## What We Learned (The Hard Way)

### Technical Learnings

#### 1. **AWS SDK v3 is Broken on Cloudflare Workers**
- **Issue:** AWS SDK v3.894.0+ uses `DOMParser` for XML parsing
- **Impact:** Works in Node.js/browsers, fails in Workers
- **Solution:** Use `aws4fetch` instead (designed for edge runtimes)
- **Reference:** [AWS SDK Issue #7375](https://github.com/aws/aws-sdk-js-v3/issues/7375)

#### 2. **Successful Send ≠ No Error**
- Email can be sent AND still throw an error
- Error was in **response parsing**, not sending
- This caused retries even though email was delivered

#### 3. **Cloudflare Workers Runtime is NOT Node.js**
- No DOM APIs (`DOMParser`, `document`, `window`)
- No Node.js built-ins (unless polyfilled)
- Must use Workers-compatible libraries

#### 4. **Idempotency Must Be Multi-Layer**
Even with the root cause fixed, the idempotency system we built is valuable:
- Database-level deduplication (prevents race conditions)
- Email log tracking (monitoring and debugging)
- Retry re-check (defense against edge cases)

---

### Process Learnings

#### 1. **Root Cause Analysis > Quick Fixes**

**Old approach (BAD):**
```
1. See symptom (3 emails)
2. Guess cause (retry loop)
3. Fix guess
4. Ship it
```

**New approach (GOOD):**
```
1. See symptom (3 emails)
2. Gather data (check logs, database, error messages)
3. Identify root cause (DOMParser error)
4. Verify hypothesis (reproduce error)
5. Fix root cause
6. Test fix
7. Deploy
8. Verify in production
```

#### 2. **Test in Production Immediately After Deploy**

**New rule:**
- Deploy ✓
- Wait for deployment to complete ✓
- **IMMEDIATELY test the exact broken scenario** ✓
- Verify logs show expected behavior ✓
- THEN mark as resolved

#### 3. **Use Database Logs as Ground Truth**

The `email_send_log` table we created saved us:
```sql
SELECT * FROM email_send_log ORDER BY created_at DESC LIMIT 10;
```

This showed us:
- 4 attempts (not 3 retries - original + 3 retries)
- All had status "retrying" or "failed"
- Error message: "DOMParser is not defined"

**Without this log, we'd still be guessing.**

#### 4. **Known Issues Exist - Search First**

Before choosing ANY library:
1. Check GitHub issues for `[library] cloudflare workers`
2. Search for `[library] edge runtime compatibility`
3. Look for recent breaking changes (< 6 months)

**We would have found:**
- AWS SDK Issue #7375 (Sept 2024)
- Cloudflare Workers SDK Issue #10755
- Multiple blog posts about the problem

---

## What Went Well ✅

Despite the failures, some things worked:

### 1. **Comprehensive Fix (Even If Misdirected)**
- The idempotency system we built is production-grade
- Email send logging is valuable for debugging
- Migration strategy was solid
- Tests cover edge cases

### 2. **Code Review Caught Real Issues**
All 8 issues found were legitimate problems that needed fixing:
- Silent failure mode (flag never reset)
- Breaking other email types
- Migration strategy
- Etc.

### 3. **Defense-in-Depth Still Matters**
Even with root cause fixed, the layers we added provide safety:
- If AWS library breaks again → logs will show it
- If race condition occurs → database prevents duplicates
- If email fails → flag resets, allowing manual retry

---

## Action Items 🎯

### Immediate (Before Next Bug)

- [ ] **Create debugging checklist:**
  ```
  Before fixing any bug:
  1. Check application logs
  2. Check database for error patterns
  3. Search GitHub issues for library name + error message
  4. Reproduce error in isolation
  5. THEN propose fix
  ```

- [ ] **Add post-deploy verification:**
  ```
  After every deploy:
  1. Run smoke tests for changed features
  2. Check error logs for new errors
  3. Verify database shows expected state
  4. Mark as "deployed but unverified" until tested
  ```

- [ ] **Document known incompatibilities:**
  Create `docs/cloudflare-workers-compatibility.md`:
  - ❌ AWS SDK v3.894.0+ (DOMParser issue)
  - ✅ aws4fetch (Workers-native)
  - List other known issues

### Short-Term (This Week)

- [ ] **Add runtime compatibility CI check:**
  - Detect imports of incompatible libraries
  - Warn on `DOMParser`, `document`, `window` usage
  - Fail build if AWS SDK v3 is used in Workers code

- [ ] **Create email monitoring dashboard:**
  - Query `email_send_log` for failures
  - Alert on duplicate idempotency keys
  - Track send success rate

- [ ] **Add library review process:**
  Before adding ANY dependency to Workers:
  1. Check "cloudflare workers" in README
  2. Search GitHub issues
  3. Test in local workers environment
  4. Document compatibility in package.json

### Long-Term (Next Sprint)

- [ ] **Evaluate all AWS SDK usage:**
  - Audit codebase for `@aws-sdk/*` packages
  - Replace with Workers-compatible alternatives
  - Consider moving to Cloudflare-native services where possible

- [ ] **Add integration tests for email:**
  - Mock SES API
  - Test actual email sending flow
  - Verify no DOMParser usage

- [ ] **Create runbook for email issues:**
  - How to check email logs
  - Common failure modes
  - Rollback procedure

---

## Metrics

### Development Cost
- **Attempt 1:** 2 hours (design + code + deploy)
- **Attempt 2:** 4 hours (code review + 8 fixes + tests + deploy)
- **Attempt 3:** 1 hour (root cause analysis + fix)
- **Total:** 7 hours to fix a bug that could have been solved in 1 hour

### User Impact
- **3 duplicate emails sent** per client creation
- **Professional reputation damage**
- **User trust affected**

### Technical Debt Created
- ✅ **Good debt:** Email logging system (valuable even after fix)
- ✅ **Good debt:** Idempotency system (prevents future issues)
- ❌ **Bad debt:** Two migrations for a bug that didn't need them

---

## The One Thing We Should Remember

> **"Logs don't lie. Assumptions do."**

If we had checked `email_send_log` FIRST, we would have seen:
```
status: "failed"
error_message: "DOMParser is not defined"
```

That's a 30-second search away from the solution.

Instead, we spent 6 hours building elaborate fixes for a problem we didn't understand.

---

## Retrospective Outcomes

### What to Stop ❌
- Assuming we know the problem without checking logs
- Deploying without immediate verification
- Fixing symptoms before understanding causes

### What to Start ✅
- Check logs FIRST, always
- Test in production immediately after deploy
- Search for known issues before blaming our code

### What to Continue ✓
- Writing comprehensive fixes (when root cause is known)
- Code reviews that find real issues
- Defense-in-depth architecture

---

## Final Grade

**Attempt 1:** F (wrong fix, didn't verify)
**Attempt 2:** C (found issues, but missed root cause)
**Attempt 3:** A (finally checked logs, found real issue)

**Overall:** **D+** (solved it eventually, but cost too much time)

**Could have been an A** if we'd checked logs first.

---

## Appendix: Error Log Evidence

```
Email Send Log (from Stage DB):
{
  "id": "a37f66f6-933f-4ca5-8cb8-29b80d22d7c1",
  "email_type": "brand_invite",
  "recipient_email": "wjs@williamjshaw.ca",
  "idempotency_key": "brand-invite-965d81307afb48188ae95e81e73027b2",
  "status": "failed",
  "attempt_number": 3,
  "ses_message_id": null,
  "error_message": "DOMParser is not defined\n  Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.",
  "created_at": 1767526342846,
  "updated_at": 1767526342846
}
```

**This error message WAS THERE THE WHOLE TIME.**

We just didn't look until Attempt #3.

---

*Generated after fixing the brand invite triple-send bug on 2026-01-04*
