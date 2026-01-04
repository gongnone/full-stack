# React Sentry Setup - Local Testing

## Quick Test (Development Mode)

### 1. Start dev server

```bash
cd ~/full-stack/apps/foundry-dashboard
pnpm run dev
```

### 2. Open browser console

Visit: http://localhost:5173

Open DevTools (F12) → Console tab

### 3. Verify Sentry initialized

Look for console message:
```
[Sentry] ✅ Initialized {
  dsn: "https://94cad1254a9249bde7030761f32ea1a2@o4510652...",
  environment: "development",
  mode: "development",
  enabled: true
}
```

**✅ If you see this, Sentry is configured correctly!**

---

## Test Error Capture (Dev Mode - Console Only)

In browser console, trigger a test error:

```javascript
throw new Error("Test Sentry error - ignore me!");
```

**Expected in console:**
```
[Sentry] 📊 Would send error to Sentry: {...}
[Sentry] 🔍 Error message: Test Sentry error - ignore me!
[Sentry] 📍 Stack trace: {...}
```

**Note:** In development mode, errors are logged to console but **NOT sent to Sentry** (to avoid polluting your dashboard with dev errors).

---

## Test Error Capture (Production Build)

To test actual sending to Sentry:

### 1. Build for production

```bash
pnpm run build
```

### 2. Serve production build

```bash
pnpm run preview
```

### 3. Open http://localhost:4173

### 4. Trigger test error in console

```javascript
throw new Error("Production test error");
```

### 5. Check Sentry dashboard

Go to: https://sentry.io/organizations/YOUR_ORG/issues/

**Expected:** You should see "Production test error" appear within 30 seconds

**Environment tag:** Should show `environment:preview` or `environment:production`

---

## Verify Source Maps (After Deployment)

Once deployed to staging/production via GitHub Actions:

### 1. Check Sentry dashboard

Issues → Select any error → Stack Trace

### 2. Verify source maps

**With source maps working:**
```
at ClientCard.tsx:42:15
at renderComponent
```

**Without source maps (broken):**
```
at index-rsTSwDRh.js:1234:56  ❌ BAD - shows minified code
```

**If source maps aren't working:**
- Check GitHub Actions logs for Sentry plugin errors
- Verify `SENTRY_AUTH_TOKEN` secret is set
- Verify `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry settings

---

## Summary

✅ **Local dev:** Sentry logs to console (doesn't send)
✅ **Production build:** Sentry sends to dashboard
✅ **Staging/Production:** Source maps uploaded via GitHub Actions

---

## What's Configured

| Item | Status |
|------|--------|
| Sentry SDK installed | ✅ |
| DSN configured (.env.local) | ✅ |
| Initialization code added | ✅ |
| Source maps enabled | ✅ |
| Vite plugin configured | ✅ |
| GitHub workflows updated | ✅ |
| Dev mode: Log only | ✅ |
| Prod mode: Send to Sentry | ✅ |

---

## Next Steps

1. **Test locally** (Steps 1-3 above) - Verify Sentry initializes
2. **Deploy to staging** - `git push origin stage`
3. **Test staging** - Trigger error, check Sentry dashboard
4. **Deploy to production** - `git push origin main`

---

*Last updated: 2026-01-04*
*React Sentry setup complete - Workers integration next*
