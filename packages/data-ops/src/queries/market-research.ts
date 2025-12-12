import { eq, desc } from 'drizzle-orm';
import { projects, haloAnalysis, competitors } from '../schema';
import { nanoid } from 'nanoid';
import { DrizzleD1Database } from "drizzle-orm/d1";

// Simple type for DB to avoid complex generics if not needed, or use DrizzleD1Database<any> like user.ts
type Db = DrizzleD1Database<any>;

export const createProject = async (db: Db, userId: string, name: string) => {
    const projectId = nanoid();
    await db.insert(projects).values({
        id: projectId,
        accountId: userId,
        name,
        industry: '', // Will be updated later
        status: 'research',
    });
    return projectId;
};

export const saveMarketResearch = async (db: Db, data: {
    projectId: string;
    userId: string;
    topic: string;
    rawAnalysis: string;
    competitors: string[];
    painPoints: string[];
    desires: string[];
}) => {
    // Determine industry/topic from input and update project
    await db.update(projects)
        .set({ industry: data.topic })
        .where(eq(projects.id, data.projectId));

    // Create placeholder analysis record
    const analysisId = nanoid();
    await db.insert(haloAnalysis).values({
        id: analysisId,
        projectId: data.projectId,
        painsAndFears: JSON.stringify(data.painPoints),
        primalDesires: JSON.stringify(data.desires),
        // Other fields left null/empty for now
    });

    // Save competitors if any
    for (const compName of data.competitors) {
        await db.insert(competitors).values({
            id: nanoid(),
            projectId: data.projectId,
            name: compName,
            status: 'identified',
        });
    }

    return true;
};

export const getProjects = async (db: Db, userId: string) => {
    return await db.select()
        .from(projects)
        .where(eq(projects.accountId, userId))
        .orderBy(desc(projects.createdAt));
};

export const getProject = async (db: Db, projectId: string) => {
    const result = await db.select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .get();
    return result;
};

export const getMarketResearch = async (db: Db, projectId: string) => {
    // Fetch analysis and competitors to aggregate into a research object
    const analysis = await db.select()
        .from(haloAnalysis)
        .where(eq(haloAnalysis.projectId, projectId))
        .get();

    const comps = await db.select()
        .from(competitors)
        .where(eq(competitors.projectId, projectId));

    // Also fetch avatar for desires/pain points if analysis is empty?
    // For now, construct the object expected by the frontend

    const project = await getProject(db, projectId);

    return {
        topic: project?.industry || '',
        competitors: comps.map(c => c.name),
        painPoints: analysis?.painsAndFears ? JSON.parse(analysis.painsAndFears) : [],
        desires: analysis?.primalDesires ? JSON.parse(analysis.primalDesires) : [],
        rawAnalysis: '', // Not strictly needed for the summary view
    };
};
