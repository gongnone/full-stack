# AntiGravity Coding Prompt: Quantum Growth Marketing Intelligence System

> **Project Codename:** HALO-OPS  
> **Version:** 1.0  
> **Target Platform:** Cloudflare Workers + Cloudflare Ecosystem  
> **Agentic Editor:** Google AntiGravity

---

## 🎯 MISSION BRIEFING

You are building an **Automated Marketing Intelligence System** that operationalizes the "Quantum Growth" methodology created by Sabri Subie. This system transforms manual direct-response marketing research into an AI-powered, serverless workflow that:

1. **Researches markets** by scraping forums, reviews, and social platforms (Halo Strategy)
2. **Analyzes competitors** through automated and human-in-the-loop intelligence gathering (Golden Pheasant)
3. **Engineers irresistible offers** using adversarial AI critique loops (Godfather Offer)
4. **Generates high-converting content** including HVCO titles, copy, and visual cues

The system targets the **"Power 4%"** — sophisticated buyers who generate 64% of revenue — by filtering out beginner noise and extracting deep psychological insights.

---

## 🏗️ ARCHITECTURE OVERVIEW

### Monorepo Structure (PNPM Workspaces)

```
quantum-growth-system/
├── apps/
│   ├── dashboard/              # User-facing React app (TanStack + tRPC + Vite)
│   └── halo-service/           # Data processing worker (Hono + Cloudflare primitives)
├── packages/
│   ├── data-ops/               # Shared DB queries, schemas, Drizzle ORM
│   ├── agent-logic/            # LLM prompts, RAG logic, agent workflows
│   └── shared-types/           # Zod schemas, TypeScript interfaces
├── drizzle/                    # Database migrations
├── wrangler.jsonc              # Cloudflare configuration
└── package.json                # Workspace root
```

### Cloudflare Infrastructure Matrix

| Component | Service | Purpose |
|-----------|---------|---------|
| **Orchestrator** | Cloudflare Workflows | Multi-step durable execution, HITL pauses, retry logic |
| **Compute** | Cloudflare Workers | API handlers, tRPC routes, webhook endpoints |
| **Database** | Cloudflare D1 | SQLite for structured data (projects, offers, competitors) |
| **Vector DB** | Cloudflare Vectorize | Semantic embeddings for market research RAG |
| **Object Storage** | Cloudflare R2 | Raw HTML dumps, uploaded PDFs, generated assets |
| **Cache** | Cloudflare KV | Session data, API response caching |
| **Queue** | Cloudflare Queues | Async processing pipeline (scrape → analyze → store) |
| **AI Inference** | Workers AI / OpenAI | LLM calls for analysis, filtering, generation |
| **Browser** | Browser Rendering (Puppeteer) | JavaScript-rendered page scraping |
| **Realtime** | Durable Objects | WebSocket connections for live dashboard updates |

---

## 📊 DATA MODELS (Drizzle Schema)

### Core Tables

```typescript
// packages/data-ops/src/schema.ts

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// === PROJECT & RESEARCH ===

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  name: text('name').notNull(),
  industry: text('industry').notNull(),
  targetMarket: text('target_market'), // JSON: demographics, psychographics
  valueProposition: text('value_proposition'),
  status: text('status').default('research'), // research | competitor | offer | complete
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const researchSources = sqliteTable('research_sources', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id),
  sourceType: text('source_type').notNull(), // reddit | quora | amazon | facebook_ads | manual
  sourceUrl: text('source_url'),
  rawContent: text('raw_content'), // Original scraped text
  processedContent: text('processed_content'), // Cleaned/filtered
  sophisticationClass: text('sophistication_class'), // A | B | C
  sophisticationScore: real('sophistication_score'),
  status: text('status').default('pending'), // pending | processing | complete | failed
  metadata: text('metadata'), // JSON: subreddit, comment_count, etc.
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// === HALO STRATEGY OUTPUTS ===

export const haloAnalysis = sqliteTable('halo_analysis', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id),
  hopesAndDreams: text('hopes_and_dreams'), // JSON array
  painsAndFears: text('pains_and_fears'), // JSON array
  barriersAndUncertainties: text('barriers_and_uncertainties'), // JSON array
  vernacular: text('vernacular'), // JSON: glossary of market terms
  unexpectedInsights: text('unexpected_insights'), // JSON array
  visualCues: text('visual_cues'), // JSON: environment, objects, lighting, body_language
  primalDesires: text('primal_desires'), // JSON array
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const dreamBuyerAvatar = sqliteTable('dream_buyer_avatar', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id),
  demographics: text('demographics'), // JSON: age, gender, location, income
  psychographics: text('psychographics'), // JSON: values, interests, lifestyle
  dayInTheLife: text('day_in_the_life'), // Narrative description
  mediaConsumption: text('media_consumption'), // JSON: platforms, influencers, publications
  buyingBehavior: text('buying_behavior'), // JSON: triggers, objections, decision process
  summaryParagraph: text('summary_paragraph'), // Final avatar summary
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// === COMPETITOR INTELLIGENCE (GOLDEN PHEASANT) ===

export const competitors = sqliteTable('competitors', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id),
  name: text('name').notNull(),
  websiteUrl: text('website_url'),
  adLibraryUrl: text('ad_library_url'),
  yearsAdvertising: integer('years_advertising'),
  entryProductUrl: text('entry_product_url'),
  entryProductPrice: real('entry_product_price'),
  phoneNumber: text('phone_number'),
  status: text('status').default('identified'), // identified | researching | purchased | analyzed
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const competitorOfferMap = sqliteTable('competitor_offer_map', {
  id: text('id').primaryKey(),
  competitorId: text('competitor_id').references(() => competitors.id),
  hvco: text('hvco'), // Their high-value content offer
  primaryCta: text('primary_cta'),
  guarantee: text('guarantee'),
  scarcity: text('scarcity'),
  valueBuild: text('value_build'),
  bonuses: text('bonuses'), // JSON array
  pricing: text('pricing'), // JSON: entry, mid, deluxe tiers
  paymentPlan: text('payment_plan'),
  strengths: text('strengths'), // JSON array
  weaknesses: text('weaknesses'), // JSON array (gaps to exploit)
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const goldenPheasantUploads = sqliteTable('golden_pheasant_uploads', {
  id: text('id').primaryKey(),
  competitorId: text('competitor_id').references(() => competitors.id),
  uploadType: text('upload_type').notNull(), // pdf_report | sales_call_notes | product_screenshots
  r2Key: text('r2_key').notNull(), // R2 object key
  extractedContent: text('extracted_content'), // AI-extracted insights
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// === GODFATHER OFFER ===

export const godfatherOffer = sqliteTable('godfather_offer', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id),
  rationale: text('rationale'), // Why the offer is so generous
  valueBuild: text('value_build'), // JSON: component stacking
  pricingTiers: text('pricing_tiers'), // JSON: entry, mid, deluxe
  paymentOptions: text('payment_options'), // JSON array
  premiums: text('premiums'), // JSON: bonuses addressing barriers
  powerGuarantee: text('power_guarantee'),
  guaranteeName: text('guarantee_name'), // Branded guarantee name
  scarcity: text('scarcity'), // JSON: type, deadline, quantity
  offerParagraph: text('offer_paragraph'), // Condensed irresistible offer
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// === HVCO GENERATION ===

export const hvcoTitles = sqliteTable('hvco_titles', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id),
  title: text('title').notNull(),
  formula: text('formula'), // Which template was used
  criticScore: real('critic_score'),
  criticFeedback: text('critic_feedback'),
  iteration: integer('iteration').default(1),
  isWinner: integer('is_winner', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// === WORKFLOW STATE ===

export const workflowRuns = sqliteTable('workflow_runs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id),
  workflowType: text('workflow_type').notNull(), // halo_research | competitor_analysis | offer_generation
  cloudflareWorkflowId: text('cloudflare_workflow_id'),
  status: text('status').default('running'), // running | paused_hitl | complete | failed
  currentStep: text('current_step'),
  hitlRequest: text('hitl_request'), // JSON: action required from user
  errorMessage: text('error_message'),
  startedAt: integer('started_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// === VECTOR EMBEDDINGS METADATA ===

export const vectorMetadata = sqliteTable('vector_metadata', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id),
  vectorId: text('vector_id').notNull(), // ID in Vectorize
  sourceId: text('source_id').references(() => researchSources.id),
  contentType: text('content_type'), // comment | review | forum_post | ad_copy
  sophisticationClass: text('sophistication_class'),
  emotionalTrigger: text('emotional_trigger'), // fear | desire | frustration | hope
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});
```

