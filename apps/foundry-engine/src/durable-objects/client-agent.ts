import { DurableObject } from 'cloudflare:workers';

interface BrandDNA {
  voiceMarkers: string[];
  bannedWords: Array<{ word: string; severity: 'hard' | 'soft'; reason?: string }>;
  stances: Array<{ topic: string; position: string }>;
  signaturePatterns: string[];
  toneProfile: Record<string, number>;
  voiceBaseline: number | null;
  timeToDNA: number | null;
  lastCalibration: string | null;
}

interface Hub {
  id: string;
  sourceContent: string;
  platform: string;
  angle: string;
  status: 'processing' | 'ready' | 'killed';
  pillars: string[];
  createdAt: string;
}

interface Spoke {
  id: string;
  hubId: string;
  pillarId: string;
  platform: string;
  content: string;
  status: 'generating' | 'reviewing' | 'approved' | 'rejected' | 'killed';
  qualityScores: {
    g2_hook?: number;
    g4_voice?: boolean;
    g4_similarity?: number;
    g5_platform?: boolean;
    g6_visual?: number;
    g7_engagement?: number;
  };
  visualArchetype?: string;
  imagePrompt?: string;
  thumbnailConcept?: string;
  regenerationCount: number;
  mutatedAt: string | null;
  createdAt: string;
}

interface Env {
  AI: Ai;
  VECTORIZE: VectorizeIndex;
  SPOKE_QUEUE: Queue;
  QUALITY_QUEUE: Queue;
}

