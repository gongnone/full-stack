import { eq } from "drizzle-orm";
import { getDb } from "../db/database";
import { projects, marketResearch, offers, brandPillars, contentIdeas } from "../schema-app";
import { v4 as uuidv4 } from "uuid";

// ----------------------------------------------------------------------------
// PROJECT QUERIES
// ----------------------------------------------------------------------------

export async function createProject(userId: string, name: string) {
    const db = getDb();
    const projectId = uuidv4();

    await db.insert(projects).values({
        id: projectId,
        userId,
        name,
        status: "active",
    });

    return projectId;
}

export async function getProjects(userId: string) {
    const db = getDb();
    return await db.select().from(projects).where(eq(projects.userId, userId));
}

export async function getProject(projectId: string) {
    const db = getDb();
    const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    return result[0];
}

// ----------------------------------------------------------------------------
// MARKET RESEARCH QUERIES
// ----------------------------------------------------------------------------

export async function saveMarketResearch(data: {
    projectId: string;
    userId: string;
    topic: string;
    rawAnalysis: string;
    competitors?: string[];
    painPoints?: string[];
    desires?: string[];
}) {
    const db = getDb();
    const id = uuidv4();

    await db.insert(marketResearch).values({
        id,
        projectId: data.projectId,
        userId: data.userId,
        topic: data.topic,
        rawAnalysis: data.rawAnalysis,
        competitors: data.competitors ?? [],
        painPoints: data.painPoints ?? [],
        desires: data.desires ?? [],
    });

    return id;
}

export async function getMarketResearch(projectId: string) {
    const db = getDb();
    const result = await db
        .select()
        .from(marketResearch)
        .where(eq(marketResearch.projectId, projectId))
        .limit(1);
    return result[0];
}