---

## 🔄 WORKFLOW DEFINITIONS

### Workflow 1: Halo Research Workflow

```typescript
// apps/halo-service/src/workflows/halo-research-workflow.ts

import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';

interface HaloResearchParams {
  projectId: string;
  industry: string;
  keywords: string[];
  subreddits?: string[];
  amazonBookAsins?: string[];
  competitorUrls?: string[];
}

export class HaloResearchWorkflow extends WorkflowEntrypoint<Env, HaloResearchParams> {
  async run(event: WorkflowEvent<HaloResearchParams>, step: WorkflowStep) {
    const { projectId, industry, keywords, subreddits, amazonBookAsins, competitorUrls } = event.payload;

    // ═══════════════════════════════════════════════════════════════
    // PHASE 1: DATA INGESTION ("Fly on the Wall")
    // ═══════════════════════════════════════════════════════════════

    // Step 1.1: Answer The Public - Question Mining
    const questionData = await step.do('scrape-answer-the-public', async () => {
      return await this.env.SCRAPER.scrapeAnswerThePublic(keywords);
    });

    // Step 1.2: Reddit API - Forum Intelligence
    const redditData = await step.do('fetch-reddit-data', async () => {
      const results = [];
      for (const subreddit of subreddits || []) {
        const posts = await this.env.REDDIT_API.fetchTopPosts(subreddit, {
          timeframe: 'year',
          limit: 100,
          sortBy: 'controversial', // High comment-to-upvote ratio = emotional intensity
        });
        results.push(...posts);
      }
      return results;
    });

    // Step 1.3: Quora - Question Platform Mining
    const quoraData = await step.do('scrape-quora', async () => {
      return await this.env.SCRAPER.scrapeQuora(keywords);
    });

    // Step 1.4: Amazon Reviews - 3-Star Gold Mine
    const amazonReviews = await step.do('fetch-amazon-reviews', async () => {
      const results = [];
      for (const asin of amazonBookAsins || []) {
        const reviews = await this.env.AMAZON_API.fetchReviews(asin, {
          starRating: 3, // The nuanced "BUT" reviews
          minLength: 50,
          limit: 50,
        });
        results.push(...reviews);
      }
      return results;
    });

    // Step 1.5: Facebook Ad Library - Competitor Hooks
    const fbAdData = await step.do('fetch-facebook-ads', async () => {
      const results = [];
      for (const url of competitorUrls || []) {
        const ads = await this.env.FB_AD_LIBRARY.fetchActiveAds(url);
        results.push(...ads);
      }
      return results;
    });

    // Step 1.6: Store Raw Data
    await step.do('store-raw-data', async () => {
      const allSources = [
        ...questionData.map(q => ({ type: 'answer_the_public', content: q })),
        ...redditData.map(r => ({ type: 'reddit', content: r })),
        ...quoraData.map(q => ({ type: 'quora', content: q })),
        ...amazonReviews.map(r => ({ type: 'amazon', content: r })),
        ...fbAdData.map(a => ({ type: 'facebook_ads', content: a })),
      ];
      await this.env.DB.batch(
        allSources.map(source => 
          this.env.DB.prepare(`
            INSERT INTO research_sources (id, project_id, source_type, raw_content, status)
            VALUES (?, ?, ?, ?, 'pending')
          `).bind(crypto.randomUUID(), projectId, source.type, JSON.stringify(source.content))
        )
      );
    });

    // ═══════════════════════════════════════════════════════════════
    // PHASE 1.5: SOPHISTICATION FILTERING ("Power 4%")
    // ═══════════════════════════════════════════════════════════════

    const sophisticatedData = await step.do('filter-sophistication', async () => {
      const rawSources = await this.env.DB.prepare(`
        SELECT * FROM research_sources WHERE project_id = ? AND status = 'pending'
      `).bind(projectId).all();

      const filtered = [];
      for (const source of rawSources.results) {
        const classification = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
          messages: [{
            role: 'system',
            content: SOPHISTICATION_FILTER_PROMPT(industry),
          }, {
            role: 'user',
            content: source.raw_content,
          }],
        });

        const result = JSON.parse(classification.response);
        
        // Update source with classification
        await this.env.DB.prepare(`
          UPDATE research_sources 
          SET sophistication_class = ?, sophistication_score = ?, status = 'complete'
          WHERE id = ?
        `).bind(result.class, result.score, source.id).run();

        // Only keep Class A (Power 4%) and Class B (Intermediate)
        if (result.class !== 'C') {
          filtered.push({
            ...source,
            sophisticationClass: result.class,
            sophisticationScore: result.score,
          });
        }
      }
      return filtered;
    });

    // ═══════════════════════════════════════════════════════════════
    // PHASE 2: HALO ANALYSIS
    // ═══════════════════════════════════════════════════════════════

    const haloExtraction = await step.do('extract-halo-data', async () => {
      // Weight Class A data 5x in the analysis
      const weightedContent = sophisticatedData.map(s => ({
        content: s.raw_content,
        weight: s.sophisticationClass === 'A' ? 5 : 1,
      }));

      const analysis = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
        messages: [{
          role: 'system',
          content: HALO_EXTRACTION_PROMPT(industry),
        }, {
          role: 'user',
          content: JSON.stringify(weightedContent),
        }],
      });

      return JSON.parse(analysis.response);
    });

    // Step 2.2: Extract Visual Cues for Multimodal Generation
    const visualCues = await step.do('extract-visual-cues', async () => {
      const visualAnalysis = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
        messages: [{
          role: 'system',
          content: VISUALIZER_PROMPT,
        }, {
          role: 'user',
          content: JSON.stringify(haloExtraction.painsAndFears),
        }],
      });
      return JSON.parse(visualAnalysis.response);
    });

    // Step 2.3: Store Halo Analysis
    await step.do('store-halo-analysis', async () => {
      await this.env.DB.prepare(`
        INSERT INTO halo_analysis (id, project_id, hopes_and_dreams, pains_and_fears, 
          barriers_and_uncertainties, vernacular, unexpected_insights, visual_cues, primal_desires)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        projectId,
        JSON.stringify(haloExtraction.hopesAndDreams),
        JSON.stringify(haloExtraction.painsAndFears),
        JSON.stringify(haloExtraction.barriersAndUncertainties),
        JSON.stringify(haloExtraction.vernacular),
        JSON.stringify(haloExtraction.unexpectedInsights),
        JSON.stringify(visualCues),
        JSON.stringify(haloExtraction.primalDesires),
      ).run();
    });

    // Step 2.4: Generate Vector Embeddings
    await step.do('generate-embeddings', async () => {
      for (const source of sophisticatedData) {
        const embedding = await this.env.AI.run('@cf/baai/bge-base-en-v1.5', {
          text: source.raw_content,
        });

        const vectorId = crypto.randomUUID();
        await this.env.VECTORIZE.insert([{
          id: vectorId,
          values: embedding.data[0],
          metadata: {
            projectId,
            sourceId: source.id,
            sophisticationClass: source.sophisticationClass,
          },
        }]);

        // Store metadata mapping
        await this.env.DB.prepare(`
          INSERT INTO vector_metadata (id, project_id, vector_id, source_id, sophistication_class)
          VALUES (?, ?, ?, ?, ?)
        `).bind(crypto.randomUUID(), projectId, vectorId, source.id, source.sophisticationClass).run();
      }
    });

    // Step 2.5: Generate Dream Buyer Avatar
    const avatar = await step.do('generate-avatar', async () => {
      const avatarAnalysis = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
        messages: [{
          role: 'system',
          content: DREAM_BUYER_AVATAR_PROMPT(industry),
        }, {
          role: 'user',
          content: JSON.stringify(haloExtraction),
        }],
      });
      return JSON.parse(avatarAnalysis.response);
    });

    await step.do('store-avatar', async () => {
      await this.env.DB.prepare(`
        INSERT INTO dream_buyer_avatar (id, project_id, demographics, psychographics, 
          day_in_the_life, media_consumption, buying_behavior, summary_paragraph)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        projectId,
        JSON.stringify(avatar.demographics),
        JSON.stringify(avatar.psychographics),
        avatar.dayInTheLife,
        JSON.stringify(avatar.mediaConsumption),
        JSON.stringify(avatar.buyingBehavior),
        avatar.summaryParagraph,
      ).run();
    });

    // Update project status
    await step.do('update-project-status', async () => {
      await this.env.DB.prepare(`
        UPDATE projects SET status = 'competitor', updated_at = unixepoch() WHERE id = ?
      `).bind(projectId).run();
    });

    return {
      status: 'complete',
      projectId,
      haloAnalysisId: haloExtraction.id,
      sophisticatedSourceCount: sophisticatedData.length,
    };
  }
}
```

### Workflow 2: Golden Pheasant (Competitor Intelligence)

```typescript
// apps/halo-service/src/workflows/golden-pheasant-workflow.ts

interface GoldenPheasantParams {
  projectId: string;
  competitorId: string;
}

export class GoldenPheasantWorkflow extends WorkflowEntrypoint<Env, GoldenPheasantParams> {
  async run(event: WorkflowEvent<GoldenPheasantParams>, step: WorkflowStep) {
    const { projectId, competitorId } = event.payload;

    // ═══════════════════════════════════════════════════════════════
    // PHASE 3A: AUTOMATED INTELLIGENCE
    // ═══════════════════════════════════════════════════════════════

    // Step 3.1: Scrape competitor website
    const websiteData = await step.do('scrape-competitor-website', async () => {
      const competitor = await this.env.DB.prepare(`
        SELECT * FROM competitors WHERE id = ?
      `).bind(competitorId).first();

      const html = await this.env.BROWSER.fetch(competitor.website_url);
      const bodyText = await this.env.BROWSER.extractText(html);
      
      // Store raw HTML in R2
      const r2Key = `competitors/${competitorId}/website.html`;
      await this.env.R2.put(r2Key, html);

      return { bodyText, r2Key };
    });

    // Step 3.2: Analyze website for offer components
    const websiteAnalysis = await step.do('analyze-website', async () => {
      const analysis = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
        messages: [{
          role: 'system',
          content: COMPETITOR_WEBSITE_ANALYSIS_PROMPT,
        }, {
          role: 'user',
          content: websiteData.bodyText,
        }],
      });
      return JSON.parse(analysis.response);
    });

    // Step 3.3: Facebook Ad Library Analysis
    const adAnalysis = await step.do('analyze-facebook-ads', async () => {
      const competitor = await this.env.DB.prepare(`
        SELECT * FROM competitors WHERE id = ?
      `).bind(competitorId).first();

      if (!competitor.ad_library_url) return null;

      const ads = await this.env.FB_AD_LIBRARY.fetchActiveAds(competitor.ad_library_url);
      const yearsActive = await this.env.FB_AD_LIBRARY.getPageTransparency(competitor.ad_library_url);

      // Update competitor with years advertising
      await this.env.DB.prepare(`
        UPDATE competitors SET years_advertising = ? WHERE id = ?
      `).bind(yearsActive, competitorId).run();

      const hookAnalysis = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
        messages: [{
          role: 'system',
          content: AD_HOOK_ANALYSIS_PROMPT,
        }, {
          role: 'user',
          content: JSON.stringify(ads),
        }],
      });

      return JSON.parse(hookAnalysis.response);
    });

    // Step 3.4: Store automated findings
    await step.do('store-automated-intel', async () => {
      await this.env.DB.prepare(`
        INSERT INTO competitor_offer_map (id, competitor_id, hvco, primary_cta, guarantee, 
          scarcity, value_build, bonuses, pricing, strengths, weaknesses)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        competitorId,
        websiteAnalysis.hvco,
        websiteAnalysis.primaryCta,
        websiteAnalysis.guarantee,
        websiteAnalysis.scarcity,
        websiteAnalysis.valueBuild,
        JSON.stringify(websiteAnalysis.bonuses),
        JSON.stringify(websiteAnalysis.pricing),
        JSON.stringify(websiteAnalysis.strengths),
        JSON.stringify(websiteAnalysis.weaknesses),
      ).run();
    });

    // ═══════════════════════════════════════════════════════════════
    // PHASE 3B: HUMAN-IN-THE-LOOP (THE PHYSICAL WORLD)
    // ═══════════════════════════════════════════════════════════════

    // Step 3.5: Generate HITL Request
    const hitlRequest = await step.do('generate-hitl-request', async () => {
      const competitor = await this.env.DB.prepare(`
        SELECT * FROM competitors WHERE id = ?
      `).bind(competitorId).first();

      return {
        type: 'GOLDEN_PHEASANT_PURCHASE',
        competitorId,
        competitorName: competitor.name,
        actions: [
          {
            id: 'purchase_product',
            instruction: `Purchase the entry-level product from ${competitor.name}`,
            url: competitor.entry_product_url,
            price: competitor.entry_product_price,
            uploadRequired: true,
            uploadType: 'pdf_report',
          },
          {
            id: 'sales_call',
            instruction: `Call ${competitor.phone_number} and inquire about their high-tier offering. Ask about: pricing tiers, guarantee details, what's included, payment plans, and urgency/scarcity tactics.`,
            phoneNumber: competitor.phone_number,
            scriptTemplate: SALES_CALL_SCRIPT,
            notesRequired: true,
          },
        ],
      };
    });

    // Step 3.6: Notify user and suspend workflow
    await step.do('notify-user', async () => {
      // Send notification via preferred channel
      await this.env.NOTIFICATIONS.send({
        type: 'hitl_required',
        projectId,
        workflowId: event.id,
        request: hitlRequest,
      });

      // Update workflow run status
      await this.env.DB.prepare(`
        UPDATE workflow_runs SET status = 'paused_hitl', hitl_request = ? WHERE cloudflare_workflow_id = ?
      `).bind(JSON.stringify(hitlRequest), event.id).run();
    });

    // ╔═══════════════════════════════════════════════════════════════╗
    // ║  🛑 WORKFLOW SUSPENDS HERE UNTIL USER COMPLETES ACTIONS       ║
    // ╚═══════════════════════════════════════════════════════════════╝
    
    const hitlResponse = await step.waitForEvent('hitl-complete', {
      timeout: '7 days', // Allow up to 7 days for physical actions
    });

    // ═══════════════════════════════════════════════════════════════
    // PHASE 3C: PROCESS HITL DATA
    // ═══════════════════════════════════════════════════════════════

    // Step 3.7: Process uploaded PDF
    const pdfInsights = await step.do('process-pdf-upload', async () => {
      if (!hitlResponse.uploads?.pdf_report) return null;

      const pdfContent = await this.env.R2.get(hitlResponse.uploads.pdf_report);
      const extractedText = await this.env.PDF_PARSER.extractText(pdfContent);

      const analysis = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
        messages: [{
          role: 'system',
          content: COMPETITOR_PRODUCT_ANALYSIS_PROMPT,
        }, {
          role: 'user',
          content: extractedText,
        }],
      });

      // Store upload record
      await this.env.DB.prepare(`
        INSERT INTO golden_pheasant_uploads (id, competitor_id, upload_type, r2_key, extracted_content)
        VALUES (?, ?, 'pdf_report', ?, ?)
      `).bind(
        crypto.randomUUID(),
        competitorId,
        hitlResponse.uploads.pdf_report,
        analysis.response,
      ).run();

      return JSON.parse(analysis.response);
    });

    // Step 3.8: Process sales call notes
    const salesInsights = await step.do('process-sales-notes', async () => {
      if (!hitlResponse.salesCallNotes) return null;

      const analysis = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
        messages: [{
          role: 'system',
          content: SALES_CALL_ANALYSIS_PROMPT,
        }, {
          role: 'user',
          content: hitlResponse.salesCallNotes,
        }],
      });

      // Store upload record
      await this.env.DB.prepare(`
        INSERT INTO golden_pheasant_uploads (id, competitor_id, upload_type, r2_key, extracted_content)
        VALUES (?, ?, 'sales_call_notes', ?, ?)
      `).bind(
        crypto.randomUUID(),
        competitorId,
        `competitors/${competitorId}/sales_notes.txt`,
        analysis.response,
      ).run();

      return JSON.parse(analysis.response);
    });

    // Step 3.9: Update competitor offer map with insider intel
    await step.do('update-offer-map', async () => {
      const existingMap = await this.env.DB.prepare(`
        SELECT * FROM competitor_offer_map WHERE competitor_id = ?
      `).bind(competitorId).first();

      // Merge automated + HITL insights
      const mergedInsights = mergeCompetitorInsights(existingMap, pdfInsights, salesInsights);

      await this.env.DB.prepare(`
        UPDATE competitor_offer_map 
        SET guarantee = ?, scarcity = ?, value_build = ?, bonuses = ?, pricing = ?, 
            payment_plan = ?, strengths = ?, weaknesses = ?
        WHERE competitor_id = ?
      `).bind(
        mergedInsights.guarantee,
        mergedInsights.scarcity,
        mergedInsights.valueBuild,
        JSON.stringify(mergedInsights.bonuses),
        JSON.stringify(mergedInsights.pricing),
        mergedInsights.paymentPlan,
        JSON.stringify(mergedInsights.strengths),
        JSON.stringify(mergedInsights.weaknesses),
        competitorId,
      ).run();
    });

    // Step 3.10: Update competitor status
    await step.do('finalize-competitor', async () => {
      await this.env.DB.prepare(`
        UPDATE competitors SET status = 'analyzed' WHERE id = ?
      `).bind(competitorId).run();
    });

    return {
      status: 'complete',
      competitorId,
      hasInsiderIntel: true,
    };
  }
}
```

### Workflow 3: Godfather Offer Generation

```typescript
// apps/halo-service/src/workflows/godfather-offer-workflow.ts

