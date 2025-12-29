/**
 * Brand DNA and Training Sample queries for Foundry Dashboard
 *
 * This is a local implementation replacing @repo/data-ops/queries/brand
 * to maintain architecture isolation between Foundry and Legacy systems.
 */
import { eq, desc, and, count, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { training_samples, brand_dna } from '../schema';
import type { TrainingSampleInsert } from '../schema';
import * as schema from '../schema';

// === Training Samples ===

export async function getTrainingSamples(
  db: DrizzleD1Database<typeof schema>,
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

export async function getTrainingSamplesCount(
  db: DrizzleD1Database<typeof schema>,
  clientId: string
) {
  const result = await db
    .select({ total: count() })
    .from(training_samples)
    .where(eq(training_samples.client_id, clientId))
    .get();

  return result?.total ?? 0;
}

export async function getTrainingSampleById(
  db: DrizzleD1Database<typeof schema>,
  sampleId: string,
  clientId: string
) {
  return await db
    .select()
    .from(training_samples)
    .where(
      and(
        eq(training_samples.id, sampleId),
        eq(training_samples.client_id, clientId)
      )
    )
    .get();
}

export async function createTrainingSample(
  db: DrizzleD1Database<typeof schema>,
  sample: TrainingSampleInsert
) {
  return await db.insert(training_samples).values(sample).returning().get();
}

export async function deleteTrainingSample(
  db: DrizzleD1Database<typeof schema>,
  sampleId: string,
  clientId: string
) {
  return await db
    .delete(training_samples)
    .where(
      and(
        eq(training_samples.id, sampleId),
        eq(training_samples.client_id, clientId)
      )
    )
    .run();
}

export async function getTrainingSampleStats(
  db: DrizzleD1Database<typeof schema>,
  clientId: string
) {
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

export async function getTrainingSamplesWithExtractedText(
  db: DrizzleD1Database<typeof schema>,
  clientId: string,
  limit: number = 50
) {
  return await db
    .select()
    .from(training_samples)
    .where(
      and(
        eq(training_samples.client_id, clientId),
        sql`extracted_text IS NOT NULL`,
        sql`extracted_text != ''`
      )
    )
    .orderBy(desc(training_samples.created_at))
    .limit(limit)
    .all();
}

// === Brand DNA ===

export async function getBrandDNA(
  db: DrizzleD1Database<typeof schema>,
  clientId: string
) {
  return await db
    .select()
    .from(brand_dna)
    .where(eq(brand_dna.client_id, clientId))
    .get();
}

export async function getLastVoiceRecordingTime(
  db: DrizzleD1Database<typeof schema>,
  clientId: string
) {
  const result = await db
    .select({ last_voice_recording_at: brand_dna.last_voice_recording_at })
    .from(brand_dna)
    .where(eq(brand_dna.client_id, clientId))
    .get();
  return result;
}

export async function updateBrandDNAEntities(
  db: DrizzleD1Database<typeof schema>,
  clientId: string,
  entities: string,
  calibrationSource: string = 'manual'
) {
  return await db
    .update(brand_dna)
    .set({
      voice_entities: entities,
      updated_at: sql`(unixepoch() * 1000)`,
      calibration_source: calibrationSource,
    })
    .where(eq(brand_dna.client_id, clientId))
    .run();
}