import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// === GENERAL TABLES ===

export const clients = sqliteTable('clients', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    status: text('status').default('active').notNull(), // 'active', 'paused', 'archived'
    industry: text('industry'),
    contactEmail: text('contact_email'),
    logoUrl: text('logo_url'),
    brandColor: text('brand_color').default('#1D9BF0'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const client_members = sqliteTable('client_members', {
    id: text('id').primaryKey(),
    client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
    user_id: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // 'agency_owner', 'account_manager', 'creator', 'client_admin', 'client_reviewer'
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const user = sqliteTable("user", {
	id: text('id').primaryKey().notNull(),
	name: text('name').notNull(),
	email: text('email').notNull(),
	emailVerified: integer("email_verified").default(0).notNull(),
	image: text('image'),
	createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
	updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	credits: integer('credits').default(10).notNull(),
});

export const user_profiles = sqliteTable('user_profiles', {
    id: text('id').primaryKey(),
    user_id: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
    display_name: text('display_name'),
    avatar_url: text('avatar_url'),
    avatar_color: text('avatar_color'),
    timezone: text('timezone').default('UTC'),
    active_client_id: text('active_client_id').references(() => clients.id),
    email_notifications: integer('email_notifications', { mode: 'boolean' }).default(true),
    preferences_json: text('preferences_json'),
    created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const hub_registry = sqliteTable('hub_registry', {
    id: text('id').primaryKey(),
    client_id: text('client_id').references(() => clients.id),
    name: text('name').notNull(),
    status: text('status').default('ready'), // 'processing', 'ready', 'archived'
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const extracted_pillars = sqliteTable('extracted_pillars', {
    id: text('id').primaryKey(),
    hub_id: text('hub_id').references(() => hub_registry.id),
    client_id: text('client_id').references(() => clients.id),
    name: text('name').notNull(),
    psychological_angle: text('psychological_angle'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const spokes = sqliteTable('spokes', {
    id: text('id').primaryKey(),
    hub_id: text('hub_id').notNull().references(() => hub_registry.id, { onDelete: 'cascade' }),
    pillar_id: text('pillar_id').notNull().references(() => extracted_pillars.id, { onDelete: 'cascade' }),
    client_id: text('client_id').notNull().references(() => clients.id),
    platform: text('platform').notNull(), // 'twitter', 'linkedin', 'tiktok', 'instagram', 'newsletter', 'thread', 'carousel'
    content: text('content').notNull(),
    psychological_angle: text('psychological_angle').notNull(),
    status: text('status').default('pending'), // 'pending', 'generating', 'ready', 'failed_qa', 'pending_manual_rewrite', 'discarded', 'ready_for_review', 'approved'
    generation_attempt: integer('generation_attempt').default(0),
    manual_feedback_note: text('manual_feedback_note'), // For user provided feedback
    parent_spoke_id: text('parent_spoke_id'), // For variations
    is_variation: integer('is_variation').default(0), // Boolean: 1 if it's a variation
    is_mutated: integer('is_mutated').default(0), // Boolean: 1 if manually edited
    created_at: integer('created_at').default(sql`(unixepoch())`),
});

export const content_assets = sqliteTable('content_assets', {
    id: text('id').primaryKey(),
    spoke_id: text('spoke_id').notNull().references(() => spokes.id, { onDelete: 'cascade' }),
    asset_type: text('asset_type').notNull(), // 'thumbnail', 'carousel_slide', 'quote_card'
    r2_key: text('r2_key').notNull(),
    visual_archetype: text('visual_archetype'),
    alt_text: text('alt_text'),
    created_at: integer('created_at').default(sql`(unixepoch())`),
});

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

    // Amazon 3-Star Review Specifics
    reviewRating: real('review_rating'),
    whatWasMissing: text('what_was_missing'), // The "Golden Gap"
    reviewTitle: text('review_title'),

    status: text('status').default('pending'), // pending | processing | complete | failed
    metadata: text('metadata'), // JSON: subreddit, comment_count, etc.
    isExcluded: integer('is_excluded').default(0),
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
    primalDesires: text('primal_desires'), // JSON array
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const dreamBuyerAvatar = sqliteTable('dream_buyer_avatar', {
    id: text('id').primaryKey(),
    projectId: text('project_id').references(() => projects.id),
    demographics: text('demographics'), // JSON: age, gender, location, income
    psychographics: text('psychographics'), // JSON: values, interests, lifestyle
    dayInTheLife: text('day_in_the_life'), // JSON: structured timeline (wake time -> bed time)
    competitorGapsTheyFeel: text('competitor_gaps_they_feel'), // JSON array: What they hate about current solutions
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
    isWinner: integer().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// === WORKFLOW STATE ===

export const workflowRuns = sqliteTable('workflow_runs', {
    id: text('id').primaryKey(),
    projectId: text('project_id').references(() => projects.id),
    workflowType: text('workflow_type').notNull(), // halo_research | competitor_analysis | offer_generation
    cloudflareWorkflowId: text('cloudflare_workflow_id'),
    status: text('status').default('running'), // running | paused_hitl | complete | failed
    current_step: text('current_step'),
    progress: integer('progress').default(0),
    metadata: text('metadata'), // JSON for extra context
    hitl_request: text('hitl_request'), // JSON: action required from user
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

// === GENERATED CONTENT (Data Lineage) ===

export const generatedContent = sqliteTable('generated_content', {
    id: text('id').primaryKey(),
    projectId: text('project_id').references(() => projects.id),
    content: text('content').notNull(),
    citedSourceId: text('cited_source_id').references(() => researchSources.id),
    status: text('status').default('DRAFT'), // DRAFT | PUBLISHED
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// === ADVERSARIAL CRITIC EVALUATIONS ===

export const banned_words = sqliteTable('banned_words', {
    id: text('id').primaryKey(),
    client_id: text('client_id').notNull().references(() => clients.id),
    word: text('word').notNull(),
    reason: text('reason'),
    severity: text('severity').default('medium'), // 'soft', 'medium', 'hard'
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const voice_markers = sqliteTable('voice_markers', {
    id: text('id').primaryKey(),
    client_id: text('client_id').notNull().references(() => clients.id),
    phrase: text('phrase').notNull(), // e.g., "Think differently", "Move fast"
    usage_guideline: text('usage_guideline'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const spoke_evaluations = sqliteTable('spoke_evaluations', {
    id: text('id').primaryKey(),
    spoke_id: text('spoke_id').notNull().unique().references(() => spokes.id, { onDelete: 'cascade' }),
    client_id: text('client_id').notNull().references(() => clients.id),

    // G2: Hook Strength (0-100)
    g2_score: integer('g2_score'),
    g2_breakdown: text('g2_breakdown'), // JSON: {pattern_interrupt, benefit, curiosity_gap}

    // G4: Voice Alignment (Pass/Fail)
    g4_result: text('g4_result'), // 'pass' | 'fail'
    g4_violations: text('g4_violations'), // JSON array of violations
    g4_similarity_score: real('g4_similarity_score'), // Cosine similarity value

    // G5: Platform Compliance (Pass/Fail)
    g5_result: text('g5_result'), // 'pass' | 'fail'
    g5_violations: text('g5_violations'), // JSON array of violations

    // G7: Engagement Prediction (0-10)
    g7_score: real('g7_score'), 

    // Overall
    overall_pass: integer('overall_pass').default(0), // 1 if all gates pass
    critic_notes: text('critic_notes'), // Concatenated or summary feedback
    evaluated_at: integer('evaluated_at').default(sql`(unixepoch())`),
});

export const feedback_log = sqliteTable('feedback_log', {
    id: text('id').primaryKey(),
    spoke_id: text('spoke_id').notNull().references(() => spokes.id, { onDelete: 'cascade' }),
    client_id: text('client_id').notNull().references(() => clients.id),
    gate_type: text('gate_type').notNull(), // 'g2', 'g4', 'g5'
    score: integer('score'), // For G2
    result: text('result'), // 'pass'/'fail' for G4/G5
    violations_json: text('violations_json'), // Detailed violations
    suggestions: text('suggestions'), // AI-generated improvement suggestions
    healing_attempt: integer('healing_attempt').default(0),
    created_at: integer('created_at').default(sql`(unixepoch())`),
});

export const campaigns = sqliteTable('campaigns', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    name: text('name').notNull(),
    researchData: text('research_data'), // JSON blob
    offerData: text('offer_data'), // JSON blob
    brandVoice: text('brand_voice'), // JSON blob
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const shareable_links = sqliteTable('shareable_links', {
    id: text('id').primaryKey(),
    client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expires_at: integer('expires_at', { mode: 'timestamp' }).notNull(),
    permissions: text('permissions').default('view'), // 'view', 'approve', 'comment'
    allowed_emails: text('allowed_emails'), // JSON string of array
    created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// === TYPE INFERENCE EXPORTS ===

export type Spoke = typeof spokes.$inferSelect;
export type SpokeEvaluation = typeof spoke_evaluations.$inferSelect;
export type FeedbackLog = typeof feedback_log.$inferSelect;

