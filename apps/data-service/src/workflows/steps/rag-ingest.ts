import { initDatabase } from '@repo/data-ops/database';
import { vectorMetadata } from '@repo/data-ops/schema';
import { upsertKnowledge } from '@repo/agent-logic/rag'; // leveraging existing logic if compatible, or rewrite
import { Ai } from '@cloudflare/workers-types';

interface RagIngestItem {
    id: string; // Source ID
    content: string;
    metadata: Record<string, any>;
    projectId: string;
}

export async function ingestIntoRag(env: Env, items: RagIngestItem[]) {
    const vectors: VectorizeVector[] = [];
    const db = initDatabase(env.DB);
    const metadataRecords: any[] = [];

    if (items.length === 0) return { inserted: 0 };

    // 1. Generate Embeddings (Batch)
    // Workers AI has limits, better to do one by one or small batches for safety
    for (const item of items) {
        try {
            // Truncate to stay within embedding model limits if necessary (usually 512 tokens approx)
            const textToEmbed = item.content.substring(0, 1000);

            const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
                text: [textToEmbed]
            }) as { data: number[][] }; // Check actual return type

            const embedding = response.data[0];
            const vectorId = crypto.randomUUID();

            vectors.push({
                id: vectorId,
                values: embedding,
                metadata: {
                    ...item.metadata,
                    projectId: item.projectId,
                    sourceId: item.id
                }
            });

            metadataRecords.push({
                id: crypto.randomUUID(),
                projectId: item.projectId,
                vectorId: vectorId,
                sourceId: item.id,
                contentType: item.metadata.type || 'research',
                sophisticationClass: item.metadata.sophistication,
                createdAt: new Date()
            });

        } catch (err) {
            console.error(`Failed to embed item ${item.id}`, err);
        }
    }

    // 2. Upsert to Vectorize
    if (vectors.length > 0) {
        // In Stage, we might have a remote binding. 
        // Ensure KNOWLEDGE_BASE is the correct binding from wrangler.jsonc
        // Note: wrangler.jsonc has "KNOWLEDGE_BASE" and "VECTORIZE" bindings pointing to same index?
        // Let's use KNOWLEDGE_BASE as it seems more semantic in previous context.
        await env.KNOWLEDGE_BASE.upsert(vectors);
    }

    // 3. Save Metadata to DB
    if (metadataRecords.length > 0) {
        for (const record of metadataRecords) {
            await db.insert(vectorMetadata).values(record);
        }
    }

    return { inserted: vectors.length };
}

// Type definitions to satisfy TS if not globally available
interface VectorizeVector {
    id: string;
    values: number[];
    metadata?: Record<string, any>;
}
