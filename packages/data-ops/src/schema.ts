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
