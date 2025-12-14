import { DrizzleD1Database } from 'drizzle-orm/d1';
import { generatedContent, researchSources } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getGenerations(db: DrizzleD1Database<any>, projectId: string) {
    return await db.select({
        id: generatedContent.id,
        content: generatedContent.content,
        status: generatedContent.status,
        createdAt: generatedContent.createdAt,
        citedSourceId: generatedContent.citedSourceId,
        source: {
            id: researchSources.id,
            type: researchSources.sourceType,
            content: researchSources.rawContent,
            sophistication: researchSources.sophisticationClass,
            url: researchSources.sourceUrl,
            metadata: researchSources.metadata
        }
    })
        .from(generatedContent)
        .leftJoin(researchSources, eq(generatedContent.citedSourceId, researchSources.id))
        .where(eq(generatedContent.projectId, projectId))
        .orderBy(desc(generatedContent.createdAt))
        .all();
}
