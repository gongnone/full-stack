import { DurableObject } from 'cloudflare:workers'

interface VoiceMarker {
  id: string
  phrase: string
  source: 'voice' | 'manual' | 'analysis'
  confidence: number
  createdAt: string
}

interface BannedWord {
  id: string
  word: string
  severity: 'hard' | 'soft'
  reason?: string
  source: 'voice' | 'manual' | 'analysis'
  createdAt: string
}

interface BrandStance {
  id: string
  topic: string
  position: string
  source: 'voice' | 'manual' | 'analysis'
  createdAt: string
}

interface BrandDNA {
  voiceMarkers: VoiceMarker[]
  bannedWords: BannedWord[]
  stances: BrandStance[]
  signaturePatterns: string[]
  toneProfile: Record<string, number>
  voiceBaseline: number | null
  timeToDNA: number | null
  lastCalibration: string | null
}

interface Hub {
  id: string
  sourceContent: string
  platform: string
  angle: string
  status: 'processing' | 'ready' | 'killed'
  pillars: string[]
  createdAt: string
}

interface Spoke {
  id: string
  hubId: string
  pillarId: string
  platform: string
  content: string
  status: 'generating' | 'reviewing' | 'approved' | 'rejected' | 'killed'
  qualityScores: {
    g2_hook?: number
    g4_voice?: boolean
    g4_similarity?: number
    g5_platform?: boolean
    g6_visual?: number
    g7_engagement?: number
  }
  visualArchetype?: string
  imagePrompt?: string
  thumbnailConcept?: string
  regenerationCount: number
  mutatedAt: string | null
  createdAt: string
}

interface Env {
  AI: Ai
  VECTORIZE: VectorizeIndex
  SPOKE_QUEUE: Queue
  QUALITY_QUEUE: Queue
  MEDIA_BUCKET: R2Bucket
}

