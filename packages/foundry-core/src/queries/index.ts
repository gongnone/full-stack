import { eq, and, desc, sql } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../schema';

type Database = DrizzleD1Database<typeof schema>;

// ==========================================
// ACCOUNT QUERIES
// ==========================================

export async function getAccountById(db: Database, accountId: string) {
  return db.query.accounts.findFirst({
    where: eq(schema.accounts.id, accountId),
  });
}

export async function getAccountWithClients(db: Database, accountId: string) {
  return db.query.accounts.findFirst({
    where: eq(schema.accounts.id, accountId),
    with: {
      clients: true,
    },
  });
}

// ==========================================
// USER QUERIES
// ==========================================

export async function getUserById(db: Database, userId: string) {
  return db.query.users.findFirst({
    where: eq(schema.users.id, userId),
    with: {
      account: true,
    },
  });
}

export async function getUserByEmail(db: Database, email: string) {
  return db.query.users.findFirst({
    where: eq(schema.users.email, email),
    with: {
      account: true,
    },
  });
}

export async function getUsersByAccount(db: Database, accountId: string) {
  return db.query.users.findMany({
    where: eq(schema.users.accountId, accountId),
    orderBy: desc(schema.users.createdAt),
  });
}

// ==========================================
// CLIENT QUERIES
// ==========================================

export async function getClientById(db: Database, clientId: string) {
  return db.query.clients.findFirst({
    where: eq(schema.clients.id, clientId),
  });
}

export async function getClientsByAccount(
  db: Database,
  accountId: string,
  status?: 'active' | 'paused' | 'archived'
) {
  const conditions = [eq(schema.clients.accountId, accountId)];
  if (status) {
    conditions.push(eq(schema.clients.status, status));
  }

  return db.query.clients.findMany({
    where: and(...conditions),
    orderBy: desc(schema.clients.createdAt),
  });
}

export async function createClient(
  db: Database,
  data: {
    id: string;
    accountId: string;
    name: string;
    durableObjectId: string;
    vectorizeNamespace: string;
    r2PathPrefix: string;
  }
) {
  return db.insert(schema.clients).values(data).returning();
}

export async function updateClientStatus(
  db: Database,
  clientId: string,
  status: 'active' | 'paused' | 'archived'
) {
  return db
    .update(schema.clients)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(schema.clients.id, clientId))
    .returning();
}

// ==========================================
// WORKFLOW QUERIES
// ==========================================

export async function createWorkflowInstance(
  db: Database,
  data: {
    id: string;
    accountId: string;
    clientId: string;
    workflowType: 'hub_ingestion' | 'spoke_generation' | 'calibration';
    inputParams?: Record<string, unknown>;
  }
) {
  return db.insert(schema.workflowInstances).values({
    ...data,
    inputParams: data.inputParams ? JSON.stringify(data.inputParams) : null,
    status: 'running',
  }).returning();
}

export async function updateWorkflowInstance(
  db: Database,
  instanceId: string,
  data: {
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    outputResult?: Record<string, unknown>;
    errorMessage?: string;
  }
) {
  return db
    .update(schema.workflowInstances)
    .set({
      status: data.status,
      outputResult: data.outputResult ? JSON.stringify(data.outputResult) : null,
      errorMessage: data.errorMessage,
      completedAt: data.status !== 'running' ? new Date().toISOString() : null,
    })
    .where(eq(schema.workflowInstances.id, instanceId))
    .returning();
}

export async function getWorkflowsByClient(
  db: Database,
  clientId: string,
  options?: { limit?: number; status?: 'running' | 'completed' | 'failed' | 'cancelled' }
) {
  const conditions = [eq(schema.workflowInstances.clientId, clientId)];
  if (options?.status) {
    conditions.push(eq(schema.workflowInstances.status, options.status));
  }

  return db.query.workflowInstances.findMany({
    where: and(...conditions),
    orderBy: desc(schema.workflowInstances.startedAt),
    limit: options?.limit || 50,
  });
}

// ==========================================
// GLOBAL METRICS QUERIES
// ==========================================

export async function recordGlobalMetric(
  db: Database,
  data: {
    accountId: string;
    clientId?: string;
    metricType: string;
    value: number;
    periodStart: string;
    periodEnd: string;
    metadata?: Record<string, unknown>;
  }
) {
  return db.insert(schema.globalMetrics).values({
    ...data,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
  }).returning();
}

export async function getAggregatedMetrics(
  db: Database,
  accountId: string,
  metricType: string,
  periodStart: string,
  periodEnd: string
) {
  const result = await db
    .select({
      total: sql<number>`SUM(${schema.globalMetrics.value})`,
      average: sql<number>`AVG(${schema.globalMetrics.value})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(schema.globalMetrics)
    .where(
      and(
        eq(schema.globalMetrics.accountId, accountId),
        eq(schema.globalMetrics.metricType, metricType),
        sql`${schema.globalMetrics.periodStart} >= ${periodStart}`,
        sql`${schema.globalMetrics.periodEnd} <= ${periodEnd}`
      )
    );

  return result[0];
}

// ==========================================
// EXPORT JOB QUERIES
// ==========================================

export async function createExportJob(
  db: Database,
  data: {
    id: string;
    accountId: string;
    clientId: string;
    format: 'csv' | 'json';
  }
) {
  return db.insert(schema.exportJobs).values({
    ...data,
    status: 'pending',
  }).returning();
}

export async function updateExportJob(
  db: Database,
  exportId: string,
  data: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    r2Key?: string;
    expiresAt?: string;
  }
) {
  return db
    .update(schema.exportJobs)
    .set(data)
    .where(eq(schema.exportJobs.id, exportId))
    .returning();
}

export async function getExportJobsByClient(
  db: Database,
  clientId: string,
  limit = 10
) {
  return db.query.exportJobs.findMany({
    where: eq(schema.exportJobs.clientId, clientId),
    orderBy: desc(schema.exportJobs.createdAt),
    limit,
  });
}

// ==========================================
// USAGE QUERIES
// ==========================================

export async function getMonthlyHubCount(db: Database, accountId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(schema.workflowInstances)
    .where(
      and(
        eq(schema.workflowInstances.accountId, accountId),
        eq(schema.workflowInstances.workflowType, 'hub_ingestion'),
        sql`${schema.workflowInstances.startedAt} >= ${startOfMonth.toISOString()}`
      )
    );

  return result[0]?.count || 0;
}

export async function getAccountUsage(db: Database, accountId: string) {
  const account = await db.query.accounts.findFirst({
    where: eq(schema.accounts.id, accountId),
  });

  const hubsThisMonth = await getMonthlyHubCount(db, accountId);

  return {
    hubsThisMonth,
    limit: account?.hubsLimit || 50,
    remaining: Math.max(0, (account?.hubsLimit || 50) - hubsThisMonth),
    percentUsed: Math.round((hubsThisMonth / (account?.hubsLimit || 50)) * 100),
  };
}