interface GodfatherOfferParams {
  projectId: string;
}

export class GodfatherOfferWorkflow extends WorkflowEntrypoint<Env, GodfatherOfferParams> {
  async run(event: WorkflowEvent<GodfatherOfferParams>, step: WorkflowStep) {
    const { projectId } = event.payload;

    // Load all research data
    const projectData = await step.do('load-project-data', async () => {
      const [halo, avatar, competitors] = await Promise.all([
        this.env.DB.prepare(`SELECT * FROM halo_analysis WHERE project_id = ?`).bind(projectId).first(),
        this.env.DB.prepare(`SELECT * FROM dream_buyer_avatar WHERE project_id = ?`).bind(projectId).first(),
        this.env.DB.prepare(`
          SELECT c.*, com.* FROM competitors c 
          JOIN competitor_offer_map com ON c.id = com.competitor_id 
          WHERE c.project_id = ?
        `).bind(projectId).all(),
      ]);
      return { halo, avatar, competitors: competitors.results };
    });

    // ═══════════════════════════════════════════════════════════════
    // PHASE 4: GODFATHER OFFER ENGINEERING
    // ═══════════════════════════════════════════════════════════════

    // Step 4.1: Generate 7 Pillars of Godfather Offer
    const offerPillars = await step.do('generate-offer-pillars', async () => {
      const generation = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
        messages: [{
          role: 'system',
          content: GODFATHER_OFFER_ARCHITECT_PROMPT,
        }, {
          role: 'user',
          content: JSON.stringify({
            haloAnalysis: projectData.halo,
            dreamBuyer: projectData.avatar,
            competitorOffers: projectData.competitors,
          }),
        }],
      });
      return JSON.parse(generation.response);
    });

    // Step 4.2: Generate Power Guarantee
    const powerGuarantee = await step.do('generate-power-guarantee', async () => {
      // Cross-reference fears with guarantee
      const primaryFear = JSON.parse(projectData.halo.pains_and_fears)[0];
      
      const guaranteeGen = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
        messages: [{
          role: 'system',
          content: POWER_GUARANTEE_PROMPT,
        }, {
          role: 'user',
          content: JSON.stringify({
            primaryFear,
            competitorGuarantees: projectData.competitors.map(c => c.guarantee),
            industry: projectData.avatar.industry,
          }),
        }],
      });
      return JSON.parse(guaranteeGen.response);
    });

    // Step 4.3: Store Godfather Offer
    await step.do('store-godfather-offer', async () => {
      await this.env.DB.prepare(`
        INSERT INTO godfather_offer (id, project_id, rationale, value_build, pricing_tiers,
          payment_options, premiums, power_guarantee, guarantee_name, scarcity, offer_paragraph)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        projectId,
        offerPillars.rationale,
        JSON.stringify(offerPillars.valueBuild),
        JSON.stringify(offerPillars.pricingTiers),
        JSON.stringify(offerPillars.paymentOptions),
        JSON.stringify(offerPillars.premiums),
        powerGuarantee.guarantee,
        powerGuarantee.name,
        JSON.stringify(offerPillars.scarcity),
        offerPillars.offerParagraph,
      ).run();
    });

    // ═══════════════════════════════════════════════════════════════
    // PHASE 5: HVCO TITLE GENERATION (ADVERSARIAL LOOP)
    // ═══════════════════════════════════════════════════════════════

    // Step 5.1: Generate Initial Titles (Writer Agent)
    const initialTitles = await step.do('generate-hvco-titles', async () => {
      const generation = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
        messages: [{
          role: 'system',
          content: HVCO_WRITER_PROMPT,
        }, {
          role: 'user',
          content: JSON.stringify({
            haloAnalysis: projectData.halo,
            dreamBuyer: projectData.avatar,
            vernacular: JSON.parse(projectData.halo.vernacular),
          }),
        }],
      });
      return JSON.parse(generation.response).titles; // Array of 10 titles
    });

    // Step 5.2: Adversarial Critique Loop (Critic Agent)
    const refinedTitles = await step.do('critique-and-refine-titles', async () => {
      const finalTitles = [];
      const maxIterations = 3;

      for (const title of initialTitles) {
        let currentTitle = title;
        let iteration = 1;
        let passed = false;

        while (iteration <= maxIterations && !passed) {
          // Critic evaluation
          const critique = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
            messages: [{
              role: 'system',
              content: SKEPTICAL_INVESTOR_CRITIC_PROMPT,
            }, {
              role: 'user',
              content: currentTitle.text,
            }],
          });

          const criticResult = JSON.parse(critique.response);

          // Store critique
          await this.env.DB.prepare(`
            INSERT INTO hvco_titles (id, project_id, title, formula, critic_score, critic_feedback, iteration)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(
            crypto.randomUUID(),
            projectId,
            currentTitle.text,
            currentTitle.formula,
            criticResult.score,
            criticResult.feedback,
            iteration,
          ).run();

          if (criticResult.score >= 8) {
            passed = true;
            finalTitles.push({
              ...currentTitle,
              score: criticResult.score,
              iteration,
            });
          } else if (iteration < maxIterations) {
            // Refine based on feedback
            const refinement = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
              messages: [{
                role: 'system',
                content: HVCO_REFINER_PROMPT,
              }, {
                role: 'user',
                content: JSON.stringify({
                  originalTitle: currentTitle.text,
                  feedback: criticResult.feedback,
                  haloData: projectData.halo,
                }),
              }],
            });
            currentTitle = JSON.parse(refinement.response);
          }

          iteration++;
        }

        // If still didn't pass after max iterations, include best attempt
        if (!passed) {
          finalTitles.push({
            ...currentTitle,
            score: 0,
            iteration: maxIterations,
            note: 'Did not pass critic threshold',
          });
        }
      }

      return finalTitles;
    });

    // Step 5.3: Select Winner
    await step.do('select-winner-title', async () => {
      const winner = refinedTitles.sort((a, b) => b.score - a.score)[0];
      
      await this.env.DB.prepare(`
        UPDATE hvco_titles SET is_winner = 1 WHERE project_id = ? AND title = ?
      `).bind(projectId, winner.text).run();

      return winner;
    });

    // Step 5.4: Update project status
    await step.do('complete-project', async () => {
      await this.env.DB.prepare(`
        UPDATE projects SET status = 'complete', updated_at = unixepoch() WHERE id = ?
      `).bind(projectId).run();
    });

    return {
      status: 'complete',
      projectId,
      topTitles: refinedTitles.slice(0, 3),
    };
  }
}
```

---

## 🧠 LLM PROMPTS

### Sophistication Filter Prompt

```typescript
// packages/agent-logic/src/prompts/sophistication-filter.ts