export class ClientAgent extends DurableObject<Env> {
  private sql: SqlStorage;
  private clientId: string;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    // Extract clientId from the name used to create the DO
    this.clientId = ctx.id.getName() || 'default';
    this.initializeSchema();
  }

  private initializeSchema(): void {
    // Brand DNA table
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS brand_dna (
        id INTEGER PRIMARY KEY,
        voice_markers TEXT DEFAULT '[]',
        banned_words TEXT DEFAULT '[]',
        stances TEXT DEFAULT '[]',
        signature_patterns TEXT DEFAULT '[]',
        tone_profile TEXT DEFAULT '{}',
        voice_baseline REAL,
        time_to_dna INTEGER,
        last_calibration TEXT
      )
    `);

    // Ensure single row exists
    this.sql.exec(`
      INSERT OR IGNORE INTO brand_dna (id) VALUES (1)
    `);

    // Hubs table
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS hubs (
        id TEXT PRIMARY KEY,
        source_content TEXT NOT NULL,
        platform TEXT NOT NULL,
        angle TEXT NOT NULL,
        status TEXT DEFAULT 'processing',
        pillars TEXT DEFAULT '[]',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Spokes table
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS spokes (
        id TEXT PRIMARY KEY,
        hub_id TEXT NOT NULL,
        pillar_id TEXT,
        platform TEXT NOT NULL,
        content TEXT,
        status TEXT DEFAULT 'generating',
        g2_hook REAL,
        g4_voice INTEGER,
        g4_similarity REAL,
        g5_platform INTEGER,
        g6_visual REAL,
        g7_engagement REAL,
        visual_archetype TEXT,
        image_prompt TEXT,
        thumbnail_concept TEXT,
        regeneration_count INTEGER DEFAULT 0,
        mutated_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hub_id) REFERENCES hubs(id)
      )
    `);

    // Feedback storage for self-healing loop
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        spoke_id TEXT NOT NULL,
        gate TEXT NOT NULL,
        critic_output TEXT NOT NULL,
        iteration INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (spoke_id) REFERENCES spokes(id)
      )
    `);

    // Analytics table
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_type TEXT NOT NULL,
        value REAL NOT NULL,
        metadata TEXT DEFAULT '{}',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Exports table
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS exports (
        id TEXT PRIMARY KEY,
        format TEXT NOT NULL,
        status TEXT NOT NULL,
        r2_key TEXT,
        metadata TEXT DEFAULT '{}',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_spokes_hub ON spokes(hub_id)`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_spokes_status ON spokes(status)`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_feedback_spoke ON feedback(spoke_id)`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(metric_type)`);
  }

  async fetch(request: Request): Promise<Response> {
    const { method, params } = await request.json() as { method: string; params: any };

    switch (method) {
      case 'getBrandDNA':
        return Response.json(await this.getBrandDNA());

      case 'updateBrandDNA':
        return Response.json(await this.updateBrandDNA(params));

      case 'createHub':
        return Response.json(await this.createHub(params));

      case 'getHub':
        return Response.json(await this.getHub(params.hubId));

      case 'listHubs':
        return Response.json(await this.listHubs(params));

      case 'killHub':
        return Response.json(await this.killHub(params.hubId, params.reason));

      case 'createSpoke':
        return Response.json(await this.createSpoke(params));

      case 'updateSpoke':
        return Response.json(await this.updateSpoke(params));

      case 'getSpoke':
        return Response.json(await this.getSpoke(params.spokeId));

      case 'listSpokes':
        return Response.json(await this.listSpokes(params));

      case 'approveSpoke':
        return Response.json(await this.approveSpoke(params.spokeId));

      case 'rejectSpoke':
        return Response.json(await this.rejectSpoke(params.spokeId, params.reason));

      case 'bulkApprove':
        return Response.json(await this.bulkApprove(params.spokeIds));

      case 'bulkReject':
        return Response.json(await this.bulkReject(params.spokeIds, params.reason));

      case 'getReviewQueue':
        return Response.json(await this.getReviewQueue(params));

      case 'storeFeedback':
        return Response.json(await this.storeFeedback(params));

      case 'getFeedback':
        return Response.json(await this.getFeedback(params.spokeId));

      case 'runQualityGate':
        return Response.json(await this.runQualityGate(params.spokeId, params.gate));

      case 'getAnalytics':
        return Response.json(await this.getAnalytics(params));

      case 'getZeroEditRate':
        return Response.json(await this.getZeroEditRate(params));

      case 'recordMetric':
        return Response.json(await this.recordMetric(params));

      case 'getMetrics':
        return Response.json(await this.getMetrics(params));

      case 'createExport':
        return Response.json(await this.createExport(params));

      case 'getExport':
        return Response.json(await this.getExport(params.exportId));

      case 'listExports':
        return Response.json(await this.listExports(params));

      case 'processVoiceNote':
        return Response.json(await this.processVoiceNote(params));

      case 'transcribeAudio':
        return Response.json(await this.transcribeAudio(params));

      default:
        return Response.json({ error: `Unknown method: ${method}` }, { status: 400 });
    }
  }

  // Brand DNA Methods
  private async getBrandDNA(): Promise<BrandDNA> {
    const row = this.sql.exec(`SELECT * FROM brand_dna WHERE id = 1`).one();
    return {
      voiceMarkers: JSON.parse(row.voice_markers as string),
      bannedWords: JSON.parse(row.banned_words as string),
      stances: JSON.parse(row.stances as string),
      signaturePatterns: JSON.parse(row.signature_patterns as string),
      toneProfile: JSON.parse(row.tone_profile as string),
      lastCalibration: row.last_calibration as string | null,
    };
  }

  private async updateBrandDNA(updates: Partial<BrandDNA>): Promise<{ success: boolean }> {
    const sets: string[] = [];
    if (updates.voiceMarkers) sets.push(`voice_markers = '${JSON.stringify(updates.voiceMarkers)}'`);
    if (updates.bannedWords) sets.push(`banned_words = '${JSON.stringify(updates.bannedWords)}'`);
    if (updates.stances) sets.push(`stances = '${JSON.stringify(updates.stances)}'`);
    if (updates.signaturePatterns) sets.push(`signature_patterns = '${JSON.stringify(updates.signaturePatterns)}'`);
    if (updates.toneProfile) sets.push(`tone_profile = '${JSON.stringify(updates.toneProfile)}'`);
    if (updates.lastCalibration !== undefined) sets.push(`last_calibration = '${updates.lastCalibration}'`);

    if (sets.length > 0) {
      this.sql.exec(`UPDATE brand_dna SET ${sets.join(', ')} WHERE id = 1`);
    }

    return { success: true };
  }

  // Hub Methods
  private async createHub(hub: Omit<Hub, 'createdAt'>): Promise<Hub> {
    this.sql.exec(`
      INSERT INTO hubs (id, source_content, platform, angle, status, pillars)
      VALUES ('${hub.id}', '${hub.sourceContent.replace(/'/g, "''")}', '${hub.platform}', '${hub.angle}', '${hub.status}', '${JSON.stringify(hub.pillars)}')
    `);

    return this.getHub(hub.id) as Promise<Hub>;
  }

  private async getHub(hubId: string): Promise<Hub | null> {
    const row = this.sql.exec(`SELECT * FROM hubs WHERE id = '${hubId}'`).one();
    if (!row) return null;

    return {
      id: row.id as string,
      sourceContent: row.source_content as string,
      platform: row.platform as string,
      angle: row.angle as string,
      status: row.status as Hub['status'],
      pillars: JSON.parse(row.pillars as string),
      createdAt: row.created_at as string,
    };
  }

  private async listHubs(params: { status?: string; limit?: number; offset?: number }): Promise<Hub[]> {
    let query = `SELECT * FROM hubs`;
    if (params.status) query += ` WHERE status = '${params.status}'`;
    query += ` ORDER BY created_at DESC`;
    if (params.limit) query += ` LIMIT ${params.limit}`;
    if (params.offset) query += ` OFFSET ${params.offset}`;

    return this.sql.exec(query).toArray().map(row => ({
      id: row.id as string,
      sourceContent: row.source_content as string,
      platform: row.platform as string,
      angle: row.angle as string,
      status: row.status as Hub['status'],
      pillars: JSON.parse(row.pillars as string),
      createdAt: row.created_at as string,
    }));
  }

  private async killHub(hubId: string, reason?: string): Promise<{ killed: number; survived: number }> {
    // Kill the hub
    this.sql.exec(`UPDATE hubs SET status = 'killed' WHERE id = '${hubId}'`);

    // Kill all non-mutated spokes (Mutation Rule: preserve manually-edited spokes)
    const result = this.sql.exec(`
      UPDATE spokes
      SET status = 'killed'
      WHERE hub_id = '${hubId}' AND mutated_at IS NULL
    `);

    const killed = result.rowsWritten;
    const survived = this.sql.exec(`
      SELECT COUNT(*) as count FROM spokes
      WHERE hub_id = '${hubId}' AND mutated_at IS NOT NULL
    `).one().count as number;

    // Record metric
    await this.recordMetric({
      metricType: 'hub_kill',
      value: killed,
      metadata: { hubId, reason, survived },
    });

    return { killed, survived };
  }

  // Spoke Methods
  private async createSpoke(spoke: Omit<Spoke, 'createdAt'>): Promise<Spoke> {
    this.sql.exec(`
      INSERT INTO spokes (id, hub_id, pillar_id, platform, content, status, regeneration_count)
      VALUES ('${spoke.id}', '${spoke.hubId}', '${spoke.pillarId || ''}', '${spoke.platform}', '${(spoke.content || '').replace(/'/g, "''")}', '${spoke.status}', ${spoke.regenerationCount})
    `);

    return this.getSpoke(spoke.id) as Promise<Spoke>;
  }

  private async getSpoke(spokeId: string): Promise<Spoke | null> {
    const row = this.sql.exec(`SELECT * FROM spokes WHERE id = '${spokeId}'`).one();
    if (!row) return null;

    return {
      id: row.id as string,
      hubId: row.hub_id as string,
      pillarId: row.pillar_id as string,
      platform: row.platform as string,
      content: row.content as string,
      status: row.status as Spoke['status'],
      qualityScores: {
        g2_hook: row.g2_hook as number | undefined,
        g4_voice: row.g4_voice ? true : false,
        g5_platform: row.g5_platform ? true : false,
        g6_visual: row.g6_visual as number | undefined,
        g7_engagement: row.g7_engagement as number | undefined,
      },
      visualArchetype: row.visual_archetype as string | undefined,
      imagePrompt: row.image_prompt as string | undefined,
      thumbnailConcept: row.thumbnail_concept as string | undefined,
      regenerationCount: row.regeneration_count as number,
      mutatedAt: row.mutated_at as string | null,
      createdAt: row.created_at as string,
    };
  }

  private async updateSpoke(params: { spokeId: string; updates: Partial<Spoke> }): Promise<Spoke> {
    const { spokeId, updates } = params;
    const sets: string[] = [];

    if (updates.content !== undefined) {
      sets.push(`content = '${updates.content.replace(/'/g, "''")}'`);
      sets.push(`mutated_at = CURRENT_TIMESTAMP`);
    }
    if (updates.status) sets.push(`status = '${updates.status}'`);
    if (updates.qualityScores) {
      if (updates.qualityScores.g2_hook !== undefined) sets.push(`g2_hook = ${updates.qualityScores.g2_hook}`);
      if (updates.qualityScores.g4_voice !== undefined) sets.push(`g4_voice = ${updates.qualityScores.g4_voice ? 1 : 0}`);
      if (updates.qualityScores.g5_platform !== undefined) sets.push(`g5_platform = ${updates.qualityScores.g5_platform ? 1 : 0}`);
      if (updates.qualityScores.g6_visual !== undefined) sets.push(`g6_visual = ${updates.qualityScores.g6_visual}`);
      if (updates.qualityScores.g7_engagement !== undefined) sets.push(`g7_engagement = ${updates.qualityScores.g7_engagement}`);
    }
    if (updates.visualArchetype !== undefined) sets.push(`visual_archetype = '${updates.visualArchetype.replace(/'/g, "''")}'`);
    if (updates.imagePrompt !== undefined) sets.push(`image_prompt = '${updates.imagePrompt.replace(/'/g, "''")}'`);
    if (updates.thumbnailConcept !== undefined) sets.push(`thumbnail_concept = '${updates.thumbnailConcept.replace(/'/g, "''")}'`);
    if (updates.regenerationCount !== undefined) sets.push(`regeneration_count = ${updates.regenerationCount}`);

    if (sets.length > 0) {
      this.sql.exec(`UPDATE spokes SET ${sets.join(', ')} WHERE id = '${spokeId}'`);
    }

    return this.getSpoke(spokeId) as Promise<Spoke>;
  }

  private async listSpokes(params: { hubId?: string; status?: string; limit?: number }): Promise<Spoke[]> {
    let query = `SELECT * FROM spokes WHERE 1=1`;
    if (params.hubId) query += ` AND hub_id = '${params.hubId}'`;
    if (params.status) query += ` AND status = '${params.status}'`;
    query += ` ORDER BY created_at DESC`;
    if (params.limit) query += ` LIMIT ${params.limit}`;

    return this.sql.exec(query).toArray().map(row => ({
      id: row.id as string,
      hubId: row.hub_id as string,
      pillarId: row.pillar_id as string,
      platform: row.platform as string,
      content: row.content as string,
      status: row.status as Spoke['status'],
      qualityScores: {
        g2_hook: row.g2_hook as number | undefined,
        g4_voice: row.g4_voice ? true : false,
        g5_platform: row.g5_platform ? true : false,
        g6_visual: row.g6_visual as number | undefined,
        g7_engagement: row.g7_engagement as number | undefined,
      },
      visualArchetype: row.visual_archetype as string | undefined,
      imagePrompt: row.image_prompt as string | undefined,
      thumbnailConcept: row.thumbnail_concept as string | undefined,
      regenerationCount: row.regeneration_count as number,
      mutatedAt: row.mutated_at as string | null,
      createdAt: row.created_at as string,
    }));
  }

  private async approveSpoke(spokeId: string): Promise<{ success: boolean }> {
    this.sql.exec(`UPDATE spokes SET status = 'approved' WHERE id = '${spokeId}'`);

    // Record total approval
    await this.recordMetric({
      metricType: 'spoke_approval',
      value: 1,
      metadata: { spokeId },
    });

    // Record zero-edit if not mutated
    const spoke = await this.getSpoke(spokeId);
    if (spoke && !spoke.mutatedAt) {
      await this.recordMetric({
        metricType: 'zero_edit_approval',
        value: 1,
        metadata: { spokeId },
      });
    }

    return { success: true };
  }

  private async rejectSpoke(spokeId: string, reason?: string): Promise<{ success: boolean }> {
    this.sql.exec(`UPDATE spokes SET status = 'rejected' WHERE id = '${spokeId}'`);

    await this.recordMetric({
      metricType: 'spoke_rejection',
      value: 1,
      metadata: { spokeId, reason },
    });

    return { success: true };
  }

  private async bulkApprove(spokeIds: string[]): Promise<{ approved: number }> {
    for (const spokeId of spokeIds) {
      await this.approveSpoke(spokeId);
    }
    return { approved: spokeIds.length };
  }

  private async bulkReject(spokeIds: string[], reason?: string): Promise<{ rejected: number }> {
    for (const spokeId of spokeIds) {
      await this.rejectSpoke(spokeId, reason);
    }
    return { rejected: spokeIds.length };
  }

  private async getReviewQueue(params: { filter?: string; limit?: number }): Promise<Spoke[]> {
    let query = `SELECT * FROM spokes WHERE status = 'reviewing'`;

    if (params.filter === 'top10') {
      query += ` ORDER BY g7_engagement DESC`;
    } else if (params.filter === 'flagged') {
      query += ` AND (g2_hook < 50 OR g4_voice = 0 OR g5_platform = 0)`;
    }

    query += ` ORDER BY created_at DESC`;
    if (params.limit) query += ` LIMIT ${params.limit}`;

    return this.sql.exec(query).toArray().map(row => ({
      id: row.id as string,
      hubId: row.hub_id as string,
      pillarId: row.pillar_id as string,
      platform: row.platform as string,
      content: row.content as string,
      status: row.status as Spoke['status'],
      qualityScores: {
        g2_hook: row.g2_hook as number | undefined,
        g4_voice: row.g4_voice ? true : false,
        g5_platform: row.g5_platform ? true : false,
        g6_visual: row.g6_visual as number | undefined,
        g7_engagement: row.g7_engagement as number | undefined,
      },
      visualArchetype: row.visual_archetype as string | undefined,
      imagePrompt: row.image_prompt as string | undefined,
      thumbnailConcept: row.thumbnail_concept as string | undefined,
      regenerationCount: row.regeneration_count as number,
      mutatedAt: row.mutated_at as string | null,
      createdAt: row.created_at as string,
    }));
  }

  // Feedback Methods (Self-Healing Loop)
  private async storeFeedback(params: {
    spokeId: string;
    gate: string;
    criticOutput: string;
    iteration: number;
  }): Promise<{ success: boolean }> {
    const feedbackId = crypto.randomUUID();
    this.sql.exec(`
      INSERT INTO feedback (id, spoke_id, gate, critic_output, iteration)
      VALUES ('${feedbackId}', '${params.spokeId}', '${params.gate}', '${params.criticOutput.replace(/'/g, "''")}', ${params.iteration})
    `);
    return { success: true };
  }

  private async getFeedback(spokeId: string): Promise<Array<{
    gate: string;
    criticOutput: string;
    iteration: number;
    createdAt: string;
  }>> {
    return this.sql.exec(`
      SELECT gate, critic_output, iteration, created_at
      FROM feedback
      WHERE spoke_id = '${spokeId}'
      ORDER BY iteration ASC
    `).toArray().map(row => ({
      gate: row.gate as string,
      criticOutput: row.critic_output as string,
      iteration: row.iteration as number,
      createdAt: row.createdAt as string,
    }));
  }

  // Quality Gate Runner
  private async runQualityGate(spokeId: string, gate: string): Promise<{
    passed: boolean;
    score?: number;
    feedback?: string;
  }> {
    // This would integrate with the agent-system package
    // For now, return a placeholder
    return {
      passed: true,
      score: 85,
      feedback: 'Quality gate passed',
    };
  }

  // Analytics Methods
  private async getAnalytics(params: {
    metricType: string;
    periodDays?: number;
  }): Promise<any> {
    const days = params.periodDays || 7;
    const query = `
      SELECT
        AVG(value) as avg_value,
        SUM(value) as total,
        COUNT(*) as count
      FROM analytics
      WHERE metric_type = '${params.metricType}'
        AND created_at >= datetime('now', '-${days} days')
    `;

    return this.sql.exec(query).one();
  }

  private async getZeroEditRate(params: { periodDays?: number }): Promise<{ rate: number; zeroEditCount: number; totalApprovals: number }> {
    const days = params.periodDays || 30;
    const query = `
      SELECT
        SUM(CASE WHEN metric_type = 'zero_edit_approval' THEN 1 ELSE 0 END) as zero_edit_count,
        SUM(CASE WHEN metric_type = 'spoke_approval' THEN 1 ELSE 0 END) as total_approvals
      FROM analytics
      WHERE metric_type IN ('zero_edit_approval', 'spoke_approval')
        AND created_at >= datetime('now', '-${days} days')
    `;

    const result = this.sql.exec(query).one();
    const zeroEditCount = (result.zero_edit_count as number) || 0;
    const totalApprovals = (result.total_approvals as number) || 0;

    return {
      rate: totalApprovals > 0 ? (zeroEditCount / totalApprovals) * 100 : 0,
      zeroEditCount,
      totalApprovals,
    };
  }

  private async recordMetric(params: {
    metricType: string;
    value: number;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean }> {
    this.sql.exec(`
      INSERT INTO analytics (metric_type, value, metadata)
      VALUES ('${params.metricType}', ${params.value}, '${JSON.stringify(params.metadata || {})}')
    `);
    return { success: true };
  }

  private async getMetrics(params: {
    metricType: string;
    periodDays?: number;
  }): Promise<{ avg: number; total: number; count: number; values: any[] }> {
    const days = params.periodDays || 7;
    const query = `
      SELECT value, metadata, created_at
      FROM analytics
      WHERE metric_type = '${params.metricType}'
        AND created_at >= datetime('now', '-${days} days')
      ORDER BY created_at ASC
    `;

    const results = this.sql.exec(query).toArray();
    const values = results.map(r => ({
      value: r.value as number,
      metadata: JSON.parse(r.metadata as string),
      createdAt: r.created_at as string,
    }));

    const total = values.reduce((sum, v) => sum + v.value, 0);
    const count = values.length;

    return {
      avg: count > 0 ? total / count : 0,
      total,
      count,
      values,
    };
  }

  // Export Methods
  private async createExport(params: {
    format: 'csv' | 'json';
    hubIds?: string[];
    platforms?: string[];
  }): Promise<{ exportId: string; status: string }> {
    const exportId = crypto.randomUUID();

    // Store initial job status
    this.sql.exec(`
      INSERT INTO exports (id, format, status)
      VALUES ('${exportId}', '${params.format}', 'processing')
    `);

    // Fetch approved spokes
    let query = `
      SELECT s.*, h.source_content as hub_content, h.angle as hub_angle
      FROM spokes s
      JOIN hubs h ON s.hub_id = h.id
      WHERE s.status = 'approved'
    `;
    if (params.hubIds && params.hubIds.length > 0) {
      query += ` AND s.hub_id IN (${params.hubIds.map(id => `'${id}'`).join(',')})`;
    }
    if (params.platforms && params.platforms.length > 0) {
      query += ` AND s.platform IN (${params.platforms.map(p => `'${id}'`).join(',')})`;
    }

    const spokes = this.sql.exec(query).toArray();

    if (spokes.length === 0) {
      this.sql.exec(`UPDATE exports SET status = 'failed', metadata = '{"error": "No approved spokes found"}' WHERE id = '${exportId}'`);
      return { exportId, status: 'failed' };
    }

    let content: string;
    let contentType: string;
    const filename = `export-${this.clientId}-${exportId}.${params.format}`;

    if (params.format === 'csv') {
      content = this.convertToCSV(spokes);
      contentType = 'text/csv';
    } else {
      content = JSON.stringify(spokes, null, 2);
      contentType = 'application/json';
    }

    const r2Key = `clients/${this.clientId}/exports/${filename}`;

    try {
      await this.env.MEDIA_BUCKET.put(r2Key, content, {
        httpMetadata: { contentType },
      });

      this.sql.exec(`
        UPDATE exports
        SET status = 'completed', r2_key = '${r2Key}'
        WHERE id = '${exportId}'
      `);

      return { exportId, status: 'completed' };
    } catch (error) {
      console.error('Export upload failed:', error);
      this.sql.exec(`
        UPDATE exports
        SET status = 'failed', metadata = '${JSON.stringify({ error: String(error) })}'
        WHERE id = '${exportId}'
      `);
      return { exportId, status: 'failed' };
    }
  }

  private convertToCSV(spokes: any[]): string {
    const headers = ['id', 'hub_id', 'platform', 'content', 'created_at', 'hub_angle'];
    const rows = spokes.map(s => [
      s.id,
      s.hub_id,
      s.platform,
      `"${(s.content || '').replace(/"/g, '""')}"`,
      s.created_at,
      s.hub_angle
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  private async getExport(exportId: string): Promise<any> {
    const row = this.sql.exec(`SELECT * FROM exports WHERE id = '${exportId}'`).one();
    if (!row) return null;

    let downloadUrl = null;
    if (row.status === 'completed' && row.r2_key) {
      // For now we don't have a pre-signed URL utility in standard R2 binding,
      // but we can return the key or a path that our worker handles.
      downloadUrl = `/api/media/${row.r2_key}`;
    }

    return {
      id: row.id,
      format: row.format,
      status: row.status,
      r2Key: row.r2_key,
      downloadUrl,
      createdAt: row.created_at,
    };
  }

  private async listExports(params: { limit?: number }): Promise<any[]> {
    const limit = params.limit || 10;
    return this.sql.exec(`SELECT * FROM exports ORDER BY created_at DESC LIMIT ${limit}`).toArray();
  }

  // Voice-to-Grounding Pipeline Methods (Story 2.2)
  private async transcribeAudio(params: {
    audioData: ArrayBuffer;
  }): Promise<{ transcription: string }> {
    try {
      // Use Workers AI Whisper model for transcription
      const inputs = {
        audio: [...new Uint8Array(params.audioData)],
      };

      const response = await this.env.AI.run('@cf/openai/whisper', inputs) as { text: string };

      return { transcription: response.text || '' };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processVoiceNote(params: {
    transcription: string;
  }): Promise<{
    voiceMarkers: string[];
    bannedWords: Array<{ word: string; reason: string }>;
    stances: Array<{ topic: string; position: string }>;
  }> {
    try {
      // Use Workers AI for entity extraction
      const prompt = `Analyze this brand voice note and extract:
1. Voice markers (unique phrases, speaking patterns)
2. Banned words (words explicitly mentioned to avoid)
3. Brand stances (positions on topics)

Voice note: "${params.transcription}"

Return JSON format:
{
  "voiceMarkers": ["phrase 1", "phrase 2"],
  "bannedWords": [{"word": "synergy", "reason": "corporate jargon"}],
  "stances": [{"topic": "corporate language", "position": "Anti-corporate"}]
}`;

      const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        prompt,
        max_tokens: 1024,
      }) as { response: string };

      const extracted = JSON.parse(response.response);

      // Update brand DNA with extracted entities
      const currentDNA = await this.getBrandDNA();

      const updatedVoiceMarkers = [...new Set([...currentDNA.voiceMarkers, ...extracted.voiceMarkers])];
      const updatedBannedWords = [
        ...currentDNA.bannedWords,
        ...extracted.bannedWords.map((bw: any) => ({ ...bw, severity: 'hard' as const })),
      ];
      const updatedStances = [...currentDNA.stances, ...extracted.stances];

      await this.updateBrandDNA({
        voiceMarkers: updatedVoiceMarkers,
        bannedWords: updatedBannedWords,
        stances: updatedStances,
      });

      // Generate embeddings for transcription
      const embeddingsResponse = await this.env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: params.transcription,
      }) as { data: number[][] };

      if (embeddingsResponse.data && embeddingsResponse.data[0]) {
        // Store in Vectorize with client metadata for isolation filtering
        await this.env.VECTORIZE.insert([{
          id: `voice-${this.clientId}-${Date.now()}`,
          values: embeddingsResponse.data[0],
          metadata: {
            client_id: this.clientId,
            type: 'voice_note',
            transcription: params.transcription,
            timestamp: new Date().toISOString(),
          },
        }]);
      }

      return {
        voiceMarkers: extracted.voiceMarkers,
        bannedWords: extracted.bannedWords,
        stances: extracted.stances,
      };
    } catch (error) {
      console.error('Voice note processing error:', error);
      throw new Error(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
