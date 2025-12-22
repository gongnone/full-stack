import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ==========================================
// ACCOUNTS & AUTH (Global D1)
// ==========================================

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  plan: text('plan', { enum: ['starter', 'pro', 'enterprise'] }).notNull().default('starter'),
  hubsLimit: integer('hubs_limit').notNull().default(50),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at'),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => accounts.id),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role', { enum: ['owner', 'admin', 'editor', 'viewer'] }).notNull().default('editor'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ==========================================
// CLIENTS (Multi-tenant isolation)
// ==========================================

export const clients = sqliteTable('clients', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => accounts.id),
  name: text('name').notNull(),
  durableObjectId: text('durable_object_id').notNull(),
  vectorizeNamespace: text('vectorize_namespace').notNull(),
  r2PathPrefix: text('r2_path_prefix').notNull(),
  status: text('status', { enum: ['active', 'paused', 'archived'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at'),
});

// ==========================================
// HUBS (Content Management)
// ==========================================

export const hubs = sqliteTable('hubs', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => accounts.id),
  clientId: text('client_id').notNull().references(() => clients.id),
  name: text('name').notNull(),
  status: text('status', {
    enum: ['draft', 'ingesting', 'processing', 'ready', 'failed']
  }).notNull().default('draft'),
  sourceMaterial: text('source_material'), // JSON: { type: 'text' | 'url' | 'file', content: string }
  extractedThemes: text('extracted_themes'), // JSON: { themes: string[], claims: string[], angles: string[] }
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at'),
});

// ==========================================
// SPOKES (Generated Content)
// ==========================================