export const SOPHISTICATION_FILTER_PROMPT = (industry: string) => `
You are an expert analyst in ${industry}. Your task is to filter user comments from social media and forums.

We are looking for the "Power 4%" — sophisticated, experienced buyers who spend significant money.

## Classification Rules:

### CLASS C (DISCARD) - The Tire Kicker
- Asks basic "101" questions (e.g., "How do I start?", "What is a stock?")
- Uses beginner language
- Expresses unrealistic "get rich quick" desires
- Poor grammar/spelling suggesting low investment
- Fear of minor, common risks
- Asks questions easily answered by Google

### CLASS B (RETAIN) - The Intermediate  
- Discusses specific tactics and compares tools
- Asks about specific features ("Is X better than Y?")
- Shows some domain knowledge but not advanced
- Useful for "warm market" analysis

### CLASS A (PRIORITIZE) - The Power 4%
- Uses industry-specific jargon naturally
- Discusses structural optimization, tax legality, leverage, scaling
- Asks about advanced problems (regulatory, compliance, optimization)
- Mentions specific dollar amounts ($100K+)
- References professional advisors (lawyers, accountants)
- Discusses portfolio-level strategy, not single transactions

## Output Format (JSON):
{
  "class": "A" | "B" | "C",
  "score": 1-10,
  "reasoning": "Brief explanation",
  "jargonDetected": ["term1", "term2"],
  "sophisticationMarkers": ["marker1", "marker2"]
}

If the content is Class C (Newbie), return class "C" with score 1-3.
If Intermediate, return class "B" with score 4-6.
If Power 4%, return class "A" with score 7-10.
`;
```

### Halo Extraction Prompt

```typescript
export const HALO_EXTRACTION_PROMPT = (industry: string) => `
You are a market psychologist specializing in ${industry}. Analyze the following weighted market research data to extract the Halo Strategy components.

## Your Task:
Extract specific psychological primitives from the data. Do NOT summarize. Extract EXACT quotes and patterns.

## Output Schema (JSON):

{
  "hopesAndDreams": [
    {
      "desire": "The promised land they're seeking",
      "verbatim": "Exact quote from data",
      "frequency": "How often this appeared",
      "emotionalIntensity": 1-10
    }
  ],
  "painsAndFears": [
    {
      "pain": "The 3AM sweat - what keeps them up at night",
      "verbatim": "Exact quote",
      "frequency": "count",
      "emotionalIntensity": 1-10
    }
  ],
  "barriersAndUncertainties": [
    {
      "barrier": "What's stopping them from buying",
      "verbatim": "Exact quote",
      "type": "trust | timing | capability | knowledge | resource"
    }
  ],
  "vernacular": {
    "terms": [
      {
        "term": "Industry jargon",
        "definition": "What it means",
        "usage": "How insiders use it"
      }
    ],
    "phrases": ["Common phrases that signal membership"]
  },
  "unexpectedInsights": [
    {
      "insight": "Something surprising about this market",
      "evidence": "What data supports this",
      "opportunity": "How this could be exploited"
    }
  ],
  "primalDesires": [
    "The deep, primal motivation (freedom, security, status, etc.)"
  ]
}

## Rules:
1. Weight Class A data 5x more than Class B
2. Look for patterns, not one-off comments
3. Capture the EXACT language they use (vernacular is critical)
4. Identify the #1 "hair on fire" problem
5. Find the "BUT" — the gap between what exists and what they want
`;
```

### Visualizer Prompt

```typescript
export const VISUALIZER_PROMPT = `
You are a cinematographer and visual storyteller. Analyze the following "Pains and Fears" text.

DO NOT summarize the text. Instead, VISUALIZE it.

## Your Task:
Extract nouns, physical descriptions, and environmental details that could direct a photographer or filmmaker to capture this emotion.

## Visual Questions to Answer:
- If this fear was a movie scene, what would it look like?
- What objects are on the table?
- What is the lighting?
- What is the subject's body language?
- What time of day is it?
- What sounds would be in the background?

## Output Schema (JSON):

{
  "environmentDescriptors": [
    "Run-down house", "Sterile office", "Kitchen at 3AM"
  ],
  "objectAnchors": [
    "Stack of bills", "Empty wallet", "Foreclosure notice", "Calculator"
  ],
  "emotionalBodyLanguage": [
    "Head in hands", "Pacing the floor", "Staring at ceiling"
  ],
  "lightingMood": [
    "Cold blue light from laptop", "Harsh fluorescent", "Single lamp in darkness"
  ],
  "timeOfDay": "3AM | Early morning | Late night",
  "soundscape": [
    "Clock ticking", "Distant traffic", "Silence except breathing"
  ],
  "colorPalette": [
    "Desaturated blues", "Warm amber", "Clinical white"
  ],
  "cameraAngle": "Close-up on hands | Wide shot showing isolation | Over shoulder"
}

These visual cues will be used to generate AI images for Facebook/Instagram ads.
`;
```

### Skeptical Investor Critic Prompt

```typescript
export const SKEPTICAL_INVESTOR_CRITIC_PROMPT = `
You are a cynical, wealthy investor who has seen every scam online. You are reviewing headlines for a free report (HVCO).

You have ZERO patience for:
- Clickbait
- Vague promises
- "Get rich quick" vibes
- Generic marketing speak
- Anything that sounds like an ad

You ARE intrigued by:
- Specific mechanisms you don't know about
- Insider knowledge from practitioners
- Counter-intuitive strategies
- Concrete numbers and timeframes
- Language that signals "this person is in the trenches"

## Your Task:
Grade this headline from 0-10.

### Scoring Guide:
- **0-4 (FAIL):** Boring, clickbait, unbelievable, sounds like a scam
- **5-7 (FAIL):** Average. Looks like a standard ad. Would scroll past.
- **8-10 (PASS):** Genuine intrigue. Implies a 'secret mechanism' or 'insider knowledge' I don't possess. Makes me feel I MUST click to protect my interests or gain an edge.

## Output Schema (JSON):

{
  "score": 0-10,
  "verdict": "PASS" | "FAIL",
  "feedback": "Brutal, specific feedback on what word/phrase killed it",
  "whatWouldMakeItBetter": "Specific suggestion",
  "compellingElements": ["What worked, if anything"],
  "redFlags": ["What screamed 'scam' or 'generic'"]
}

Be BRUTAL. Most headlines should score 4-6. Only exceptional headlines score 8+.
`;
```

### Godfather Offer Architect Prompt

```typescript
export const GODFATHER_OFFER_ARCHITECT_PROMPT = `
You are a direct-response marketing strategist specializing in irresistible offers. Your task is to engineer a "Godfather Offer" — an offer so good that "only a lunatic would refuse to buy."

## The 7 Pillars Framework:

### 1. RATIONALE
Why are you making such an outrageously generous offer? 
- New market entry?
- More efficient business model?
- Disrupting incumbent players?
- Limited time to build case studies?

### 2. VALUE BUILD
Stack the components and assign dollar values:
- Core deliverable: $X value
- Bonus 1: $Y value (addresses specific barrier from Halo)
- Bonus 2: $Z value (addresses different barrier)
- Total value: $A → Offered at: $B (massive perceived ROI)

### 3. PRICING TIERS
- Entry: Bare bones, happy with this price
- Mid: Best fit, nice profitability bump
- Deluxe: All bells and whistles, fastest results

### 4. PAYMENT OPTIONS
- Full pay discount
- Payment plan (reduces barrier to entry)
- Financing options if applicable

### 5. PREMIUMS (Bonuses)
Each bonus must address a specific BARRIER from the Halo analysis:
- Barrier: "I don't know the tax implications" → Bonus: "Free Tax Strategy Cheat Sheet ($497 value)"
- Barrier: "I don't have time" → Bonus: "Done-For-You Implementation ($1,997 value)"

### 6. POWER GUARANTEE
Risk-reversal that "keeps the founder up at night":
- Must be SPECIFIC (tied to outcome)
- Must be CONDITIONAL (they must do the work)
- Should be named (e.g., "Triple Your Money Back Guarantee")

### 7. SCARCITY
Genuine limits (not fake):
- Time deadline
- Quantity cap
- Capacity constraint
- Seasonal relevance

## Input You'll Receive:
- Halo Analysis (hopes, fears, barriers, vernacular)
- Dream Buyer Avatar
- Competitor Offers (their weaknesses = your opportunities)

## Output Schema (JSON):

{
  "rationale": "Compelling reason for the generous offer",
  "valueBuild": {
    "components": [
      { "name": "Core Program", "value": 2997, "description": "..." },
      { "name": "Bonus 1", "value": 497, "addressesBarrier": "...", "description": "..." }
    ],
    "totalValue": 4991,
    "offerPrice": 997,
    "perceivedROI": "5x"
  },
  "pricingTiers": {
    "entry": { "name": "Starter", "price": 497, "includes": [...] },
    "mid": { "name": "Professional", "price": 997, "includes": [...], "recommended": true },
    "deluxe": { "name": "VIP", "price": 2497, "includes": [...] }
  },
  "paymentOptions": [
    { "type": "full", "price": 997, "savings": 200 },
    { "type": "split", "payments": 3, "amount": 399 }
  ],
  "premiums": [
    { "name": "...", "value": 497, "addressesBarrier": "...", "description": "..." }
  ],
  "powerGuarantee": {
    "name": "The [Name] Guarantee",
    "promise": "Specific outcome promised",
    "condition": "What they must do",
    "duration": "180 days",
    "consequence": "Full refund + $500 for wasting their time"
  },
  "scarcity": {
    "type": "quantity",
    "limit": 50,
    "reason": "Can only onboard 50 clients this quarter",
    "deadline": "2024-03-31"
  },
  "offerParagraph": "One compelling paragraph that combines all 7 pillars"
}
`;
```

---

## 🔌 API INTEGRATIONS

### Reddit API Wrapper

```typescript
// packages/agent-logic/src/integrations/reddit.ts

