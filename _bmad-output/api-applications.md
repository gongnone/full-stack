# API Application Drafts

## Twitter Developer Application

**App Name:** Foundry Content Engine

**App Description (250 chars max):**
Foundry is a content creation SaaS for marketing agencies. We help users create, refine, and optimize social content. We need read access to tweet metrics to improve content recommendations based on historical performance.

**Detailed Use Case:**
Foundry helps marketing agencies and content creators produce high-performing social media content. Our application needs Twitter API access to:

1. **Read User's Tweet Metrics** - Import engagement data (likes, retweets, replies, impressions) from tweets our users have published. This data trains our G7 prediction algorithm to suggest content improvements before publishing.

2. **Authentication via OAuth 2.0** - Users authorize Foundry to read their Twitter analytics. We never post on their behalf without explicit action.

3. **No Automation** - All content publishing is user-initiated. We analyze past performance to predict future engagement, not to automate posting.

**API Endpoints Required:**
- `GET /2/users/:id/tweets` - Retrieve user's tweets
- `GET /2/tweets/:id` - Get tweet metrics (public_metrics)
- OAuth 2.0 User Authentication

**Monthly Tweet Volume:** < 50,000 tweets/month (aggregate across all users)

**Core Functionality:**
- Display engagement metrics in user dashboard
- Calculate engagement score (likes + retweets × 2 + replies × 3)
- Train ML model to predict content performance
- Show "predicted engagement score" before user publishes

**Privacy Compliance:**
- GDPR compliant - users can delete all imported data
- Data encrypted at rest (Cloudflare D1)
- No data shared with third parties
- Users control what data is imported

---

## LinkedIn Developer Application

**App Name:** Foundry Content Engine

**Company Name:** Foundry

**Company Website:** https://foundry.williamjshaw.ca

**App Description:**
Foundry is a B2B SaaS platform for marketing agencies that helps create and optimize LinkedIn content. We request access to import post performance metrics so users can understand what content resonates with their audience and improve future posts.

**Use Case Description:**
Marketing agencies using Foundry create LinkedIn posts for themselves and their clients. To help them create better content, we need to:

1. **Import Post Analytics** - Read engagement metrics (likes, comments, shares, impressions) from posts the user has published on LinkedIn.

2. **Performance Prediction** - Use historical engagement data to score draft content before publishing, helping users understand which posts are likely to perform well.

3. **Agency Workflow** - Agency users may manage multiple LinkedIn company pages. We need to import metrics from authorized pages.

**Products Required:**
- **Share on LinkedIn** - To post content on behalf of authenticated users
- **Sign In with LinkedIn** - OAuth authentication
- **Marketing Developer Platform** - Access to post analytics

**API Endpoints:**
- `GET /v2/shares` - Retrieve user's posts
- `GET /v2/socialMetadata` - Get engagement metrics
- `GET /v2/organizationalEntityShareStatistics` - Company page analytics
- OAuth 2.0 three-legged authentication

**Privacy & Compliance:**
- OAuth-only authentication (no password storage)
- Users explicitly authorize each permission
- GDPR Article 17 compliant (right to erasure)
- Data retained only while user account is active
- Enterprise-grade encryption (AES-256)

**Technical Implementation:**
- Frontend: React + Vite on Cloudflare Pages
- Backend: Cloudflare Workers + D1 (SQLite)
- Auth: Better Auth with LinkedIn OAuth provider
- Hosting: Cloudflare (SOC 2 Type II certified)

---

## Next Steps After Submission

| Platform | Typical Approval Time | Notes |
|----------|----------------------|-------|
| Twitter | 1-7 days | May require additional questions |
| LinkedIn | 1-3 days | Partner Program requires review |

**While waiting for approval:**
1. Implement Epic 12-1: G7 Algorithm v1 (heuristic-based, no OAuth needed)
2. Create OAuth callback routes (placeholder until credentials arrive)
3. Build the engagement dashboard UI with mock data

---

## Application URLs

**Twitter Developer Portal:**
https://developer.twitter.com/en/portal/projects-and-apps

**LinkedIn Developer Portal:**
https://www.linkedin.com/developers/apps

---

## Recommended Application Settings

### Twitter App Settings
- **App permissions:** Read
- **Type of App:** Web App
- **Callback URL:** `https://foundry.williamjshaw.ca/api/auth/callback/twitter`
- **Website URL:** `https://foundry.williamjshaw.ca`

### LinkedIn App Settings
- **Authorized redirect URLs:**
  - `https://foundry.williamjshaw.ca/api/auth/callback/linkedin`
  - `https://foundry-stage.williamjshaw.ca/api/auth/callback/linkedin`
- **Products to request:**
  - Sign In with LinkedIn using OpenID Connect
  - Share on LinkedIn
  - Marketing Developer Platform (for analytics)
