import { eq, desc, and, count, sql } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { 
    training_samples, 
    brand_dna, 
    brand_dna_snapshots,
    clients
} from '../schema';
import { TrainingSample, BrandDNA, BrandDNASnapshot } from '../schema';

// === Training Samples ===

export async function getTrainingSamples(
    db: DrizzleD1Database<any>, 
    clientId: string, 
    limit: number = 50, 
    offset: number = 0
) {
    const results = await db
        .select()
        .from(training_samples)
        .where(eq(training_samples.client_id, clientId))
        .orderBy(desc(training_samples.created_at))
        .limit(limit)
        .offset(offset)
        .all();
    
    return results;
}

export async function getTrainingSamplesCount(db: DrizzleD1Database<any>, clientId: string) {
    const result = await db
        .select({ total: count() })
        .from(training_samples)
        .where(eq(training_samples.client_id, clientId))
        .get();
    
    return result?.total ?? 0;
}

export async function getTrainingSampleById(db: DrizzleD1Database<any>, sampleId: string, clientId: string) {
    return await db
        .select()
        .from(training_samples)
        .where(and(
            eq(training_samples.id, sampleId),
            eq(training_samples.client_id, clientId)
        ))
        .get();
}

export async function createTrainingSample(
    db: DrizzleD1Database<any>, 
    sample: typeof training_samples.$inferInsert
) {
    return await db.insert(training_samples).values(sample).returning().get();
}

export async function deleteTrainingSample(db: DrizzleD1Database<any>, sampleId: string, clientId: string) {
    return await db
        .delete(training_samples)
        .where(and(
            eq(training_samples.id, sampleId),
            eq(training_samples.client_id, clientId)
        ))
        .run();
}

export async function getTrainingSampleStats(db: DrizzleD1Database<any>, clientId: string) {
    // D1 doesn't support complex aggregate objects easily in one go with raw SQL builder in Drizzle 
    // without some mapToDriverValue magic, so we might need individual queries or a raw sql run.
    // But we can try to use the query builder for cleaner code.
    
    const stats = await db.run(sql`
        SELECT
            COUNT(*) as total_samples,
            SUM(word_count) as total_words,
            AVG(quality_score) as avg_quality,
            COUNT(CASE WHEN status = 'analyzed' THEN 1 END) as analyzed_count,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
            COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_count,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
        FROM training_samples
        WHERE client_id = ${clientId}
    `);

    // D1 result structure
    return stats.results[0] as {
        total_samples: number;
        total_words: number;
        avg_quality: number | null;
        analyzed_count: number;
        pending_count: number;
        processing_count: number;
        failed_count: number;
    };
}

export async function getAnalyzedTrainingSamples(db: DrizzleD1Database<any>, clientId: string, limit: number = 50) {
    return await db
        .select()
        .from(training_samples)
        .where(and(
            eq(training_samples.client_id, clientId),
            eq(training_samples.status, 'analyzed')
        ))
        .orderBy(desc(training_samples.created_at))
        .limit(limit)
        .all();
}

export async function getTrainingSamplesWithExtractedText(db: DrizzleD1Database<any>, clientId: string, limit: number = 50) {
    // Drizzle doesn't have "IS NOT NULL" and "!= ''" helpers directly chainable easily in all versions, 
    // but we can use sql operator
    return await db
        .select()
        .from(training_samples)
        .where(and(
            eq(training_samples.client_id, clientId),
            sql`extracted_text IS NOT NULL`,
            sql`extracted_text != ''`
        ))
        .orderBy(desc(training_samples.created_at))
        .limit(limit)
        .all();
}

// === Brand DNA ===

export async function getBrandDNA(db: DrizzleD1Database<any>, clientId: string) {
    return await db
        .select()
        .from(brand_dna)
        .where(eq(brand_dna.client_id, clientId))
        .get();
}

export async function getLastVoiceRecordingTime(db: DrizzleD1Database<any>, clientId: string) {
    const result = await db
        .select({ last_voice_recording_at: brand_dna.last_voice_recording_at })
        .from(brand_dna)
        .where(eq(brand_dna.client_id, clientId))
        .get();
    return result;
}

export async function upsertBrandDNA(db: DrizzleD1Database<any>, dna: typeof brand_dna.$inferInsert) {
    return await db.insert(brand_dna).values(dna)
        .onConflictDoUpdate({
            target: brand_dna.client_id,
            set: {
                strength_score: sql`MAX(brand_dna.strength_score, excluded.strength_score)`,
                voice_entities: sql`excluded.voice_entities`,
                last_voice_recording_at: sql`excluded.last_voice_recording_at`,
                calibration_source: sql`excluded.calibration_source`,
                updated_at: sql`excluded.updated_at`,
                // Add other fields that might be updated
                tone_profile: sql`excluded.tone_profile`,
                signature_patterns: sql`excluded.signature_patterns`,
                topics_to_avoid: sql`excluded.topics_to_avoid`,
                primary_tone: sql`excluded.primary_tone`,
                writing_style: sql`excluded.writing_style`,
                target_audience: sql`excluded.target_audience`,
                last_calibration_at: sql`excluded.last_calibration_at`,
                sample_count: sql`excluded.sample_count`
            }
        })
        .run();
}

export async function updateBrandDNAEntities(
    db: DrizzleD1Database<any>, 
    clientId: string, 
    entities: string, 
    calibrationSource: string = 'manual'
) {
    return await db
        .update(brand_dna)
        .set({
            voice_entities: entities,
            updated_at: new Date(),
            calibration_source: calibrationSource
        })
        .where(eq(brand_dna.client_id, clientId))
        .run();
}

// === Brand DNA Snapshots ===

export async function getLatestBrandDNASnapshot(db: DrizzleD1Database<any>, clientId: string) {
    return await db
        .select({
            voice_markers: brand_dna_snapshots.voice_markers,
            banned_words: brand_dna_snapshots.banned_words,
            stances: brand_dna_snapshots.stances,
            primary_tone: brand_dna_snapshots.primary_tone
        })
        .from(brand_dna_snapshots)
        .where(eq(brand_dna_snapshots.client_id, clientId))
        .orderBy(desc(brand_dna_snapshots.created_at))
        .limit(1)
        .get();
}

export async function createBrandDNASnapshot(
    db: DrizzleD1Database<any>, 
    snapshot: typeof brand_dna_snapshots.$inferInsert
) {
    return await db.insert(brand_dna_snapshots).values(snapshot).run();
}

// === Clients ===

export async function getClientDriftThreshold(db: DrizzleD1Database<any>, clientId: string) {
    const result = await db
        .select({ drift_threshold: clients.drift_threshold }) // Assuming drift_threshold exists on clients table based on previous code reading
        .from(clients)
        .where(eq(clients.id, clientId))
        .get();
    return result;
}