interface RedditConfig {
  clientId: string;
  clientSecret: string;
  userAgent: string;
}

export class RedditAPI {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private config: RedditConfig) {}

  private async authenticate(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiry) return;

    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.config.userAgent,
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer
  }

  async fetchTopPosts(subreddit: string, options: {
    timeframe: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
    limit: number;
    sortBy: 'hot' | 'new' | 'top' | 'controversial';
  }): Promise<RedditPost[]> {
    await this.authenticate();

    const url = `https://oauth.reddit.com/r/${subreddit}/${options.sortBy}?t=${options.timeframe}&limit=${options.limit}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'User-Agent': this.config.userAgent,
      },
    });

    const data = await response.json();
    
    return data.data.children.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      selftext: child.data.selftext,
      score: child.data.score,
      numComments: child.data.num_comments,
      created: child.data.created_utc,
      url: `https://reddit.com${child.data.permalink}`,
      // High comment-to-upvote ratio indicates emotional intensity
      emotionalIntensity: child.data.num_comments / Math.max(child.data.score, 1),
    }));
  }

  async fetchComments(postId: string, limit: number = 100): Promise<RedditComment[]> {
    await this.authenticate();

    const url = `https://oauth.reddit.com/comments/${postId}?limit=${limit}&depth=2`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'User-Agent': this.config.userAgent,
      },
    });

    const data = await response.json();
    
    // Flatten comment tree
    const comments: RedditComment[] = [];
    const extractComments = (children: any[]) => {
      for (const child of children) {
        if (child.kind === 't1') {
          comments.push({
            id: child.data.id,
            body: child.data.body,
            score: child.data.score,
            created: child.data.created_utc,
          });
          if (child.data.replies?.data?.children) {
            extractComments(child.data.replies.data.children);
          }
        }
      }
    };

    if (data[1]?.data?.children) {
      extractComments(data[1].data.children);
    }

    return comments;
  }
}
```

### Facebook Ad Library Integration

```typescript
// packages/agent-logic/src/integrations/facebook-ads.ts