export class ClientAgent extends DurableObject<Env> {
  private sql: SqlStorage
  private clientId: string

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.sql = ctx.storage.sql
    // Extract clientId from the DO id string
    this.clientId = ctx.id.toString()
    this.initializeSchema()
  }

  private initializeSchema(): void {
    // Voice Markers table (normalized - per architecture spec)
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS voice_markers (
        id TEXT PRIMARY KEY,
        phrase TEXT NOT NULL UNIQUE,
        source TEXT NOT NULL DEFAULT 'manual',
        confidence REAL DEFAULT 1.0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Banned Words table (normalized - per architecture spec)
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS banned_words (
        id TEXT PRIMARY KEY,
        word TEXT NOT NULL UNIQUE,
        severity TEXT NOT NULL DEFAULT 'hard',
        reason TEXT,
        source TEXT NOT NULL DEFAULT 'manual',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Brand Stances table (normalized - per architecture spec)
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS brand_stances (
        id TEXT PRIMARY KEY,
        topic TEXT NOT NULL,
        position TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'manual',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(topic, position)
      )
    `)

    // Brand DNA metadata table (for baseline scores and calibration state)
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS brand_dna (
        id INTEGER PRIMARY KEY,
        signature_patterns TEXT DEFAULT '[]',
        tone_profile TEXT DEFAULT '{}',
        voice_baseline REAL,
        time_to_dna INTEGER,
        last_calibration TEXT
      )
    `)

    // Ensure single row exists for metadata
    this.sql.exec(`
      INSERT OR IGNORE INTO brand_dna (id) VALUES (1)
    `)

    // Create indexes for voice tables
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_voice_markers_phrase ON voice_markers(phrase)`)
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_banned_words_word ON banned_words(word)`)
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_brand_stances_topic ON brand_stances(topic)`)

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
    `)

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
    `)

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
    `)

    // Analytics table
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_type TEXT NOT NULL,
        value REAL NOT NULL,
        metadata TEXT DEFAULT '{}',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

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
    `)

    // Create indexes
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_spokes_hub ON spokes(hub_id)`)
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_spokes_status ON spokes(status)`)
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_feedback_spoke ON feedback(spoke_id)`)
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(metric_type)`)
  }

  async fetch(request: Request): Promise<Response> {
    const { method, params } = await request.json() as { method: string; params: any }

    switch (method) {
      case 'getBrandDNA':
        return Response.json(await this.getBrandDNA())

      case 'getDNAReport':
        return Response.json(await this.getDNAReport())

      case 'getTimeToDNA':
        return Response.json(await this.getTimeToDNA())

      case 'updateBrandDNA':
        return Response.json(await this.updateBrandDNA(params))

      case 'createHub':
        return Response.json(await this.createHub(params))

      case 'getHub':
        return Response.json(await this.getHub(params.hubId))

      case 'listHubs':
        return Response.json(await this.listHubs(params))

      case 'killHub':
        return Response.json(await this.killHub(params.hubId, params.reason))

      case 'createSpoke':
        return Response.json(await this.createSpoke(params))

      case 'updateSpoke':
        return Response.json(await this.updateSpoke(params))

      case 'getSpoke':
        return Response.json(await this.getSpoke(params.spokeId))

      case 'listSpokes':
        return Response.json(await this.listSpokes(params))

      case 'approveSpoke':
        return Response.json(await this.approveSpoke(params.spokeId))

      case 'rejectSpoke':
        return Response.json(await this.rejectSpoke(params.spokeId, params.reason))

      case 'bulkApprove':
        return Response.json(await this.bulkApprove(params.spokeIds))

      case 'bulkReject':
        return Response.json(await this.bulkReject(params.spokeIds, params.reason))

      case 'getReviewQueue':
        return Response.json(await this.getReviewQueue(params))

      case 'storeFeedback':
        return Response.json(await this.storeFeedback(params))

      case 'getFeedback':
        return Response.json(await this.getFeedback(params.spokeId))

      case 'runQualityGate':
        return Response.json(await this.runQualityGate(params.spokeId, params.gate))

      case 'getAnalytics':
        return Response.json(await this.getAnalytics(params))

      case 'getZeroEditRate':
        return Response.json(await this.getZeroEditRate(params))

      case 'recordMetric':
        return Response.json(await this.recordMetric(params))

      case 'getMetrics':
        return Response.json(await this.getMetrics(params))

      case 'createExport':
        return Response.json(await this.createExport(params))

      case 'getExport':
        return Response.json(await this.getExport(params.exportId))

      case 'listExports':
        return Response.json(await this.listExports(params))

      case 'processVoiceNote':
        return Response.json(await this.processVoiceNote(params))

      case 'transcribeAudio':
        return Response.json(await this.transcribeAudio(params))

      // Voice Markers CRUD (Story 2.5)
      case 'listVoiceMarkers':
        return Response.json(await this.listVoiceMarkers())

      case 'addVoiceMarker':
        return Response.json(await this.addVoiceMarker(params))

      case 'removeVoiceMarker':
        return Response.json(await this.removeVoiceMarker(params.markerId))

      case 'updateVoiceMarker':
        return Response.json(await this.updateVoiceMarker(params))

      // Banned Words CRUD (Story 2.5)
      case 'listBannedWords':
        return Response.json(await this.listBannedWords())

      case 'addBannedWord':
        return Response.json(await this.addBannedWord(params))

      case 'removeBannedWord':
        return Response.json(await this.removeBannedWord(params.wordId))

      case 'updateBannedWord':
        return Response.json(await this.updateBannedWord(params))

      // Brand Stances CRUD
      case 'listBrandStances':
        return Response.json(await this.listBrandStances())

      case 'addBrandStance':
        return Response.json(await this.addBrandStance(params))

      case 'removeBrandStance':
        return Response.json(await this.removeBrandStance(params.stanceId))

      // G4 Voice Alignment Gate methods
      case 'checkBannedWords':
        return Response.json(await this.checkBannedWords(params.content))

      case 'checkVoiceMarkers':
        return Response.json(await this.checkVoiceMarkers(params.content))

      // Story 2.3: Brand DNA Analysis & Scoring
      case 'analyzeBrandDNA':
        return Response.json(await this.analyzeBrandDNA(params))

      default:
        return Response.json({ error: `Unknown method: ${method}` }, { status: 400 })
    }
  }

  // Brand DNA Methods
  private async getBrandDNA(): Promise<BrandDNA> {
    const rows = this.sql.exec(`SELECT * FROM brand_dna WHERE id = 1`).toArray()
    const row = rows.length > 0 ? rows[0] : null

    // Read from normalized tables
    const voiceMarkers = this.sql.exec(`SELECT * FROM voice_markers ORDER BY created_at DESC`).toArray().map(r => ({
      id: r.id as string,
      phrase: r.phrase as string,
      source: r.source as 'voice' | 'manual' | 'analysis',
      confidence: r.confidence as number,
      createdAt: r.created_at as string,
    }))

    const bannedWords = this.sql.exec(`SELECT * FROM banned_words ORDER BY created_at DESC`).toArray().map(r => ({
      id: r.id as string,
      word: r.word as string,
      severity: r.severity as 'hard' | 'soft',
      reason: r.reason as string | undefined,
      source: r.source as 'voice' | 'manual' | 'analysis',
      createdAt: r.created_at as string,
    }))

    const stances = this.sql.exec(`SELECT * FROM brand_stances ORDER BY created_at DESC`).toArray().map(r => ({
      id: r.id as string,
      topic: r.topic as string,
      position: r.position as string,
      source: r.source as 'voice' | 'manual' | 'analysis',
      createdAt: r.created_at as string,
    }))

    return {
      voiceMarkers,
      bannedWords,
      stances,
      signaturePatterns: row ? JSON.parse(row.signature_patterns as string || '[]') : [],
      toneProfile: row ? JSON.parse(row.tone_profile as string || '{}') : {},
      voiceBaseline: row?.voice_baseline as number | null ?? null,
      timeToDNA: row?.time_to_dna as number | null ?? null,
      lastCalibration: row?.last_calibration as string | null ?? null,
    }
  }

  private async getDNAReport(): Promise<any> {
    const dna = await this.getBrandDNA()
    const hubs = await this.listHubs({ limit: 100 })
    
    // Calculate Zero-Edit Rate (ZER) per hub
    const hubStats = hubs.map(hub => {
      const spokes = this.sql.exec(`
        SELECT status, mutated_at 
        FROM spokes 
        WHERE hub_id = '${hub.id}' AND status = 'approved'
      `).toArray()
      
      const totalApproved = spokes.length
      const zeroEditApproved = spokes.filter(s => !s.mutated_at).length
      const zer = totalApproved > 0 ? zeroEditApproved / totalApproved : 0
      
      return { hubId: hub.id, zer, totalApproved }
    })

    const currentZER = hubStats.length > 0 
      ? hubStats.reduce((sum, h) => sum + h.zer, 0) / hubStats.length 
      : 0

    // Voice Drift Detection
    const last50Spokes = this.sql.exec(`
      SELECT g4_similarity 
      FROM spokes 
      WHERE g4_similarity IS NOT NULL 
      ORDER BY created_at DESC 
      LIMIT 50
    `).toArray()

    const movingAverageSimilarity = last50Spokes.length > 0
      ? last50Spokes.reduce((sum, s) => sum + (s.g4_similarity as number), 0) / last50Spokes.length
      : null

    let voiceDrift = false
    if (dna.voiceBaseline && movingAverageSimilarity) {
      const driftThreshold = 0.15 // 15% drop
      if (movingAverageSimilarity < dna.voiceBaseline * (1 - driftThreshold)) {
        voiceDrift = true
      }
    }

    // Auto-establish baseline if not set and we have 3 hubs >= 60% ZER
    if (!dna.voiceBaseline && hubStats.filter(h => h.zer >= 0.6).length >= 3) {
      const baselineSimilarity = this.sql.exec(`
        SELECT AVG(g4_similarity) as avg_sim 
        FROM spokes 
        WHERE g4_similarity IS NOT NULL
      `).one().avg_sim as number
      
      if (baselineSimilarity) {
        await this.updateBrandDNA({ voiceBaseline: baselineSimilarity })
        dna.voiceBaseline = baselineSimilarity
      }
    }

    return {
      dnaStrength: currentZER, // Simplified DNA strength as ZER
      currentZER,
      voiceBaseline: dna.voiceBaseline,
      movingAverageSimilarity,
      voiceDrift,
      timeToDNA: dna.timeToDNA,
      recentHubs: hubStats.slice(0, 5),
    }
  }

  private async getTimeToDNA(): Promise<{ timeToDNA: number | null }> {
    const dna = await this.getBrandDNA()
    if (dna.timeToDNA) return { timeToDNA: dna.timeToDNA }

    const hubs = this.sql.exec(`SELECT id FROM hubs ORDER BY created_at ASC`).toArray()
    let hubCount = 0
    
    for (const hub of hubs) {
      hubCount++
      const spokes = this.sql.exec(`
        SELECT status, mutated_at 
        FROM spokes 
        WHERE hub_id = '${hub.id}' AND status = 'approved'
      `).toArray()
      
      const totalApproved = spokes.length
      if (totalApproved === 0) continue
      
      const zeroEditApproved = spokes.filter(s => !s.mutated_at).length
      const zer = zeroEditApproved / totalApproved

      if (zer >= 0.6) {
        await this.updateBrandDNA({ timeToDNA: hubCount })
        return { timeToDNA: hubCount }
      }
    }

    return { timeToDNA: null }
  }

  private async updateBrandDNA(updates: Partial<BrandDNA & { voiceBaseline?: number, timeToDNA?: number, lastCalibration?: string }>): Promise<{ success: boolean }> {
    const sets: string[] = []

    // Metadata fields stored in brand_dna table
    if (updates.signaturePatterns) sets.push(`signature_patterns = '${JSON.stringify(updates.signaturePatterns)}'`)
    if (updates.toneProfile) sets.push(`tone_profile = '${JSON.stringify(updates.toneProfile)}'`)
    if (updates.voiceBaseline !== undefined) sets.push(`voice_baseline = ${updates.voiceBaseline}`)
    if (updates.timeToDNA !== undefined) sets.push(`time_to_dna = ${updates.timeToDNA}`)
    if (updates.lastCalibration !== undefined) sets.push(`last_calibration = '${updates.lastCalibration}'`)

    if (sets.length > 0) {
      this.sql.exec(`UPDATE brand_dna SET ${sets.join(', ')} WHERE id = 1`)
    }

    return { success: true }
  }

  // Voice Markers CRUD Methods (Story 2.5)
  private async listVoiceMarkers(): Promise<VoiceMarker[]> {
    return this.sql.exec(`SELECT * FROM voice_markers ORDER BY created_at DESC`).toArray().map(r => ({
      id: r.id as string,
      phrase: r.phrase as string,
      source: r.source as 'voice' | 'manual' | 'analysis',
      confidence: r.confidence as number,
      createdAt: r.created_at as string,
    }))
  }

  private async addVoiceMarker(params: {
    phrase: string
    source?: 'voice' | 'manual' | 'analysis'
    confidence?: number
  }): Promise<VoiceMarker> {
    const id = crypto.randomUUID()
    const normalizedPhrase = params.phrase.toLowerCase().trim()
    const source = params.source || 'manual'
    const confidence = params.confidence ?? 1.0

    try {
      this.sql.exec(`
        INSERT INTO voice_markers (id, phrase, source, confidence)
        VALUES ('${id}', '${normalizedPhrase.replace(/'/g, "''")}', '${source}', ${confidence})
      `)

      // Update last calibration
      this.sql.exec(`UPDATE brand_dna SET last_calibration = CURRENT_TIMESTAMP WHERE id = 1`)

      return {
        id,
        phrase: normalizedPhrase,
        source,
        confidence,
        createdAt: new Date().toISOString(),
      }
    } catch (error) {
      // Handle unique constraint violation (phrase already exists)
      if (String(error).includes('UNIQUE constraint')) {
        const existing = this.sql.exec(`SELECT * FROM voice_markers WHERE phrase = '${normalizedPhrase.replace(/'/g, "''")}'`).one()
        return {
          id: existing.id as string,
          phrase: existing.phrase as string,
          source: existing.source as 'voice' | 'manual' | 'analysis',
          confidence: existing.confidence as number,
          createdAt: existing.created_at as string,
        }
      }
      throw error
    }
  }

  private async removeVoiceMarker(markerId: string): Promise<{ success: boolean }> {
    this.sql.exec(`DELETE FROM voice_markers WHERE id = '${markerId}'`)
    this.sql.exec(`UPDATE brand_dna SET last_calibration = CURRENT_TIMESTAMP WHERE id = 1`)
    return { success: true }
  }

  private async updateVoiceMarker(params: {
    markerId: string
    phrase?: string
    confidence?: number
  }): Promise<VoiceMarker> {
    const sets: string[] = []
    if (params.phrase) sets.push(`phrase = '${params.phrase.toLowerCase().trim().replace(/'/g, "''")}'`)
    if (params.confidence !== undefined) sets.push(`confidence = ${params.confidence}`)

    if (sets.length > 0) {
      this.sql.exec(`UPDATE voice_markers SET ${sets.join(', ')} WHERE id = '${params.markerId}'`)
      this.sql.exec(`UPDATE brand_dna SET last_calibration = CURRENT_TIMESTAMP WHERE id = 1`)
    }

    const row = this.sql.exec(`SELECT * FROM voice_markers WHERE id = '${params.markerId}'`).one()
    return {
      id: row.id as string,
      phrase: row.phrase as string,
      source: row.source as 'voice' | 'manual' | 'analysis',
      confidence: row.confidence as number,
      createdAt: row.created_at as string,
    }
  }

  // Banned Words CRUD Methods (Story 2.5)
  private async listBannedWords(): Promise<BannedWord[]> {
    return this.sql.exec(`SELECT * FROM banned_words ORDER BY created_at DESC`).toArray().map(r => ({
      id: r.id as string,
      word: r.word as string,
      severity: r.severity as 'hard' | 'soft',
      reason: r.reason as string | undefined,
      source: r.source as 'voice' | 'manual' | 'analysis',
      createdAt: r.created_at as string,
    }))
  }

  private async addBannedWord(params: {
    word: string
    severity?: 'hard' | 'soft'
    reason?: string
    source?: 'voice' | 'manual' | 'analysis'
  }): Promise<BannedWord> {
    const id = crypto.randomUUID()
    const normalizedWord = params.word.toLowerCase().trim()
    const severity = params.severity || 'hard'
    const source = params.source || 'manual'
    const reasonSql = params.reason ? `'${params.reason.replace(/'/g, "''")}'` : 'NULL'

    try {
      this.sql.exec(`
        INSERT INTO banned_words (id, word, severity, reason, source)
        VALUES ('${id}', '${normalizedWord.replace(/'/g, "''")}', '${severity}', ${reasonSql}, '${source}')
      `)

      // Update last calibration
      this.sql.exec(`UPDATE brand_dna SET last_calibration = CURRENT_TIMESTAMP WHERE id = 1`)

      return {
        id,
        word: normalizedWord,
        severity,
        reason: params.reason,
        source,
        createdAt: new Date().toISOString(),
      }
    } catch (error) {
      // Handle unique constraint violation (word already exists)
      if (String(error).includes('UNIQUE constraint')) {
        const existing = this.sql.exec(`SELECT * FROM banned_words WHERE word = '${normalizedWord.replace(/'/g, "''")}'`).one()
        return {
          id: existing.id as string,
          word: existing.word as string,
          severity: existing.severity as 'hard' | 'soft',
          reason: existing.reason as string | undefined,
          source: existing.source as 'voice' | 'manual' | 'analysis',
          createdAt: existing.created_at as string,
        }
      }
      throw error
    }
  }

  private async removeBannedWord(wordId: string): Promise<{ success: boolean }> {
    this.sql.exec(`DELETE FROM banned_words WHERE id = '${wordId}'`)
    this.sql.exec(`UPDATE brand_dna SET last_calibration = CURRENT_TIMESTAMP WHERE id = 1`)
    return { success: true }
  }

  private async updateBannedWord(params: {
    wordId: string
    word?: string
    severity?: 'hard' | 'soft'
    reason?: string
  }): Promise<BannedWord> {
    const sets: string[] = []
    if (params.word) sets.push(`word = '${params.word.toLowerCase().trim().replace(/'/g, "''")}'`)
    if (params.severity) sets.push(`severity = '${params.severity}'`)
    if (params.reason !== undefined) sets.push(`reason = '${params.reason.replace(/'/g, "''")}'`)

    if (sets.length > 0) {
      this.sql.exec(`UPDATE banned_words SET ${sets.join(', ')} WHERE id = '${params.wordId}'`)
      this.sql.exec(`UPDATE brand_dna SET last_calibration = CURRENT_TIMESTAMP WHERE id = 1`)
    }

    const row = this.sql.exec(`SELECT * FROM banned_words WHERE id = '${params.wordId}'`).one()
    return {
      id: row.id as string,
      word: row.word as string,
      severity: row.severity as 'hard' | 'soft',
      reason: row.reason as string | undefined,
      source: row.source as 'voice' | 'manual' | 'analysis',
      createdAt: row.created_at as string,
    }
  }

  // Brand Stances CRUD Methods
  private async listBrandStances(): Promise<BrandStance[]> {
    return this.sql.exec(`SELECT * FROM brand_stances ORDER BY created_at DESC`).toArray().map(r => ({
      id: r.id as string,
      topic: r.topic as string,
      position: r.position as string,
      source: r.source as 'voice' | 'manual' | 'analysis',
      createdAt: r.created_at as string,
    }))
  }

  private async addBrandStance(params: {
    topic: string
    position: string
    source?: 'voice' | 'manual' | 'analysis'
  }): Promise<BrandStance> {
    const id = crypto.randomUUID()
    const source = params.source || 'manual'

    try {
      this.sql.exec(`
        INSERT INTO brand_stances (id, topic, position, source)
        VALUES ('${id}', '${params.topic.replace(/'/g, "''")}', '${params.position.replace(/'/g, "''")}', '${source}')
      `)

      // Update last calibration
      this.sql.exec(`UPDATE brand_dna SET last_calibration = CURRENT_TIMESTAMP WHERE id = 1`)

      return {
        id,
        topic: params.topic,
        position: params.position,
        source,
        createdAt: new Date().toISOString(),
      }
    } catch (error) {
      // Handle unique constraint violation
      if (String(error).includes('UNIQUE constraint')) {
        const existing = this.sql.exec(`
          SELECT * FROM brand_stances
          WHERE topic = '${params.topic.replace(/'/g, "''")}' AND position = '${params.position.replace(/'/g, "''")}'
        `).one()
        return {
          id: existing.id as string,
          topic: existing.topic as string,
          position: existing.position as string,
          source: existing.source as 'voice' | 'manual' | 'analysis',
          createdAt: existing.created_at as string,
        }
      }
      throw error
    }
  }

  private async removeBrandStance(stanceId: string): Promise<{ success: boolean }> {
    this.sql.exec(`DELETE FROM brand_stances WHERE id = '${stanceId}'`)
    this.sql.exec(`UPDATE brand_dna SET last_calibration = CURRENT_TIMESTAMP WHERE id = 1`)
    return { success: true }
  }

  // Hub Methods
  private async createHub(hub: Omit<Hub, 'createdAt'>): Promise<Hub> {
    this.sql.exec(`
      INSERT INTO hubs (id, source_content, platform, angle, status, pillars)
      VALUES ('${hub.id}', '${hub.sourceContent.replace(/'/g, "''")}', '${hub.platform}', '${hub.angle}', '${hub.status}', '${JSON.stringify(hub.pillars)}')
    `)

    return this.getHub(hub.id) as Promise<Hub>
  }

  private async getHub(hubId: string): Promise<Hub | null> {
    const row = this.sql.exec(`SELECT * FROM hubs WHERE id = '${hubId}'`).one()
    if (!row) return null

    return {
      id: row.id as string,
      sourceContent: row.source_content as string,
      platform: row.platform as string,
      angle: row.angle as string,
      status: row.status as Hub['status'],
      pillars: JSON.parse(row.pillars as string),
      createdAt: row.created_at as string,
    }
  }

  private async listHubs(params: { status?: string; limit?: number; offset?: number }): Promise<Hub[]> {
    let query = `SELECT * FROM hubs`
    if (params.status) query += ` WHERE status = '${params.status}'`
    query += ` ORDER BY created_at DESC`
    if (params.limit) query += ` LIMIT ${params.limit}`
    if (params.offset) query += ` OFFSET ${params.offset}`

    return this.sql.exec(query).toArray().map(row => ({
      id: row.id as string,
      sourceContent: row.source_content as string,
      platform: row.platform as string,
      angle: row.angle as string,
      status: row.status as Hub['status'],
      pillars: JSON.parse(row.pillars as string),
      createdAt: row.created_at as string,
    }))
  }

  private async killHub(hubId: string, reason?: string): Promise<{ killed: number; survived: number }> {
    // Kill the hub
    this.sql.exec(`UPDATE hubs SET status = 'killed' WHERE id = '${hubId}'`)

    // Kill all non-mutated spokes (Mutation Rule: preserve manually-edited spokes)
    const result = this.sql.exec(`
      UPDATE spokes
      SET status = 'killed'
      WHERE hub_id = '${hubId}' AND mutated_at IS NULL
    `)

    const killed = result.rowsWritten
    const survived = this.sql.exec(`
      SELECT COUNT(*) as count FROM spokes
      WHERE hub_id = '${hubId}' AND mutated_at IS NOT NULL
    `).one().count as number

    // Record metric
    await this.recordMetric({
      metricType: 'hub_kill',
      value: killed,
      metadata: { hubId, reason, survived },
    })

    return { killed, survived }
  }

  // Spoke Methods
  private async createSpoke(spoke: Omit<Spoke, 'createdAt'>): Promise<Spoke> {
    this.sql.exec(`
      INSERT INTO spokes (id, hub_id, pillar_id, platform, content, status, regeneration_count)
      VALUES ('${spoke.id}', '${spoke.hubId}', '${spoke.pillarId || ''}', '${spoke.platform}', '${(spoke.content || '').replace(/'/g, "''")}', '${spoke.status}', ${spoke.regenerationCount})
    `)

    return this.getSpoke(spoke.id) as Promise<Spoke>
  }

  private async getSpoke(spokeId: string): Promise<Spoke | null> {
    const row = this.sql.exec(`SELECT * FROM spokes WHERE id = '${spokeId}'`).one()
    if (!row) return null

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
        g4_similarity: row.g4_similarity as number | undefined,
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
    }
  }

  private async updateSpoke(params: { spokeId: string; updates: Partial<Spoke> }): Promise<Spoke> {
    const { spokeId, updates } = params
    const sets: string[] = []

    if (updates.content !== undefined) {
      sets.push(`content = '${updates.content.replace(/'/g, "''")}'`)
      sets.push(`mutated_at = CURRENT_TIMESTAMP`)
    }
    if (updates.status) sets.push(`status = '${updates.status}'`)
    if (updates.qualityScores) {
      if (updates.qualityScores.g2_hook !== undefined) sets.push(`g2_hook = ${updates.qualityScores.g2_hook}`)
      if (updates.qualityScores.g4_voice !== undefined) sets.push(`g4_voice = ${updates.qualityScores.g4_voice ? 1 : 0}`)
      if (updates.qualityScores.g4_similarity !== undefined) sets.push(`g4_similarity = ${updates.qualityScores.g4_similarity}`)
      if (updates.qualityScores.g5_platform !== undefined) sets.push(`g5_platform = ${updates.qualityScores.g5_platform ? 1 : 0}`)
      if (updates.qualityScores.g6_visual !== undefined) sets.push(`g6_visual = ${updates.qualityScores.g6_visual}`)
      if (updates.qualityScores.g7_engagement !== undefined) sets.push(`g7_engagement = ${updates.qualityScores.g7_engagement}`)
    }
    if (updates.visualArchetype !== undefined) sets.push(`visual_archetype = '${updates.visualArchetype.replace(/'/g, "''")}'`)
    if (updates.imagePrompt !== undefined) sets.push(`image_prompt = '${updates.imagePrompt.replace(/'/g, "''")}'`)
    if (updates.thumbnailConcept !== undefined) sets.push(`thumbnail_concept = '${updates.thumbnailConcept.replace(/'/g, "''")}'`)
    if (updates.regenerationCount !== undefined) sets.push(`regeneration_count = ${updates.regenerationCount}`)

    if (sets.length > 0) {
      this.sql.exec(`UPDATE spokes SET ${sets.join(', ')} WHERE id = '${spokeId}'`)
    }

    return this.getSpoke(spokeId) as Promise<Spoke>
  }

  private async listSpokes(params: { hubId?: string; status?: string; limit?: number }): Promise<Spoke[]> {
    let query = `SELECT * FROM spokes WHERE 1=1`
    if (params.hubId) query += ` AND hub_id = '${params.hubId}'`
    if (params.status) query += ` AND status = '${params.status}'`
    query += ` ORDER BY created_at DESC`
    if (params.limit) query += ` LIMIT ${params.limit}`

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
        g4_similarity: row.g4_similarity as number | undefined,
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
    }))
  }

  private async approveSpoke(spokeId: string): Promise<{ success: boolean }> {
    this.sql.exec(`UPDATE spokes SET status = 'approved' WHERE id = '${spokeId}'`)

    // Record total approval
    await this.recordMetric({
      metricType: 'spoke_approval',
      value: 1,
      metadata: { spokeId },
    })

    // Record zero-edit if not mutated
    const spoke = await this.getSpoke(spokeId)
    if (spoke && !spoke.mutatedAt) {
      await this.recordMetric({
        metricType: 'zero_edit_approval',
        value: 1,
        metadata: { spokeId },
      })
    }

    // After approval, check if we reached Time-to-DNA
    await this.getTimeToDNA()

    return { success: true }
  }

  private async rejectSpoke(spokeId: string, reason?: string): Promise<{ success: boolean }> {
    this.sql.exec(`UPDATE spokes SET status = 'rejected' WHERE id = '${spokeId}'`)

    await this.recordMetric({
      metricType: 'spoke_rejection',
      value: 1,
      metadata: { spokeId, reason },
    })

    return { success: true }
  }

  private async bulkApprove(spokeIds: string[]): Promise<{ approved: number }> {
    for (const spokeId of spokeIds) {
      await this.approveSpoke(spokeId)
    }
    return { approved: spokeIds.length }
  }

  private async bulkReject(spokeIds: string[], reason?: string): Promise<{ rejected: number }> {
    for (const spokeId of spokeIds) {
      await this.rejectSpoke(spokeId, reason)
    }
    return { rejected: spokeIds.length }
  }

  private async getReviewQueue(params: { filter?: string; limit?: number }): Promise<Spoke[]> {
    let query = `SELECT * FROM spokes WHERE status = 'reviewing'`
    let hasOrderBy = false

    if (params.filter === 'top10') {
      query += ` ORDER BY g7_engagement DESC`
      hasOrderBy = true
    } else if (params.filter === 'flagged') {
      query += ` AND (g2_hook < 50 OR g4_voice = 0 OR g5_platform = 0)`
    }

    if (!hasOrderBy) {
      query += ` ORDER BY created_at DESC`
    }
    if (params.limit) query += ` LIMIT ${params.limit}`

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
        g4_similarity: row.g4_similarity as number | undefined,
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
    }))
  }

  // Feedback Methods (Self-Healing Loop)
  private async storeFeedback(params: {
    spokeId: string
    gate: string
    criticOutput: string
    iteration: number
  }): Promise<{ success: boolean }> {
    const feedbackId = crypto.randomUUID()
    this.sql.exec(`
      INSERT INTO feedback (id, spoke_id, gate, critic_output, iteration)
      VALUES ('${feedbackId}', '${params.spokeId}', '${params.gate}', '${params.criticOutput.replace(/'/g, "''")}', ${params.iteration})
    `)
    return { success: true }
  }

  private async getFeedback(spokeId: string): Promise<Array<{
    gate: string
    criticOutput: string
    iteration: number
    createdAt: string
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
    }))
  }

  // Quality Gate Runner
  private async runQualityGate(spokeId: string, gate: string): Promise<{
    passed: boolean
    score?: number
    feedback?: string
  }> {
    // This would integrate with the agent-system package
    // For now, return a placeholder
    return {
      passed: true,
      score: 85,
      feedback: 'Quality gate passed',
    }
  }

  // Analytics Methods
  private async getAnalytics(params: {
    metricType: string
    periodDays?: number
  }): Promise<any> {
    const days = params.periodDays || 7
    const query = `
      SELECT
        AVG(value) as avg_value,
        SUM(value) as total,
        COUNT(*) as count
      FROM analytics
      WHERE metric_type = '${params.metricType}'
        AND created_at >= datetime('now', '-${days} days')
    `

    return this.sql.exec(query).one()
  }

  private async getZeroEditRate(params: { periodDays?: number }): Promise<{ rate: number, zeroEditCount: number, totalApprovals: number }> {
    const days = params.periodDays || 30
    const query = `
      SELECT
        SUM(CASE WHEN metric_type = 'zero_edit_approval' THEN 1 ELSE 0 END) as zero_edit_count,
        SUM(CASE WHEN metric_type = 'spoke_approval' THEN 1 ELSE 0 END) as total_approvals
      FROM analytics
      WHERE metric_type IN ('zero_edit_approval', 'spoke_approval')
        AND created_at >= datetime('now', '-${days} days')
    `

    const result = this.sql.exec(query).one()
    const zeroEditCount = (result.zero_edit_count as number) || 0
    const totalApprovals = (result.total_approvals as number) || 0

    return {
      rate: totalApprovals > 0 ? (zeroEditCount / totalApprovals) * 100 : 0,
      zeroEditCount,
      totalApprovals,
    }
  }

  private async recordMetric(params: {
    metricType: string
    value: number
    metadata?: Record<string, any>
  }): Promise<{ success: boolean }> {
    this.sql.exec(`
      INSERT INTO analytics (metric_type, value, metadata)
      VALUES ('${params.metricType}', ${params.value}, '${JSON.stringify(params.metadata || {})}')
    `)
    return { success: true }
  }

  private async getMetrics(params: {
    metricType: string
    periodDays?: number
  }): Promise<{ avg: number, total: number, count: number, values: any[] }> {
    const days = params.periodDays || 7
    const query = `
      SELECT value, metadata, created_at
      FROM analytics
      WHERE metric_type = '${params.metricType}'
        AND created_at >= datetime('now', '-${days} days')
      ORDER BY created_at ASC
    `

    const results = this.sql.exec(query).toArray()
    const values = results.map(r => ({
      value: r.value as number,
      metadata: JSON.parse(r.metadata as string),
      createdAt: r.created_at as string,
    }))

    const total = values.reduce((sum, v) => sum + v.value, 0)
    const count = values.length

    return {
      avg: count > 0 ? total / count : 0,
      total,
      count,
      values,
    }
  }

  // Export Methods
  private async createExport(params: {
    format: 'csv' | 'json'
    hubIds?: string[]
    platforms?: string[]
  }): Promise<{ exportId: string, status: string }> {
    const exportId = crypto.randomUUID()

    // Store initial job status
    this.sql.exec(`
      INSERT INTO exports (id, format, status)
      VALUES ('${exportId}', '${params.format}', 'processing')
    `)

    // Fetch approved spokes
    let query = `
      SELECT s.*, h.source_content as hub_content, h.angle as hub_angle
      FROM spokes s
      JOIN hubs h ON s.hub_id = h.id
      WHERE s.status = 'approved'
    `
    if (params.hubIds && params.hubIds.length > 0) {
      query += ` AND s.hub_id IN (${params.hubIds.map(id => `'${id}'`).join(',')})`
    }
    if (params.platforms && params.platforms.length > 0) {
      query += ` AND s.platform IN (${params.platforms.map(p => `'${p}'`).join(',')})`
    }

    const spokes = this.sql.exec(query).toArray()

    if (spokes.length === 0) {
      this.sql.exec(`UPDATE exports SET status = 'failed', metadata = '{"error": "No approved spokes found"}' WHERE id = '${exportId}'`)
      return { exportId, status: 'failed' }
    }

    let content: string
    let contentType: string
    const filename = `export-${this.clientId}-${exportId}.${params.format}`

    if (params.format === 'csv') {
      content = this.convertToCSV(spokes)
      contentType = 'text/csv'
    } else {
      content = JSON.stringify(spokes, null, 2)
      contentType = 'application/json'
    }

    const r2Key = `clients/${this.clientId}/exports/${filename}`

    try {
      await this.env.MEDIA_BUCKET.put(r2Key, content, {
        httpMetadata: { contentType },
      })

      this.sql.exec(`
        UPDATE exports
        SET status = 'completed', r2_key = '${r2Key}'
        WHERE id = '${exportId}'
      `)

      return { exportId, status: 'completed' }
    } catch (error) {
      console.error('Export upload failed:', error)
      this.sql.exec(`
        UPDATE exports
        SET status = 'failed', metadata = '${JSON.stringify({ error: String(error) })}'
        WHERE id = '${exportId}'
      `)
      return { exportId, status: 'failed' }
    }
  }

  private convertToCSV(spokes: any[]): string {
    const headers = ['id', 'hub_id', 'platform', 'content', 'created_at', 'hub_angle']
    const rows = spokes.map(s => [
      s.id,
      s.hub_id,
      s.platform,
      `"${(s.content || '').replace(/"/g, '""')}"`,
      s.created_at,
      s.hub_angle
    ])

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  }

  private async getExport(exportId: string): Promise<any> {
    const row = this.sql.exec(`SELECT * FROM exports WHERE id = '${exportId}'`).one()
    if (!row) return null

    let downloadUrl = null
    if (row.status === 'completed' && row.r2_key) {
      // For now we don't have a pre-signed URL utility in standard R2 binding,
      // but we can return the key or a path that our worker handles.
      downloadUrl = `/api/media/${row.r2_key}`
    }

    return {
      id: row.id,
      format: row.format,
      status: row.status,
      r2Key: row.r2_key,
      downloadUrl,
      createdAt: row.created_at,
    }
  }

  private async listExports(params: { limit?: number }): Promise<any[]> {
    const limit = params.limit || 10
    return this.sql.exec(`SELECT * FROM exports ORDER BY created_at DESC LIMIT ${limit}`).toArray()
  }

  // Voice-to-Grounding Pipeline Methods (Story 2.2)
  private async transcribeAudio(params: {
    audioData: ArrayBuffer
  }): Promise<{ transcription: string }> {
    try {
      // Use Workers AI Whisper model for transcription
      const inputs = {
        audio: [...new Uint8Array(params.audioData)],
      }

      const response = await this.env.AI.run('@cf/openai/whisper', inputs) as { text: string }

      return { transcription: response.text || '' }
    } catch (error) {
      console.error('Transcription error:', error)
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async processVoiceNote(params: {
    transcription: string
  }): Promise<{
    voiceMarkers: VoiceMarker[]
    bannedWords: BannedWord[]
    stances: BrandStance[]
  }> {
    try {
      // Use Workers AI for entity extraction
      const prompt = `Analyze this brand voice note and extract:
1. Voice markers (unique phrases, speaking patterns, signature expressions)
2. Banned words (words explicitly mentioned to avoid, with the reason why)
3. Brand stances (positions on topics mentioned)

Voice note: "${params.transcription}"

IMPORTANT: Return ONLY valid JSON, no other text. Extract ALL relevant entities from the voice note.

Return JSON format:
{
  "voiceMarkers": ["phrase 1", "phrase 2"],
  "bannedWords": [{"word": "synergy", "reason": "corporate jargon"}],
  "stances": [{"topic": "corporate language", "position": "Anti-corporate"}]
}`

      const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        prompt,
        max_tokens: 1024,
      }) as { response: string }

      // Parse the LLM response - handle potential parsing errors
      let extracted: {
        voiceMarkers: string[]
        bannedWords: Array<{ word: string, reason: string }>
        stances: Array<{ topic: string, position: string }>
      }

      try {
        // Try to extract JSON from the response (LLM may include other text)
        const jsonMatch = response.response.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('No JSON found in response')
        }
        extracted = JSON.parse(jsonMatch[0])
      } catch (parseError) {
        console.error('Failed to parse LLM response:', response.response)
        // Return empty entities if parsing fails
        extracted = { voiceMarkers: [], bannedWords: [], stances: [] }
      }

      // Insert extracted entities into normalized tables using CRUD methods
      const addedVoiceMarkers: VoiceMarker[] = []
      for (const phrase of extracted.voiceMarkers || []) {
        if (phrase && phrase.trim()) {
          const marker = await this.addVoiceMarker({
            phrase: phrase.trim(),
            source: 'voice',
            confidence: 0.85, // LLM extraction confidence
          })
          addedVoiceMarkers.push(marker)
        }
      }

      const addedBannedWords: BannedWord[] = []
      for (const bw of extracted.bannedWords || []) {
        if (bw.word && bw.word.trim()) {
          const word = await this.addBannedWord({
            word: bw.word.trim(),
            severity: 'hard',
            reason: bw.reason,
            source: 'voice',
          })
          addedBannedWords.push(word)
        }
      }

      const addedStances: BrandStance[] = []
      for (const stance of extracted.stances || []) {
        if (stance.topic && stance.position) {
          const addedStance = await this.addBrandStance({
            topic: stance.topic.trim(),
            position: stance.position.trim(),
            source: 'voice',
          })
          addedStances.push(addedStance)
        }
      }

      // Generate embeddings for transcription
      const embeddingsResponse = await this.env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: params.transcription,
      }) as { data: number[][] }

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
        }])
      }

      return {
        voiceMarkers: addedVoiceMarkers,
        bannedWords: addedBannedWords,
        stances: addedStances,
      }
    } catch (error) {
      console.error('Voice note processing error:', error)
      throw new Error(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Voice G4 Gate: Check content against banned words (for Quality Gate evaluation)
  async checkBannedWords(content: string): Promise<{
    violations: Array<{ word: string, severity: 'hard' | 'soft', reason?: string }>
    passed: boolean
  }> {
    const bannedWords = await this.listBannedWords()
    const contentLower = content.toLowerCase()
    const violations: Array<{ word: string, severity: 'hard' | 'soft', reason?: string }> = []

    for (const bw of bannedWords) {
      if (contentLower.includes(bw.word.toLowerCase())) {
        violations.push({
          word: bw.word,
          severity: bw.severity,
          reason: bw.reason,
        })
      }
    }

    // Hard failures = any hard severity violation
    const passed = !violations.some(v => v.severity === 'hard')

    return { violations, passed }
  }

  // Voice G4 Gate: Check content against voice markers (for similarity scoring)
  async checkVoiceMarkers(content: string): Promise<{
    matches: Array<{ phrase: string, confidence: number }>
    similarity: number
  }> {
    const voiceMarkers = await this.listVoiceMarkers()
    const contentLower = content.toLowerCase()
    const matches: Array<{ phrase: string, confidence: number }> = []

    for (const marker of voiceMarkers) {
      if (contentLower.includes(marker.phrase.toLowerCase())) {
        matches.push({
          phrase: marker.phrase,
          confidence: marker.confidence,
        })
      }
    }

    // Similarity score: ratio of matched markers to total markers
    const similarity = voiceMarkers.length > 0
      ? (matches.length / voiceMarkers.length) * 100
      : 0

    return { matches, similarity }
  }

  // Story 2.3: Brand DNA Analysis & Scoring - Background worker task
  // Pulls voice_markers and brand_stances, calculates strength score,
  // generates embeddings with @cf/baai/bge-base-en-v1.5 and stores in Vectorize
  async analyzeBrandDNA(params: {
    sampleContent?: string[]  // Optional: content samples to analyze against voice markers
  }): Promise<{
    strengthScore: number
    breakdown: {
      voiceMarkerScore: number
      stanceScore: number
      patternScore: number
      toneScore: number
    }
    voiceMarkersCount: number
    stancesCount: number
    embeddingsStored: boolean
  }> {
    // Step 1: Pull voice_markers and brand_stances from SQLite
    const voiceMarkers = await this.listVoiceMarkers()
    const brandStances = await this.listBrandStances()
    const dnaMetadata = this.sql.exec(`SELECT * FROM brand_dna WHERE id = 1`).one()

    const signaturePatterns: string[] = JSON.parse(dnaMetadata.signature_patterns as string || '[]')
    const toneProfile: Record<string, number> = JSON.parse(dnaMetadata.tone_profile as string || '{}')

    // Step 2: Calculate component scores

    // Voice Marker Score (0-30): Based on count and confidence
    let voiceMarkerScore = 0
    if (voiceMarkers.length >= 10) voiceMarkerScore = 30
    else if (voiceMarkers.length >= 5) voiceMarkerScore = 25
    else if (voiceMarkers.length >= 3) voiceMarkerScore = 20
    else if (voiceMarkers.length >= 1) voiceMarkerScore = 10 + voiceMarkers.length * 3

    // Add confidence bonus (average confidence * 5, max 5 points)
    if (voiceMarkers.length > 0) {
      const avgConfidence = voiceMarkers.reduce((sum, m) => sum + m.confidence, 0) / voiceMarkers.length
      voiceMarkerScore = Math.min(30, voiceMarkerScore + Math.round(avgConfidence * 5))
    }

    // Stance Score (0-30): Based on count and coverage
    let stanceScore = 0
    if (brandStances.length >= 5) stanceScore = 30
    else if (brandStances.length >= 3) stanceScore = 25
    else if (brandStances.length >= 2) stanceScore = 20
    else if (brandStances.length >= 1) stanceScore = 15

    // Pattern Score (0-25): Based on signature patterns detected
    let patternScore = 0
    if (signaturePatterns.length >= 5) patternScore = 25
    else if (signaturePatterns.length >= 3) patternScore = 20
    else if (signaturePatterns.length >= 1) patternScore = 10 + signaturePatterns.length * 3

    // Tone Score (0-15): Based on tone profile completeness
    let toneScore = 0
    const toneKeys = ['formal_casual', 'serious_playful', 'technical_accessible', 'reserved_expressive']
    const definedTones = toneKeys.filter(k => toneProfile[k] !== undefined && toneProfile[k] !== 50).length
    if (definedTones >= 4) toneScore = 15
    else if (definedTones >= 3) toneScore = 12
    else if (definedTones >= 2) toneScore = 8
    else if (definedTones >= 1) toneScore = 5

    // Step 3: Calculate total DNA strength (0-100%)
    const strengthScore = Math.min(100, voiceMarkerScore + stanceScore + patternScore + toneScore)

    // Step 4: If sample content provided, compare against voice markers for additional scoring
    if (params.sampleContent && params.sampleContent.length > 0) {
      const combinedContent = params.sampleContent.join(' ').toLowerCase()
      let markerMatches = 0

      for (const marker of voiceMarkers) {
        if (combinedContent.includes(marker.phrase.toLowerCase())) {
          markerMatches++
        }
      }

      // Bonus for marker alignment (up to 10 extra points)
      const alignmentBonus = voiceMarkers.length > 0
        ? Math.round((markerMatches / voiceMarkers.length) * 10)
        : 0

      // Note: We don't add to strengthScore here, just track it for reporting
    }

    // Step 5: Generate embeddings for stances and store in Vectorize
    let embeddingsStored = false

    try {
      // Create embedding text from voice markers + stances + patterns
      const embeddingTexts: string[] = [
        ...voiceMarkers.map(m => m.phrase),
        ...brandStances.map(s => `${s.topic}: ${s.position}`),
        ...signaturePatterns,
      ]

      if (embeddingTexts.length > 0) {
        const textToEmbed = embeddingTexts.join('\n')

        // Generate embeddings using @cf/baai/bge-base-en-v1.5
        const embeddingResult = await this.env.AI.run('@cf/baai/bge-base-en-v1.5' as any, {
          text: textToEmbed,
        }) as any

        if (embeddingResult.data && embeddingResult.data[0]) {
          // Store combined brand DNA embedding
          await this.env.VECTORIZE.upsert([{
            id: `brand-dna-${this.clientId}`,
            values: embeddingResult.data[0],
            metadata: {
              clientId: this.clientId,
              type: 'brand_dna',
              voiceMarkersCount: voiceMarkers.length,
              stancesCount: brandStances.length,
              strengthScore,
              timestamp: new Date().toISOString(),
            },
          }])

          // Store individual stance embeddings for semantic search
          for (const stance of brandStances) {
            const stanceText = `${stance.topic}: ${stance.position}`
            const stanceEmbedding = await this.env.AI.run('@cf/baai/bge-base-en-v1.5' as any, {
              text: stanceText,
            }) as any

            if (stanceEmbedding.data && stanceEmbedding.data[0]) {
              await this.env.VECTORIZE.upsert([{
                id: `stance-${this.clientId}-${stance.id}`,
                values: stanceEmbedding.data[0],
                metadata: {
                  clientId: this.clientId,
                  type: 'brand_stance',
                  topic: stance.topic,
                  position: stance.position,
                  stanceId: stance.id,
                },
              }])
            }
          }

          embeddingsStored = true
        }
      }
    } catch (error) {
      console.error('Vectorize embedding error:', error)
      // Don't fail the analysis if embeddings fail
    }

    // Step 6: Update brand_dna table with latest scores
    this.sql.exec(`
      UPDATE brand_dna SET
        voice_baseline = ${strengthScore},
        last_calibration = '${new Date().toISOString()}'
      WHERE id = 1
    `)

    // Record metric for analytics
    await this.recordMetric({
      metricType: 'brand_dna_analysis',
      value: strengthScore,
      metadata: {
        voiceMarkersCount: voiceMarkers.length,
        stancesCount: brandStances.length,
        patternsCount: signaturePatterns.length,
        embeddingsStored,
      },
    })

    return {
      strengthScore,
      breakdown: {
        voiceMarkerScore,
        stanceScore,
        patternScore,
        toneScore,
      },
      voiceMarkersCount: voiceMarkers.length,
      stancesCount: brandStances.length,
      embeddingsStored,
    }
  }
}
