interface Env {
    KNOWLEDGE_BASE: VectorizeIndex;
    AI: any;
}

export async function embedText(text: string, ai: any) {
    const response = await ai.run('@cf/baai/bge-base-en-v1.5', {
        text: text,
    });
    return response.data[0];
}

export async function searchKnowledge(query: string, env: Env, phaseTag?: string): Promise<string> {
    // 1. Generate embedding
    const embedding = await embedText(query, env.AI);

    // 2. Query Vectorize
    const queryOptions: any = {
        topK: 3,
        returnMetadata: true
    };

    // 3. Filter by phase if provided
    // Assuming metadata has 'phase' field to filter on
    if (phaseTag) {
        // Use direct property match for metadata filtering
        queryOptions.filter = {
            phase: phaseTag
        };
    }

    const matches = await env.KNOWLEDGE_BASE.query(embedding, queryOptions);

    // 4. Return top 3 chunks as string
    const texts = matches.matches
        .map(match => (match.metadata as any)?.text)
        .filter(text => text !== undefined && text !== null);

    return texts.join("\n\n");
}

export async function upsertKnowledge(env: Env, items: { text: string, phase: string, source: string }[]) {
    // 1. Generate embeddings for all items
    // Note: In a production app, do this in batches if many items.
    // Workers AI can handle batches, but let's do one by one for simplicity/safety or small batch.
    const vectors: VectorizeVector[] = [];

    for (const item of items) {
        const embedding = await embedText(item.text, env.AI);
        vectors.push({
            id: crypto.randomUUID(),
            values: embedding,
            metadata: {
                text: item.text,
                phase: item.phase,
                source: item.source
            }
        });
    }

    // 2. Upsert to Vectorize
    // Vectorize supports batches of up to 1000
    if (vectors.length > 0) {
        await env.KNOWLEDGE_BASE.upsert(vectors);
    }
    return vectors.length;
}