export class FacebookAdLibrary {
  constructor(private accessToken: string) {}

  async fetchActiveAds(pageUrl: string): Promise<FacebookAd[]> {
    // Extract page ID from URL
    const pageId = await this.getPageId(pageUrl);
    
    const url = new URL('https://graph.facebook.com/v18.0/ads_archive');
    url.searchParams.set('access_token', this.accessToken);
    url.searchParams.set('ad_reached_countries', "['US','GB','AU','CA']");
    url.searchParams.set('ad_active_status', 'ACTIVE');
    url.searchParams.set('search_page_ids', pageId);
    url.searchParams.set('fields', 'id,ad_creative_bodies,ad_creative_link_titles,ad_creative_link_captions,ad_delivery_start_time,page_name');
    url.searchParams.set('limit', '100');

    const response = await fetch(url.toString());
    const data = await response.json();

    return data.data.map((ad: any) => ({
      id: ad.id,
      pageName: ad.page_name,
      bodies: ad.ad_creative_bodies || [],
      titles: ad.ad_creative_link_titles || [],
      captions: ad.ad_creative_link_captions || [],
      startDate: ad.ad_delivery_start_time,
      // Calculate how long they've been running ads
      daysRunning: Math.floor((Date.now() - new Date(ad.ad_delivery_start_time).getTime()) / (1000 * 60 * 60 * 24)),
    }));
  }