export const spokes = sqliteTable('spokes', {
  id: text('id').primaryKey(),
  hubId: text('hub_id').notNull().references(() => hubs.id),
  accountId: text('account_id').notNull().references(() => accounts.id),
  clientId: text('client_id').notNull().references(() => clients.id),
  platform: text('platform', {
    enum: ['twitter', 'linkedin', 'tiktok', 'instagram_carousel', 'youtube_script']
  }).notNull(),
  contentType: text('content_type', {
    enum: ['text', 'json']
  }).notNull(), // 'json' for carousels/threads, 'text' for simple posts
  content: text('content').notNull(), // The actual generated content
  status: text('status', {
    enum: ['draft', 'generating', 'generated', 'review', 'approved', 'rejected', 'failed']
  }).notNull().default('draft'),
  evaluationStatus: text('evaluation_status', { // New field for evaluation status
    enum: ['pending', 'evaluated', 'passed', 'failed', 'overridden']
  }).notNull().default('pending'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at'),
});

// ==========================================
// SPOKE EVALUATIONS (Critic Agent Results)
// ==========================================

export const spokeEvaluations = sqliteTable('spoke_evaluations', {
  id: text('id').primaryKey(), // Spoke ID as PK
  spokeId: text('spoke_id').notNull().references(() => spokes.id),
  accountId: text('account_id').notNull().references(() => accounts.id),
  clientId: text('client_id').notNull().references(() => clients.id),
  g2_score: integer('g2_score').notNull(),
  g2_breakdown: text('g2_breakdown'), // JSON
  g4_result: text('g4_result', { enum: ['pass', 'fail'] }).notNull(),
  g4_violations: text('g4_violations'), // JSON
  g4_similarity_score: real('g4_similarity_score'),
  g5_result: text('g5_result', { enum: ['pass', 'fail'] }).notNull(),
  g5_violations: text('g5_violations'), // JSON
  g7_score: integer('g7_score'), // Optional, for later phases
  overall_pass: integer('overall_pass', { mode: 'boolean' }).notNull(), // 0 or 1
  critic_notes: text('critic_notes'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at'),
});

// ==========================================
// GLOBAL METRICS (Aggregated from DOs)
// ==========================================

export const globalMetrics = sqliteTable('global_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: text('account_id').notNull().references(() => accounts.id),
  clientId: text('client_id').references(() => clients.id),
  metricType: text('metric_type').notNull(),
  value: real('value').notNull(),
  periodStart: text('period_start').notNull(),
  periodEnd: text('period_end').notNull(),
  metadata: text('metadata'), // JSON
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ==========================================
// WORKFLOW INSTANCES (Tracking)
// ==========================================

export const workflowInstances = sqliteTable('workflow_instances', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => accounts.id),
  clientId: text('client_id').notNull().references(() => clients.id),
  workflowType: text('workflow_type', {
    enum: ['hub_ingestion', 'spoke_generation', 'calibration']
  }).notNull(),
  status: text('status', {
    enum: ['running', 'completed', 'failed', 'cancelled']
  }).notNull().default('running'),
  inputParams: text('input_params'), // JSON
  outputResult: text('output_result'), // JSON
  errorMessage: text('error_message'),
  startedAt: text('started_at').notNull().default('CURRENT_TIMESTAMP'),
  completedAt: text('completed_at'),
});

// ==========================================
// EXPORT JOBS
// ==========================================

export const exportJobs = sqliteTable('export_jobs', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => accounts.id),
  clientId: text('client_id').notNull().references(() => clients.id),
  format: text('format', { enum: ['csv', 'json'] }).notNull(),
  status: text('status', {
    enum: ['pending', 'processing', 'completed', 'failed']
  }).notNull().default('pending'),
  r2Key: text('r2_key'),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ==========================================
// RELATIONS
// ==========================================

export const accountsRelations = relations(accounts, ({ many }) => ({
  users: many(users),
  clients: many(clients),
  hubs: many(hubs), // Add hubs relation
  metrics: many(globalMetrics),
  workflows: many(workflowInstances),
  exports: many(exportJobs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  account: one(accounts, {
    fields: [users.accountId],
    references: [accounts.id],
  }),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  account: one(accounts, {
    fields: [clients.accountId],
    references: [accounts.id],
  }),
  hubs: many(hubs), // Add hubs relation
  metrics: many(globalMetrics),
  workflows: many(workflowInstances),
  exports: many(exportJobs),
}));

// Define hubs relations
export const hubsRelations = relations(hubs, ({ one, many }) => ({
  account: one(accounts, {
    fields: [hubs.accountId],
    references: [accounts.id],
  }),
  client: one(clients, {
    fields: [hubs.clientId],
    references: [clients.id],
  }),
  spokes: many(spokes), // Add spokes relation
}));

export const globalMetricsRelations = relations(globalMetrics, ({ one }) => ({
  account: one(accounts, {
    fields: [globalMetrics.accountId],
    references: [accounts.id],
  }),
  client: one(clients, {
    fields: [globalMetrics.clientId],
    references: [clients.id],
  }),
}));

export const workflowInstancesRelations = relations(workflowInstances, ({ one }) => ({
  account: one(accounts, {
    fields: [workflowInstances.accountId],
    references: [accounts.id],
  }),
  client: one(clients, {
    fields: [workflowInstances.clientId],
    references: [clients.id],
  }),
}));

export const exportJobsRelations = relations(exportJobs, ({ one }) => ({
  account: one(accounts, {
    fields: [exportJobs.accountId],
    references: [accounts.id],
  }),
  client: one(clients, {
    fields: [exportJobs.clientId],
    references: [clients.id],
  }),
}));

// Define spokes relations
export const spokesRelations = relations(spokes, ({ one }) => ({
  hub: one(hubs, {
    fields: [spokes.hubId],
    references: [hubs.id],
  }),
  account: one(accounts, {
    fields: [spokes.accountId],
    references: [accounts.id],
  }),
  client: one(clients, {
    fields: [spokes.clientId],
    references: [clients.id],
  }),
  evaluation: one(spokeEvaluations, { // Add evaluation relation
    fields: [spokes.id],
    references: [spokeEvaluations.spokeId],
  }),
}));

// Add spokes to accountsRelations and clientsRelations
export const accountsRelations = relations(accounts, ({ many }) => ({
  users: many(users),
  clients: many(clients),
  hubs: many(hubs),
  spokes: many(spokes),
  evaluations: many(spokeEvaluations), // Add spokeEvaluations relation
  metrics: many(globalMetrics),
  workflows: many(workflowInstances),
  exports: many(exportJobs),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  account: one(accounts, {
    fields: [clients.accountId],
    references: [accounts.id],
  }),
  hubs: many(hubs),
  spokes: many(spokes),
  evaluations: many(spokeEvaluations), // Add spokeEvaluations relation
  metrics: many(globalMetrics),
  workflows: many(workflowInstances),
  exports: many(exportJobs),
}));

// Define spokeEvaluations relations
export const spokeEvaluationsRelations = relations(spokeEvaluations, ({ one }) => ({
  spoke: one(spokes, {
    fields: [spokeEvaluations.spokeId],
    references: [spokes.id],
  }),
  account: one(accounts, {
    fields: [spokeEvaluations.accountId],
    references: [accounts.id],
  }),
  client: one(clients, {
    fields: [spokeEvaluations.clientId],
    references: [clients.id],
  }),
}));
