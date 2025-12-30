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
  parentSpokeId: string | null
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

    // Migration: Remove FK constraint from existing spokes tables
    try {
      const tableInfo = this.sql.exec(`PRAGMA table_info(spokes)`).toArray()
      if (tableInfo.length > 0) {
        const fkList = this.sql.exec(`PRAGMA foreign_key_list(spokes)`).toArray()
        if (fkList.length > 0) {
          this.sql.exec(`DROP TABLE IF EXISTS feedback`)
          this.sql.exec(`DROP TABLE IF EXISTS spokes`)
        }
      }
    } catch {
      // Table might not exist yet, which is fine
    }

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
        parent_spoke_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    try {
      const columns = this.sql.exec(`PRAGMA table_info(spokes)`).toArray()
      const hasParentSpokeId = columns.some(c => c.name === 'parent_spoke_id')
      if (!hasParentSpokeId) {
        this.sql.exec(`ALTER TABLE spokes ADD COLUMN parent_spoke_id TEXT`)
      }
    } catch {
      // Column already exists or table doesn't exist yet
    }

    // Feedback storage for self-healing loop
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        spoke_id TEXT NOT NULL,
        gate TEXT NOT NULL,
        critic_output TEXT NOT NULL,
        iteration INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_spokes_parent ON spokes(parent_spoke_id)`)
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

      case 'countHubs':
        return Response.json(await this.countHubs(params))

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

      case 'countVariations':
        return Response.json(await this.countVariations(params.parentSpokeId))

      case 'listVariations':
        return Response.json(await this.listVariations(params.parentSpokeId))

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

      case 'listVoiceMarkers':
        return Response.json(await this.listVoiceMarkers())

      case 'addVoiceMarker':
        return Response.json(await this.addVoiceMarker(params))

      case 'removeVoiceMarker':
        return Response.json(await this.removeVoiceMarker(params.markerId))

      case 'updateVoiceMarker':
        return Response.json(await this.updateVoiceMarker(params))

      case 'listBannedWords':
        return Response.json(await this.listBannedWords())

      case 'addBannedWord':
        return Response.json(await this.addBannedWord(params))

      case 'removeBannedWord':
        return Response.json(await this.removeBannedWord(params.wordId))

      case 'updateBannedWord':
        return Response.json(await this.updateBannedWord(params))

      case 'listBrandStances':
        return Response.json(await this.listBrandStances())

      case 'addBrandStance':
        return Response.json(await this.addBrandStance(params))

      case 'removeBrandStance':
        return Response.json(await this.removeBrandStance(params.stanceId))

      case 'checkBannedWords':
        return Response.json(await this.checkBannedWords(params.content))

      case 'checkVoiceMarkers':
        return Response.json(await this.checkVoiceMarkers(params.content))

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
      // Use parameterized query
      const spokes = this.sql.exec(
        `
        SELECT status, mutated_at 
        FROM spokes 
        WHERE hub_id = ? AND status = 'approved'
      `, hub.id).toArray()
      
      const totalApproved = spokes.length
      const zeroEditApproved = spokes.filter(s => !s.mutated_at).length
      const zer = totalApproved > 0 ? zeroEditApproved / totalApproved : 0
      
      return { hubId: hub.id, zer, totalApproved }
    })

    const currentZER = hubStats.length > 0 
      ? hubStats.reduce((sum, h) => sum + h.zer, 0) / hubStats.length 
      : 0

    // Voice Drift Detection
    const last50Spokes = this.sql.exec(
      `
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
      const baselineSimilarity = this.sql.exec(
        `
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
      const spokes = this.sql.exec(
        `
        SELECT status, mutated_at 
        FROM spokes 
        WHERE hub_id = ? AND status = 'approved'
      `, hub.id as string).toArray()
      
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
    const params: any[] = []

    // Metadata fields stored in brand_dna table
    if (updates.signaturePatterns) {
      sets.push(`signature_patterns = ?`)
      params.push(JSON.stringify(updates.signaturePatterns))
    }
    if (updates.toneProfile) {
      sets.push(`tone_profile = ?`)
      params.push(JSON.stringify(updates.toneProfile))
    }
    if (updates.voiceBaseline !== undefined) {
      sets.push(`voice_baseline = ?`)
      params.push(updates.voiceBaseline)
    }
    if (updates.timeToDNA !== undefined) {
      sets.push(`time_to_dna = ?`)
      params.push(updates.timeToDNA)
    }
    if (updates.lastCalibration !== undefined) {
      sets.push(`last_calibration = ?`)
      params.push(updates.lastCalibration)
    }

    if (sets.length > 0) {
      this.sql.exec(`UPDATE brand_dna SET ${sets.join(', ')} WHERE id = 1`, ...params)
    }

    // Persist Voice Markers
    // Handle both string[] (from Workflow) and VoiceMarker[] (internal)
    if (updates.voiceMarkers) {
      for (const marker of updates.voiceMarkers) {
        const phrase = typeof marker === 'string' ? marker : marker.phrase
        if (!phrase) continue
        
        // Upsert by checking existence first
        // Simple strategy: Insert if not exists
        try {
          this.sql.exec(
            `
            INSERT INTO voice_markers (id, phrase, source, confidence)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(phrase) DO UPDATE SET created_at = CURRENT_TIMESTAMP
          `, crypto.randomUUID(), phrase.toLowerCase().trim(), 'analysis', 1.0)
        } catch (e) {
          // Ignore unique constraint if ON CONFLICT fails (shouldn't with correct syntax)
        }
      }
    }

    // Persist Banned Words
    if (updates.bannedWords) {
      for (const bw of updates.bannedWords) {
        // Normalize: bw might be partial or full object
        // Workflow returns { word, severity, reason }
        const word = typeof bw === 'string' ? bw : bw.word
        if (!word) continue
        
        const severity = (bw as any).severity || 'hard'
        const reason = (bw as any).reason || null
        
        try {
          this.sql.exec(
            `
            INSERT INTO banned_words (id, word, severity, reason, source)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(word) DO UPDATE SET severity = excluded.severity, reason = excluded.reason
          `, crypto.randomUUID(), word.toLowerCase().trim(), severity, reason, 'analysis')
        } catch (e) {
          // Ignore
        }
      }
    }

    // Persist Brand Stances
    if (updates.stances) {
      for (const stance of updates.stances) {
        if (!stance.topic || !stance.position) continue
        
        try {
          this.sql.exec(
            `
            INSERT INTO brand_stances (id, topic, position, source)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(topic, position) DO UPDATE SET created_at = CURRENT_TIMESTAMP
          `, crypto.randomUUID(), stance.topic, stance.position, 'analysis')
        } catch (e) {
          // Ignore
        }
      }
    }

    return { success: true }
  }

  // Voice Markers CRUD Methods
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
      this.sql.exec(
        `
        INSERT INTO voice_markers (id, phrase, source, confidence)
        VALUES (?, ?, ?, ?)
      `, id, normalizedPhrase, source, confidence)

      this.sql.exec(`UPDATE brand_dna SET last_calibration = CURRENT_TIMESTAMP WHERE id = 1`)

      return {
        id,
        phrase: normalizedPhrase,
        source,
        confidence,
        createdAt: new Date().toISOString(),
      }
    } catch (error) {
      if (String(error).includes('UNIQUE constraint')) {
        const existing = this.sql.exec(`SELECT * FROM voice_markers WHERE phrase = ?`, normalizedPhrase).one()
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
    this.sql.exec(`DELETE FROM voice_markers WHERE id = ?`, markerId)
    this.sql.exec(`UPDATE brand_dna SET last_calibration = CURRENT_TIMESTAMP WHERE id = 1`)
    return { success: true }
  }

  private async updateVoiceMarker(params: {
    markerId: string
    phrase?: string
    confidence?: number
  }): Promise<VoiceMarker> {
    const sets: string[] = []
    const sqlParams: any[] = []

    if (params.phrase) {
      sets.push(`phrase = ?`)
      sqlParams.push(params.phrase.toLowerCase().trim())
    }
    if (params.confidence !== undefined) {
      sets.push(`confidence = ?`)
      sqlParams.push(params.confidence)
    }

    if (sets.length > 0) {
      sqlParams.push(params.markerId)
      this.sql.exec(`UPDATE voice_markers SET ${sets.join(', ')} WHERE id = ?`, ...sqlParams)
      this.sql.exec(`UPDATE brand_dna SET last_calibration = CURRENT_TIMESTAMP WHERE id = 1`)
    }

    const row = this.sql.exec(`SELECT * FROM voice_markers WHERE id = ?`, params.markerId).one()
    return {
      id: row.id as string,
      phrase: row.phrase as string,
      source: row.source as 'voice' | 'manual' | 'analysis',
      confidence: row.confidence as number,
      createdAt: row.created_at as string,
    }
  }

  // Banned Words CRUD Methods
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
    const reason = params.reason || null

    try {
      this.sql.exec(
        `
        INSERT INTO banned_words (id, word, severity, reason, source)
        VALUES (?, ?, ?, ?, ?)
      `, id, normalizedWord, severity, reason, source)

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
      if (String(error).includes('UNIQUE constraint')) {
        const existing = this.sql.exec(`SELECT * FROM banned_words WHERE word = ?`, normalizedWord).one()
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
    this.sql.exec(`DELETE FROM banned_words WHERE id = ?`, wordId)
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
    const sqlParams: any[] = []

    if (params.word) {
      sets.push(`word = ?`)
      sqlParams.push(params.word.toLowerCase().trim())
    }
    if (params.severity) {
      sets.push(`severity = ?`)
      sqlParams.push(params.severity)
    }
    if (params.reason !== undefined) {
      sets.push(`reason = ?`)
      sqlParams.push(params.reason)
    }

    if (sets.length > 0) {
      sqlParams.push(params.wordId)
      this.sql.exec(`UPDATE banned_words SET ${sets.join(', ')} WHERE id = ?`, ...sqlParams)
      this.sql.exec(`UPDATE brand_dna SET last_calibration = CURRENT_TIMESTAMP WHERE id = 1`)
    }

    const row = this.sql.exec(`SELECT * FROM banned_words WHERE id = ?`, params.wordId).one()
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
      this.sql.exec(
        `
        INSERT INTO brand_stances (id, topic, position, source)
        VALUES (?, ?, ?, ?)
      `, id, params.topic, params.position, source)

      this.sql.exec(`UPDATE brand_dna SET last_calibration = CURRENT_TIMESTAMP WHERE id = 1`)

      return {
        id,
        topic: params.topic,
        position: params.position,
        source,
        createdAt: new Date().toISOString(),
      }
    } catch (error) {
      if (String(error).includes('UNIQUE constraint')) {
        const existing = this.sql.exec(
          `
          SELECT * FROM brand_stances
          WHERE topic = ? AND position = ?
        `, params.topic, params.position).one()
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
    this.sql.exec(`DELETE FROM brand_stances WHERE id = ?`, stanceId)
    this.sql.exec(`UPDATE brand_dna SET last_calibration = CURRENT_TIMESTAMP WHERE id = 1`)
    return { success: true }
  }

  // Hub Methods
  private async createHub(hub: Omit<Hub, 'createdAt'>): Promise<Hub> {
    this.sql.exec(
      `
      INSERT INTO hubs (id, source_content, platform, angle, status, pillars)
      VALUES (?, ?, ?, ?, ?, ?)
    `, hub.id, hub.sourceContent, hub.platform, hub.angle, hub.status, JSON.stringify(hub.pillars))

    return this.getHub(hub.id) as Promise<Hub>
  }

  private async getHub(hubId: string): Promise<Hub | null> {
    const row = this.sql.exec(`SELECT * FROM hubs WHERE id = ?`, hubId).one()
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

  private async listHubs(params: { status?: string; limit?: number; offset?: number; createdAfter?: string }): Promise<Hub[]> {
    let query = `SELECT * FROM hubs`
    const sqlParams: any[] = []
    const conditions: string[] = []

    if (params.status) {
      conditions.push(`status = ?`)
      sqlParams.push(params.status)
    }
    if (params.createdAfter) {
      conditions.push(`created_at >= ?`)
      sqlParams.push(params.createdAfter)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    query += ` ORDER BY created_at DESC`

    if (params.limit) {
      query += ` LIMIT ?`
      sqlParams.push(params.limit)
    }
    if (params.offset) {
      query += ` OFFSET ?`
      sqlParams.push(params.offset)
    }

    return this.sql.exec(query, ...sqlParams).toArray().map(row => ({
      id: row.id as string,
      sourceContent: row.source_content as string,
      platform: row.platform as string,
      angle: row.angle as string,
      status: row.status as Hub['status'],
      pillars: JSON.parse(row.pillars as string),
      createdAt: row.created_at as string,
    }))
  }

  private async countHubs(params: { createdAfter?: string }): Promise<{ count: number }> {
    let query = `SELECT COUNT(*) as count FROM hubs`
    const sqlParams: any[] = []

    if (params.createdAfter) {
      query += ` WHERE created_at >= ?`
      sqlParams.push(params.createdAfter)
    }

    const result = this.sql.exec(query, ...sqlParams).one()
    return { count: (result.count as number) || 0 }
  }

  private async killHub(hubId: string, reason?: string): Promise<{ killed: number; survived: number }> {
    this.sql.exec(`UPDATE hubs SET status = 'killed' WHERE id = ?`, hubId)

    const result = this.sql.exec(
      `
      UPDATE spokes
      SET status = 'killed'
      WHERE hub_id = ? AND mutated_at IS NULL
    `, hubId)

    const killed = result.rowsWritten
    const survived = this.sql.exec(
      `
      SELECT COUNT(*) as count FROM spokes
      WHERE hub_id = ? AND mutated_at IS NOT NULL
    `, hubId).one().count as number

    await this.recordMetric({
      metricType: 'hub_kill',
      value: killed,
      metadata: { hubId, reason, survived },
    })

    return { killed, survived }
  }

  // Spoke Methods
  private async createSpoke(spoke: Omit<Spoke, 'createdAt'>): Promise<Spoke> {
    // parentSpokeId is handled as null in params if undefined
    this.sql.exec(
      `
      INSERT INTO spokes (id, hub_id, pillar_id, platform, content, status, regeneration_count, parent_spoke_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, 
      spoke.id, 
      spoke.hubId, 
      spoke.pillarId || '', 
      spoke.platform, 
      spoke.content || '', 
      spoke.status, 
      spoke.regenerationCount, 
      spoke.parentSpokeId || null
    )

    return this.getSpoke(spoke.id) as Promise<Spoke>
  }

  private async getSpoke(spokeId: string): Promise<Spoke | null> {
    const row = this.sql.exec(`SELECT * FROM spokes WHERE id = ?`, spokeId).one()
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
      parentSpokeId: row.parent_spoke_id as string | null,
      createdAt: row.created_at as string,
    }
  }

  private async updateSpoke(params: { spokeId: string; updates: Partial<Spoke> }): Promise<Spoke> {
    const { spokeId, updates } = params
    const sets: string[] = []
    const sqlParams: any[] = []

    if (updates.content !== undefined) {
      sets.push(`content = ?`)
      sqlParams.push(updates.content)
      sets.push(`mutated_at = CURRENT_TIMESTAMP`)
    }
    if (updates.status) {
      sets.push(`status = ?`)
      sqlParams.push(updates.status)
    }
    if (updates.qualityScores) {
      if (updates.qualityScores.g2_hook !== undefined) {
        sets.push(`g2_hook = ?`)
        sqlParams.push(updates.qualityScores.g2_hook)
      }
      if (updates.qualityScores.g4_voice !== undefined) {
        sets.push(`g4_voice = ?`)
        sqlParams.push(updates.qualityScores.g4_voice ? 1 : 0)
      }
      if (updates.qualityScores.g4_similarity !== undefined) {
        sets.push(`g4_similarity = ?`)
        sqlParams.push(updates.qualityScores.g4_similarity)
      }
      if (updates.qualityScores.g5_platform !== undefined) {
        sets.push(`g5_platform = ?`)
        sqlParams.push(updates.qualityScores.g5_platform ? 1 : 0)
      }
      if (updates.qualityScores.g6_visual !== undefined) {
        sets.push(`g6_visual = ?`)
        sqlParams.push(updates.qualityScores.g6_visual)
      }
      if (updates.qualityScores.g7_engagement !== undefined) {
        sets.push(`g7_engagement = ?`)
        sqlParams.push(updates.qualityScores.g7_engagement)
      }
    }
    if (updates.visualArchetype !== undefined) {
      sets.push(`visual_archetype = ?`)
      sqlParams.push(updates.visualArchetype)
    }
    if (updates.imagePrompt !== undefined) {
      sets.push(`image_prompt = ?`)
      sqlParams.push(updates.imagePrompt)
    }
    if (updates.thumbnailConcept !== undefined) {
      sets.push(`thumbnail_concept = ?`)
      sqlParams.push(updates.thumbnailConcept)
    }
    if (updates.regenerationCount !== undefined) {
      sets.push(`regeneration_count = ?`)
      sqlParams.push(updates.regenerationCount)
    }

    if (sets.length > 0) {
      sqlParams.push(spokeId)
      this.sql.exec(`UPDATE spokes SET ${sets.join(', ')} WHERE id = ?`, ...sqlParams)
    }

    return this.getSpoke(spokeId) as Promise<Spoke>
  }

  private async listSpokes(params: { hubId?: string; status?: string; limit?: number; createdAfter?: string }): Promise<Spoke[]> {
    let query = `SELECT * FROM spokes WHERE 1=1`
    const sqlParams: any[] = []

    if (params.hubId) {
      query += ` AND hub_id = ?`
      sqlParams.push(params.hubId)
    }
    if (params.status) {
      query += ` AND status = ?`
      sqlParams.push(params.status)
    }
    if (params.createdAfter) {
      query += ` AND created_at >= ?`
      sqlParams.push(params.createdAfter)
    }
    query += ` ORDER BY created_at DESC`
    if (params.limit) {
      query += ` LIMIT ?`
      sqlParams.push(params.limit)
    }

    return this.sql.exec(query, ...sqlParams).toArray().map(row => ({
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
      parentSpokeId: row.parent_spoke_id as string | null,
      createdAt: row.created_at as string,
    }))
  }

  // Count variations of a parent spoke
  private async countVariations(parentSpokeId: string): Promise<{ count: number }> {
    const result = this.sql.exec(`
      SELECT COUNT(*) as count FROM spokes WHERE parent_spoke_id = ?
    `, parentSpokeId).one()
    return { count: (result.count as number) || 0 }
  }

  // List all variations of a parent spoke
  private async listVariations(parentSpokeId: string): Promise<Spoke[]> {
    return this.sql.exec(`
      SELECT * FROM spokes WHERE parent_spoke_id = ? ORDER BY created_at DESC
    `, parentSpokeId).toArray().map(row => ({
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
      parentSpokeId: row.parent_spoke_id as string | null,
      createdAt: row.created_at as string,
    }))
  }

  private async approveSpoke(spokeId: string): Promise<{ success: boolean }> {
    this.sql.exec(`UPDATE spokes SET status = 'approved' WHERE id = ?`, spokeId)

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
    this.sql.exec(`UPDATE spokes SET status = 'rejected' WHERE id = ?`, spokeId)

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

  private async getReviewQueue(params: { filter?: string; limit?: number; offset?: number }): Promise<Spoke[]> {
    let query = `SELECT * FROM spokes`
    const conditions: string[] = []
    const sqlParams: any[] = []

    // Filter logic aligned with Epic 5 definitions
    // G7 thresholds: >90 = High Confidence, 50-90 = Needs Review
    if (params.filter === 'top10') {
      // High Confidence: Ready for review + High Score (G7 > 90)
      conditions.push(`(status = 'ready_for_review' OR status = 'reviewing')`)
      conditions.push(`g7_engagement > 90`)
    } else if (params.filter === 'needs-review') {
      // Needs Review: Ready for review + Mid Score (G7 50-90)
      conditions.push(`(status = 'ready_for_review' OR status = 'reviewing')`)
      conditions.push(`g7_engagement >= 50 AND g7_engagement <= 90`)
    } else if (params.filter === 'flagged') {
      // Creative Conflicts: Failed QA or escalated
      conditions.push(`(status = 'failed_qa' OR status = 'creative_conflict')`)
    } else if (params.filter === 'just-generated') {
      // Just Generated: Spokes with status 'generating' OR created in last 24 hours
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
      const cutoffISO = twentyFourHoursAgo.toISOString()
      conditions.push(`(status = 'generating' OR created_at >= '${cutoffISO}')`)
    } else {
      // All pending review items
      conditions.push(`(status = 'ready_for_review' OR status = 'reviewing')`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    query += ` ORDER BY created_at DESC`

    if (params.limit) {
      query += ` LIMIT ?`
      sqlParams.push(params.limit)
    }
    
    if (params.offset) {
      query += ` OFFSET ?`
      sqlParams.push(params.offset)
    }

    try {
      return this.sql.exec(query, ...sqlParams).toArray().map(row => ({
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
        parentSpokeId: row.parent_spoke_id as string | null,
        createdAt: row.created_at as string,
      }))
    } catch (error) {
      console.error('getReviewQueue query failed:', error)
      // Fail gracefully with empty array rather than crashing the request
      return []
    }
  }

  // Feedback Methods (Self-Healing Loop)
  private async storeFeedback(params: {
    spokeId: string
    gate: string
    criticOutput: string
    iteration: number
  }): Promise<{ success: boolean }> {
    const feedbackId = crypto.randomUUID()
    this.sql.exec(
      `
      INSERT INTO feedback (id, spoke_id, gate, critic_output, iteration)
      VALUES (?, ?, ?, ?, ?)
    `, feedbackId, params.spokeId, params.gate, params.criticOutput, params.iteration)
    return { success: true }
  }

  private async getFeedback(spokeId: string): Promise<Array<{ 
    gate: string
    criticOutput: string
    iteration: number
    createdAt: string
  }>> {
    return this.sql.exec(
      `
      SELECT gate, critic_output, iteration, created_at
      FROM feedback
      WHERE spoke_id = ?
      ORDER BY iteration ASC
    `, spokeId).toArray().map(row => ({
      gate: row.gate as string,
      criticOutput: row.critic_output as string,
      iteration: row.iteration as number,
      createdAt: row.createdAt as string,
    }))
  }

  // Quality Gate Runner - Implements G2-G7 gate evaluation
  private async runQualityGate(spokeId: string, gate: string): Promise<{
    passed: boolean
    score?: number
    feedback?: string
    violations?: string[]
  }> {
    const startTime = Date.now()
    const spoke = await this.getSpoke(spokeId)

    if (!spoke) {
      return {
        passed: false,
        feedback: `Spoke ${spokeId} not found`,
        violations: ['Spoke not found'],
      }
    }

    const content = spoke.content || ''
    const platform = spoke.platform

    try {
      switch (gate) {
        case 'g2_hook':
          return await this.runG2HookGate(content, platform, startTime)

        case 'g4_voice':
          return await this.runG4VoiceGate(content, startTime)

        case 'g5_platform':
          return await this.runG5PlatformGate(content, platform, startTime)

        case 'g6_visual':
          return await this.runG6VisualGate(spoke.imagePrompt || spoke.thumbnailConcept || content, startTime)

        case 'g7_engagement':
          return await this.runG7EngagementGate(content, platform, startTime)

        default:
          return {
            passed: false,
            feedback: `Unknown gate type: ${gate}`,
            violations: [`Gate ${gate} not implemented`],
          }
      }
    } catch (error) {
      console.error(`Quality gate ${gate} error:`, error)
      return {
        passed: false,
        feedback: `Gate evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        violations: ['Gate evaluation error'],
      }
    }
  }

  // G2 Hook Strength Gate (0-100, threshold 60)
  private async runG2HookGate(content: string, platform: string, startTime: number): Promise<{
    passed: boolean
    score: number
    feedback: string
    violations?: string[]
  }> {
    const G2_THRESHOLD = 60

    const prompt = `You are a Content Quality Critic evaluating hook strength.

Rate this ${platform} content on three dimensions:

CONTENT:
"""
${content.substring(0, 500)}
"""

Score each dimension (use ONLY integers):
1. PATTERN INTERRUPT (0-40): Does this stop the scroll? Is it unexpected?
2. BENEFIT SIGNAL (0-30): Is the value proposition clear within first 5 seconds?
3. CURIOSITY GAP (0-30): Does it create tension that demands resolution?

Respond in JSON format ONLY:
{
  "patternInterrupt": <0-40>,
  "benefitSignal": <0-30>,
  "curiosityGap": <0-30>,
  "notes": "<brief explanation of scoring and specific improvement suggestions>"
}`

    try {
      const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: prompt }],
      }) as { response: string }

      const jsonMatch = response.response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return {
          passed: true,
          score: 70,
          feedback: 'Unable to parse AI response (defaulting to pass)',
        }
      }

      const parsed = JSON.parse(jsonMatch[0])
      const score = (parsed.patternInterrupt || 0) + (parsed.benefitSignal || 0) + (parsed.curiosityGap || 0)
      const passed = score >= G2_THRESHOLD

      const violations: string[] = []
      if (parsed.patternInterrupt < 20) violations.push(`Weak pattern interrupt (${parsed.patternInterrupt}/40) - needs scroll-stopping hook`)
      if (parsed.benefitSignal < 15) violations.push(`Unclear benefit signal (${parsed.benefitSignal}/30) - value proposition not obvious`)
      if (parsed.curiosityGap < 15) violations.push(`Low curiosity gap (${parsed.curiosityGap}/30) - no tension or intrigue`)

      const executionTime = Date.now() - startTime
      const feedback = passed
        ? `Hook strength ${score}/100. ${parsed.notes || ''}`
        : `REGENERATE: Hook weak (${score}/100). ${violations.join('. ')}. ${parsed.notes || ''}`

      return { passed, score, feedback, violations: passed ? undefined : violations }
    } catch (error) {
      console.error('G2 gate error:', error)
      return {
        passed: false,
        score: 0,
        feedback: 'AI evaluation failed: Service unavailable or response invalid. Please retry.',
        violations: ['AI Service Failure'],
      }
    }
  }

  // G4 Voice Alignment Gate (pass/fail)
  private async runG4VoiceGate(content: string, startTime: number): Promise<{
    passed: boolean
    score?: number
    feedback: string
    violations?: string[]
  }> {
    const violations: string[] = []

    // Step 1: Check banned words
    const bannedCheck = await this.checkBannedWords(content)
    if (bannedCheck.violations.length > 0) {
      for (const v of bannedCheck.violations) {
        if (v.severity === 'hard') {
          violations.push(`HARD VIOLATION: "${v.word}" - ${v.reason || 'banned word'}`)
        } else {
          violations.push(`Soft violation: "${v.word}" - ${v.reason || 'discouraged word'}`)
        }
      }
    }

    // Step 2: Check voice marker alignment
    const markerCheck = await this.checkVoiceMarkers(content)
    const similarity = markerCheck.similarity

    // Step 3: Get brand DNA for tone profile check
    const brandDNA = await this.getBrandDNA()

    // Step 4: AI tone alignment check (if tone profile exists)
    let toneAligned = true
    if (Object.keys(brandDNA.toneProfile).length > 0) {
      try {
        const tonePrompt = `Check if this content matches the target tone profile.
Target tone (0=first, 100=second):
- formal_casual: ${brandDNA.toneProfile.formal_casual ?? 50}
- serious_playful: ${brandDNA.toneProfile.serious_playful ?? 50}
- technical_accessible: ${brandDNA.toneProfile.technical_accessible ?? 50}
- reserved_expressive: ${brandDNA.toneProfile.reserved_expressive ?? 50}

Content:
"${content.substring(0, 1000)}"

Output JSON only: {"aligned": true/false, "mismatches": ["list of tone mismatches"], "feedback": "brief explanation"}`

        const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [{ role: 'user', content: tonePrompt }],
        }) as { response: string }

        const jsonMatch = response.response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          toneAligned = parsed.aligned !== false
          if (!toneAligned && parsed.mismatches) {
            for (const mismatch of parsed.mismatches) {
              violations.push(`Tone mismatch: ${mismatch}`)
            }
          }
        }
      } catch {
        // Tone check failed, continue without it
      }
    }

    // Hard violations fail immediately
    const hasHardViolation = bannedCheck.violations.some(v => v.severity === 'hard')
    const passed = !hasHardViolation && toneAligned

    // Calculate a similarity-based score (for analytics, not pass/fail)
    const score = Math.round(similarity)

    const executionTime = Date.now() - startTime
    const feedback = passed
      ? `Voice aligned. ${markerCheck.matches.length} voice markers found. Similarity: ${score}%`
      : `REGENERATE: Voice violations. ${violations.join('. ')}`

    return {
      passed,
      score,
      feedback,
      violations: passed ? undefined : violations,
    }
  }

  // G5 Platform Compliance Gate (pass/fail)
  private async runG5PlatformGate(content: string, platform: string, startTime: number): Promise<{
    passed: boolean
    feedback: string
    violations?: string[]
  }> {
    const PLATFORM_RULES: Record<string, {
      maxChars?: number
      hashtagLimit?: number
      minSlides?: number
      maxSlides?: number
      minPosts?: number
      maxPosts?: number
      maxWords?: number
    }> = {
      twitter: { maxChars: 280, hashtagLimit: 3 },
      linkedin: { maxChars: 3000, hashtagLimit: 5 },
      tiktok: { maxWords: 150, hashtagLimit: 5 },
      instagram: { maxChars: 2200, hashtagLimit: 30 },
      thread: { minPosts: 5, maxPosts: 7, maxChars: 2800 },
      carousel: { minSlides: 5, maxSlides: 8, maxChars: 2200 },
      youtube_thumbnail: { maxChars: 60 },
    }

    const rules = PLATFORM_RULES[platform]
    const violations: string[] = []

    if (!rules) {
      return {
        passed: true,
        feedback: `No specific rules for platform ${platform}`,
      }
    }

    // Character limit check
    if (rules.maxChars && content.length > rules.maxChars) {
      violations.push(`Exceeds ${rules.maxChars} char limit (${content.length} chars). Shorten by ${content.length - rules.maxChars} characters.`)
    }

    // Word limit check
    const wordCount = content.split(/\s+/).filter(Boolean).length
    if (rules.maxWords && wordCount > rules.maxWords) {
      violations.push(`Exceeds ${rules.maxWords} word limit (${wordCount} words). Remove ${wordCount - rules.maxWords} words.`)
    }

    // Hashtag limit check
    const hashtagCount = (content.match(/#\w+/g) || []).length
    if (rules.hashtagLimit && hashtagCount > rules.hashtagLimit) {
      violations.push(`Too many hashtags (${hashtagCount}/${rules.hashtagLimit}). Remove ${hashtagCount - rules.hashtagLimit} hashtags.`)
    }

    // Thread structure check
    if (platform === 'thread') {
      const hasSequence = /1\//.test(content) || /^1\./m.test(content)
      if (!hasSequence) {
        violations.push('Thread missing sequential indicators (e.g., "1/", "1.")')
      }
    }

    // Carousel structure check
    if (platform === 'carousel') {
      const slideMatches = content.match(/Slide \d+/gi) || []
      const slideCount = slideMatches.length
      if (slideCount < (rules.minSlides || 5)) {
        violations.push(`Carousel needs ${rules.minSlides || 5} slides (found ${slideCount}). Add ${(rules.minSlides || 5) - slideCount} more slides.`)
      }
      if (rules.maxSlides && slideCount > rules.maxSlides) {
        violations.push(`Carousel exceeds ${rules.maxSlides} slides (found ${slideCount}). Remove ${slideCount - rules.maxSlides} slides.`)
      }
    }

    const passed = violations.length === 0
    const executionTime = Date.now() - startTime
    const feedback = passed
      ? `Platform compliant for ${platform}`
      : `REGENERATE: ${violations.join('. ')}`

    return { passed, feedback, violations: passed ? undefined : violations }
  }

  // G6 Visual Cliché Gate (0-100, threshold 50)
  private async runG6VisualGate(visualConcept: string, startTime: number): Promise<{
    passed: boolean
    score: number
    feedback: string
    violations?: string[]
  }> {
    const G6_THRESHOLD = 50

    const prompt = `Evaluate this visual concept/prompt for AI clichés and originality.

KNOWN AI CLICHÉS TO FLAG:
- Robot brains, AI faces, circuit patterns
- Handshakes, puzzle pieces, lightbulbs
- Generic stock business people in suits
- Blue/purple gradients, generic tech backgrounds
- Floating heads, abstract neural networks
- Sunrise/mountain "inspiration" imagery

Visual Concept:
"${visualConcept.substring(0, 500)}"

Score originality 0-100 (higher = more original, fewer clichés).

Output JSON only:
{
  "score": <0-100>,
  "clichesDetected": ["list of clichés found"],
  "feedback": "brief explanation",
  "suggestions": ["alternative visual approaches"]
}`

    try {
      const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: prompt }],
      }) as { response: string }

      const jsonMatch = response.response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return {
          passed: true,
          score: 60,
          feedback: 'Unable to parse AI response (defaulting to pass)',
        }
      }

      const parsed = JSON.parse(jsonMatch[0])
      const score = parsed.score || 50
      const cliches = parsed.clichesDetected || []
      const passed = score >= G6_THRESHOLD && cliches.length === 0

      const violations = cliches.map((c: string) => `AI Cliché: ${c}`)
      if (parsed.suggestions && !passed) {
        violations.push(`Try instead: ${parsed.suggestions.slice(0, 2).join(', ')}`)
      }

      const executionTime = Date.now() - startTime
      const feedback = passed
        ? `Visual concept original (${score}/100). ${parsed.feedback || ''}`
        : `REGENERATE: Visual clichés detected (${score}/100). ${violations.join('. ')}`

      return { passed, score, feedback, violations: passed ? undefined : violations }
    } catch (error) {
      console.error('G6 gate error:', error)
      return {
        passed: false,
        score: 0,
        feedback: 'AI evaluation failed: Service unavailable or response invalid. Please retry.',
        violations: ['AI Service Failure'],
      }
    }
  }

  // G7 Engagement Prediction Gate (0-100, threshold 60)
  private async runG7EngagementGate(content: string, platform: string, startTime: number): Promise<{
    passed: boolean
    score: number
    feedback: string
    violations?: string[]
  }> {
    const G7_THRESHOLD = 60

    const prompt = `Predict the engagement potential for this ${platform} content.

CONTENT:
"""
${content}
"""

Score each dimension (0-33, total should be approximately 0-100):
1. SHAREABILITY: Would someone share this with their network?
2. COMMENT-WORTHINESS: Does it invite discussion or debate?
3. SAVE LIKELIHOOD: Is it reference-worthy or bookmark-able?

Consider ${platform}-specific engagement patterns.

Respond in JSON format ONLY:
{
  "shareability": <0-33>,
  "commentWorthiness": <0-33>,
  "saveLikelihood": <0-34>,
  "notes": "<brief prediction reasoning and improvement suggestions>"
}`

    try {
      const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: prompt }],
      }) as { response: string }

      const jsonMatch = response.response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return {
          passed: true,
          score: 70,
          feedback: 'Unable to parse AI response (defaulting to pass)',
        }
      }

      const parsed = JSON.parse(jsonMatch[0])
      const score = (parsed.shareability || 0) + (parsed.commentWorthiness || 0) + (parsed.saveLikelihood || 0)
      const passed = score >= G7_THRESHOLD

      const violations: string[] = []
      if (parsed.shareability < 15) violations.push(`Low shareability (${parsed.shareability}/33) - not compelling to share`)
      if (parsed.commentWorthiness < 15) violations.push(`Low comment potential (${parsed.commentWorthiness}/33) - doesn't invite discussion`)
      if (parsed.saveLikelihood < 15) violations.push(`Low save likelihood (${parsed.saveLikelihood}/34) - not reference-worthy`)

      const executionTime = Date.now() - startTime
      const feedback = passed
        ? `Engagement predicted ${score}/100. ${parsed.notes || ''}`
        : `REGENERATE: Low engagement predicted (${score}/100). ${violations.join('. ')}. ${parsed.notes || ''}`

      return { passed, score, feedback, violations: passed ? undefined : violations }
    } catch (error) {
      console.error('G7 gate error:', error)
      return {
        passed: false,
        score: 0,
        feedback: 'AI evaluation failed: Service unavailable or response invalid. Please retry.',
        violations: ['AI Service Failure'],
      }
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
      WHERE metric_type = ?
        AND created_at >= datetime('now', '-' || ? || ' days')
    `

    return this.sql.exec(query, params.metricType, days).one()
  }

  private async getZeroEditRate(params: { periodDays?: number }): Promise<{ rate: number, zeroEditCount: number, totalApprovals: number }> {
    const days = params.periodDays || 30
    const query = `
      SELECT
        SUM(CASE WHEN metric_type = 'zero_edit_approval' THEN 1 ELSE 0 END) as zero_edit_count,
        SUM(CASE WHEN metric_type = 'spoke_approval' THEN 1 ELSE 0 END) as total_approvals
      FROM analytics
      WHERE metric_type IN ('zero_edit_approval', 'spoke_approval')
        AND created_at >= datetime('now', '-' || ? || ' days')
    `

    const result = this.sql.exec(query, days).one()
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
    this.sql.exec(
      `
      INSERT INTO analytics (metric_type, value, metadata)
      VALUES (?, ?, ?)
    `, params.metricType, params.value, JSON.stringify(params.metadata || {}))
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
      WHERE metric_type = ?
        AND created_at >= datetime('now', '-' || ? || ' days')
      ORDER BY created_at ASC
    `

    const results = this.sql.exec(query, params.metricType, days).toArray()
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
    this.sql.exec(
      `
      INSERT INTO exports (id, format, status)
      VALUES (?, ?, 'processing')
    `, exportId, params.format)

    // Fetch approved spokes
    let query = `
      SELECT s.*, h.source_content as hub_content, h.angle as hub_angle
      FROM spokes s
      JOIN hubs h ON s.hub_id = h.id
      WHERE s.status = 'approved'
    `
    const sqlParams: any[] = []

    if (params.hubIds && params.hubIds.length > 0) {
      // NOTE: Parameterized IN clause is tricky in basic SQLite unless you generate placeholders
      // Safe dynamic generation for IDs
      const placeholders = params.hubIds.map(() => '?').join(',')
      query += ` AND s.hub_id IN (${placeholders})`
      sqlParams.push(...params.hubIds)
    }
    if (params.platforms && params.platforms.length > 0) {
      const placeholders = params.platforms.map(() => '?').join(',')
      query += ` AND s.platform IN (${placeholders})`
      sqlParams.push(...params.platforms)
    }

    const spokes = this.sql.exec(query, ...sqlParams).toArray()

    if (spokes.length === 0) {
      this.sql.exec(`UPDATE exports SET status = 'failed', metadata = '{"error": "No approved spokes found"}' WHERE id = ?`, exportId)
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

      this.sql.exec(
        `
        UPDATE exports
        SET status = 'completed', r2_key = ?
        WHERE id = ?
      `, r2Key, exportId)

      return { exportId, status: 'completed' }
    } catch (error) {
      console.error('Export upload failed:', error)
      this.sql.exec(
        `
        UPDATE exports
        SET status = 'failed', metadata = ?
        WHERE id = ?
      `, JSON.stringify({ error: String(error) }), exportId)
      return { exportId, status: 'failed' }
    }
  }

  private convertToCSV(spokes: any[]): string {
    const headers = ['id', 'hub_id', 'platform', 'content', 'created_at', 'hub_angle']
    const rows = spokes.map(s => [
      s.id,
      s.hub_id,
      s.platform,
      `"${(s.content || '').replace(/"/g, '""')}"`, // Escape double quotes within content
      s.created_at,
      s.hub_angle
    ])

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  }

  private async getExport(exportId: string): Promise<any> {
    const row = this.sql.exec(`SELECT * FROM exports WHERE id = ?`, exportId).one()
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
    return this.sql.exec(`SELECT * FROM exports ORDER BY created_at DESC LIMIT ?`, limit).toArray()
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
        // Store in Vectorize with client namespace for physical isolation
        await this.env.VECTORIZE.upsert([{
          id: `voice-${this.clientId}-${Date.now()}`,
          values: embeddingsResponse.data[0],
          metadata: {
            client_id: this.clientId,
            type: 'voice_note',
            transcription: params.transcription,
            timestamp: new Date().toISOString(),
          },
          namespace: this.clientId,
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
              client_id: this.clientId,
              type: 'brand_dna',
              voiceMarkersCount: voiceMarkers.length,
              stancesCount: brandStances.length,
              strengthScore,
              timestamp: new Date().toISOString(),
            },
            namespace: this.clientId,
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
                  client_id: this.clientId,
                  type: 'brand_stance',
                  topic: stance.topic,
                  position: stance.position,
                  stanceId: stance.id,
                },
                namespace: this.clientId,
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
    this.sql.exec(
      `
      UPDATE brand_dna SET
        voice_baseline = ?,
        last_calibration = ?
      WHERE id = 1
    `, strengthScore, new Date().toISOString())

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