  async getPageTransparency(pageUrl: string): Promise<number> {
    // Returns years the page has been running ads
    // This is a simplified version - actual implementation would scrape the transparency page
    const pageId = await this.getPageId(pageUrl);
    
    // Facebook's Page Transparency section shows ad history
    // For now, we'll use the Ad Library API to get earliest ad
    const ads = await this.fetchActiveAds(pageUrl);
    
    if (ads.length === 0) return 0;
    
    const earliestAd = ads.reduce((earliest, ad) => 
      new Date(ad.startDate) < new Date(earliest.startDate) ? ad : earliest
    );
    
    const yearsRunning = (Date.now() - new Date(earliestAd.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.floor(yearsRunning);
  }

  private async getPageId(pageUrl: string): Promise<string> {
    // Extract page ID from URL or fetch via Graph API
    const match = pageUrl.match(/facebook\.com\/([^\/\?]+)/);
    if (!match) throw new Error('Invalid Facebook page URL');
    
    const pageUsername = match[1];
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageUsername}?fields=id&access_token=${this.accessToken}`
    );
    const data = await response.json();
    
    return data.id;
  }
}
```

### Amazon Product API (Reviews)

```typescript
// packages/agent-logic/src/integrations/amazon.ts

export class AmazonReviewsAPI {
  constructor(
    private accessKey: string,
    private secretKey: string,
    private partnerId: string,
  ) {}

  async fetchReviews(asin: string, options: {
    starRating?: number;
    minLength?: number;
    limit?: number;
  }): Promise<AmazonReview[]> {
    // Note: Amazon's official API doesn't provide direct review access
    // Options: 
    // 1. Use Amazon Product Advertising API with browse node
    // 2. Use Cloudflare Browser Rendering to scrape (with rate limiting)
    // 3. Use third-party services like Oxylabs, ScraperAPI
    
    // For this implementation, we'll use Browser Rendering
    const url = `https://www.amazon.com/product-reviews/${asin}/?filterByStar=${options.starRating || 'three'}_star&pageNumber=1`;
    
    // This would be called from a Worker with Browser Rendering binding
    // Placeholder for the scraping logic
    return [];
  }
}

// Browser Rendering implementation
export async function scrapeAmazonReviews(
  browser: BrowserBinding,
  asin: string,
  starRating: number = 3,
  minLength: number = 50,
): Promise<AmazonReview[]> {
  const page = await browser.newPage();
  
  try {
    await page.goto(`https://www.amazon.com/product-reviews/${asin}/?filterByStar=${starRating}_star`, {
      waitUntil: 'networkidle2',
    });

    // Wait for reviews to load
    await page.waitForSelector('[data-hook="review"]', { timeout: 10000 });

    const reviews = await page.evaluate((minLen) => {
      const reviewElements = document.querySelectorAll('[data-hook="review"]');
      const results: any[] = [];

      reviewElements.forEach((el) => {
        const bodyEl = el.querySelector('[data-hook="review-body"]');
        const titleEl = el.querySelector('[data-hook="review-title"]');
        const ratingEl = el.querySelector('[data-hook="review-star-rating"]');
        const dateEl = el.querySelector('[data-hook="review-date"]');

        const body = bodyEl?.textContent?.trim() || '';
        
        if (body.length >= minLen) {
          results.push({
            title: titleEl?.textContent?.trim() || '',
            body,
            rating: ratingEl?.textContent?.match(/(\d)/)?.[1] || '3',
            date: dateEl?.textContent?.trim() || '',
          });
        }
      });

      return results;
    }, minLength);

    return reviews;
  } finally {
    await page.close();
  }
}
```

### Answer The Public Scraper

```typescript
// packages/agent-logic/src/integrations/answer-the-public.ts

export async function scrapeAnswerThePublic(
  browser: BrowserBinding,
  keyword: string,
): Promise<AnswerThePublicResult> {
  const page = await browser.newPage();
  
  try {
    // Note: Answer The Public has rate limits and may require authentication
    // Consider using their API if available, or implementing proper delays
    
    await page.goto(`https://answerthepublic.com/reports/${encodeURIComponent(keyword)}`, {
      waitUntil: 'networkidle2',
    });

    // Wait for results
    await page.waitForSelector('.questions-container', { timeout: 30000 });

    const results = await page.evaluate(() => {
      const questions: string[] = [];
      const prepositions: string[] = [];
      const comparisons: string[] = [];
      const alphabeticals: string[] = [];
      const related: string[] = [];

      // Extract questions (what, why, how, etc.)
      document.querySelectorAll('.questions-list li').forEach(el => {
        questions.push(el.textContent?.trim() || '');
      });

      // Extract preposition-based queries
      document.querySelectorAll('.prepositions-list li').forEach(el => {
        prepositions.push(el.textContent?.trim() || '');
      });

      // Extract comparisons (vs, versus, or)
      document.querySelectorAll('.comparisons-list li').forEach(el => {
        comparisons.push(el.textContent?.trim() || '');
      });

      return { questions, prepositions, comparisons, alphabeticals, related };
    });

    return results;
  } finally {
    await page.close();
  }
}
```

---

## 📁 FILE STRUCTURE TO CREATE

```
quantum-growth-system/
├── apps/
│   ├── dashboard/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── projects/
│   │   │   │   │   ├── ProjectList.tsx
│   │   │   │   │   ├── ProjectCard.tsx
│   │   │   │   │   └── NewProjectWizard.tsx
│   │   │   │   ├── research/
│   │   │   │   │   ├── HaloAnalysisView.tsx
│   │   │   │   │   ├── SourcesTable.tsx
│   │   │   │   │   ├── AvatarProfile.tsx
│   │   │   │   │   └── VernacularGlossary.tsx
│   │   │   │   ├── competitors/
│   │   │   │   │   ├── CompetitorList.tsx
│   │   │   │   │   ├── OfferMapComparison.tsx
│   │   │   │   │   ├── GoldenPheasantUpload.tsx
│   │   │   │   │   └── HITLTaskPanel.tsx
│   │   │   │   ├── offers/
│   │   │   │   │   ├── GodfatherOfferBuilder.tsx
│   │   │   │   │   ├── HVCOTitleGenerator.tsx
│   │   │   │   │   ├── CriticFeedbackPanel.tsx
│   │   │   │   │   └── OfferPreview.tsx
│   │   │   │   └── common/
│   │   │   │       ├── WorkflowProgress.tsx
│   │   │   │       └── NotificationCenter.tsx
│   │   │   ├── routes/
│   │   │   │   ├── __root.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── projects/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── $projectId/
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   │   ├── research.tsx
│   │   │   │   │   │   ├── competitors.tsx
│   │   │   │   │   │   └── offer.tsx
│   │   │   ├── worker/
│   │   │   │   ├── trpc/
│   │   │   │   │   ├── router.ts
│   │   │   │   │   └── routers/
│   │   │   │   │       ├── projects.ts
│   │   │   │   │       ├── research.ts
│   │   │   │   │       ├── competitors.ts
│   │   │   │   │       └── offers.ts
│   │   │   │   └── index.ts
│   │   │   └── lib/
│   │   │       ├── trpc.ts
│   │   │       └── auth.ts
│   │   ├── wrangler.jsonc
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── halo-service/
│       ├── src/
│       │   ├── index.ts
│       │   ├── hono/
│       │   │   └── app.ts
│       │   ├── workflows/
│       │   │   ├── halo-research-workflow.ts
│       │   │   ├── golden-pheasant-workflow.ts
│       │   │   └── godfather-offer-workflow.ts
│       │   ├── queue-handlers/
│       │   │   ├── research-queue.ts
│       │   │   └── notification-queue.ts
│       │   ├── durable-objects/
│       │   │   ├── workflow-coordinator.ts
│       │   │   └── realtime-updates.ts
│       │   └── integrations/
│       │       ├── reddit.ts
│       │       ├── facebook-ads.ts
│       │       ├── amazon.ts
│       │       └── answer-the-public.ts
│       ├── wrangler.jsonc
│       └── package.json
│
├── packages/
│   ├── data-ops/
│   │   ├── src/
│   │   │   ├── schema.ts
│   │   │   ├── db/
│   │   │   │   └── database.ts
│   │   │   ├── queries/
│   │   │   │   ├── projects.ts
│   │   │   │   ├── research.ts
│   │   │   │   ├── competitors.ts
│   │   │   │   └── offers.ts
│   │   │   └── zod/
│   │   │       ├── projects.ts
│   │   │       ├── research.ts
│   │   │       └── offers.ts
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   ├── agent-logic/
│   │   ├── src/
│   │   │   ├── prompts/
│   │   │   │   ├── sophistication-filter.ts
│   │   │   │   ├── halo-extraction.ts
│   │   │   │   ├── visualizer.ts
│   │   │   │   ├── dream-buyer-avatar.ts
│   │   │   │   ├── competitor-analysis.ts
│   │   │   │   ├── godfather-offer.ts
│   │   │   │   ├── hvco-writer.ts
│   │   │   │   └── skeptical-critic.ts
│   │   │   ├── integrations/
│   │   │   │   ├── reddit.ts
│   │   │   │   ├── facebook-ads.ts
│   │   │   │   ├── amazon.ts
│   │   │   │   └── answer-the-public.ts
│   │   │   └── rag/
│   │   │       └── index.ts
│   │   └── package.json
│   │
│   └── shared-types/
│       ├── src/
│       │   ├── project.ts
│       │   ├── research.ts
│       │   ├── competitor.ts
│       │   └── offer.ts
│       └── package.json
│
├── drizzle/
│   └── migrations/
│
├── pnpm-workspace.yaml
├── package.json
├── turbo.json
└── README.md
```

---

## 🚀 IMPLEMENTATION ORDER

### Phase 1: Foundation (Week 1)
1. Set up monorepo with PNPM workspaces
2. Create Cloudflare D1 database and run migrations
3. Implement basic tRPC routes for projects CRUD
4. Build dashboard shell with TanStack Router

### Phase 2: Research Engine (Week 2-3)
1. Implement Reddit API integration
2. Implement Answer The Public scraper (Browser Rendering)
3. Build Sophistication Filter LLM chain
4. Create Halo Extraction workflow
5. Set up Vectorize for embeddings
6. Build Research Dashboard UI

### Phase 3: Competitor Intelligence (Week 4)
1. Implement Facebook Ad Library integration
2. Build Golden Pheasant workflow with HITL
3. Create R2 upload handling for PDFs
4. Build Competitor Mapping UI
5. Implement HITL task notification system

### Phase 4: Offer Generation (Week 5)
1. Implement Godfather Offer generation
2. Build HVCO title generation with Critic loop
3. Create Offer Preview UI
4. Build export functionality (PDF, Markdown)

### Phase 5: Polish & Scale (Week 6)
1. Add real-time updates via Durable Objects
2. Implement comprehensive error handling
3. Add rate limiting and retry logic
4. Performance optimization
5. Documentation and testing

---

## ⚙️ CONFIGURATION

### wrangler.jsonc (halo-service)

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "halo-service",
  "main": "src/index.ts",
  "compatibility_date": "2024-12-01",
  "compatibility_flags": ["nodejs_compat"],
  
  "observability": { "enabled": true },
  
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "quantum-growth-db",
      "database_id": "YOUR_D1_DATABASE_ID"
    }
  ],
  
  "vectorize": [
    {
      "binding": "VECTORIZE",
      "index_name": "market-research-index"
    }
  ],
  
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "quantum-growth-assets"
    }
  ],
  
  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "YOUR_KV_NAMESPACE_ID"
    }
  ],
  
  "queues": {
    "producers": [
      { "binding": "RESEARCH_QUEUE", "queue": "research-processing" },
      { "binding": "NOTIFICATION_QUEUE", "queue": "notifications" }
    ],
    "consumers": [
      { "queue": "research-processing", "max_batch_size": 10 },
      { "queue": "notifications", "max_batch_size": 5 }
    ]
  },
  
  "workflows": [
    {
      "binding": "HALO_RESEARCH_WORKFLOW",
      "name": "halo-research-workflow",
      "class_name": "HaloResearchWorkflow"
    },
    {
      "binding": "GOLDEN_PHEASANT_WORKFLOW",
      "name": "golden-pheasant-workflow",
      "class_name": "GoldenPheasantWorkflow"
    },
    {
      "binding": "GODFATHER_OFFER_WORKFLOW",
      "name": "godfather-offer-workflow",
      "class_name": "GodfatherOfferWorkflow"
    }
  ],
  
  "durable_objects": {
    "bindings": [
      {
        "name": "WORKFLOW_COORDINATOR",
        "class_name": "WorkflowCoordinator"
      },
      {
        "name": "REALTIME_UPDATES",
        "class_name": "RealtimeUpdates"
      }
    ]
  },
  
  "browser": {
    "binding": "BROWSER"
  },
  
  "ai": {
    "binding": "AI"
  },
  
  "vars": {
    "ENVIRONMENT": "production"
  }
}
```

---

## 🔑 SECRETS TO CONFIGURE

```bash
# Reddit API
wrangler secret put REDDIT_CLIENT_ID
wrangler secret put REDDIT_CLIENT_SECRET

# Facebook API
wrangler secret put FACEBOOK_ACCESS_TOKEN

# OpenAI (for higher quality LLM if needed)
wrangler secret put OPENAI_API_KEY

# Notifications (optional)
wrangler secret put SLACK_WEBHOOK_URL
wrangler secret put SENDGRID_API_KEY
```

---

## 📝 NOTES FOR ANTIGRAVITY

1. **Start with the data layer** — Get Drizzle schemas migrated first
2. **Build workflows incrementally** — Test each step before adding the next
3. **Use Workers AI first** — Only fall back to OpenAI for complex tasks
4. **Implement HITL early** — The Golden Pheasant pause/resume is critical
5. **Test sophistication filter heavily** — This determines output quality
6. **Log everything** — Use Cloudflare's observability for debugging workflows

---

## 🎯 SUCCESS CRITERIA

The system is complete when:

1. ✅ User can create a project and input industry/keywords
2. ✅ Halo Research Workflow scrapes and analyzes data automatically
3. ✅ Sophistication Filter correctly classifies Power 4% content
4. ✅ Dream Buyer Avatar is generated from research
5. ✅ Competitor intelligence is gathered (automated + HITL)
6. ✅ Godfather Offer is generated with all 7 pillars
7. ✅ HVCO titles pass the Skeptical Investor Critic (score ≥8)
8. ✅ User can export complete marketing package

---

*End of AntiGravity Prompt*
