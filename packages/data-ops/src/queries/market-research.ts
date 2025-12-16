/**
 * Market Research Queries
 *
 * Core database queries for project and research management.
 * Used by the frontend tRPC router.
 */

import { eq, desc } from 'drizzle-orm';
import {
    projects,
    haloAnalysis,
    competitors,
    dreamBuyerAvatar,
    researchSources,
    workflowRuns
} from '../schema';
import { nanoid } from 'nanoid';
import { DrizzleD1Database } from "drizzle-orm/d1";

type Db = DrizzleD1Database<any>;

// ============================================
// PROJECT MANAGEMENT
// ============================================

export const createProject = async (db: Db, userId: string, name: string) => {
    const projectId = nanoid();
    await db.insert(projects).values({
        id: projectId,
        accountId: userId,
        name,
        industry: '',
        status: 'research',
    });
    return projectId;
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

// ============================================
// RESEARCH DATA RETRIEVAL
// ============================================

export const getMarketResearch = async (db: Db, projectId: string) => {
    console.log(`[getMarketResearch] Fetching for projectId: ${projectId}`);

    try {
        const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
        if (!project) {
            console.error(`[getMarketResearch] Project not found: ${projectId}`);
            return {
                status: 'idle',
                topic: 'Project Not Found',
                competitors: [],
                painPoints: [],
                desires: [],
                unexpectedInsights: [],
                barriers: [],
                rawAnalysis: '',
                sources: [],
                avatar: null
            };
        }

        const avatar = await db.select().from(dreamBuyerAvatar).where(eq(dreamBuyerAvatar.projectId, projectId)).get();

        let sources: any[] = [];
        try {
            sources = await db.select().from(researchSources).where(eq(researchSources.projectId, projectId)).orderBy(desc(researchSources.sophisticationScore)).limit(50);
        } catch (e) {
            console.error("Error fetching sources", e);
        }

        const workflow = await db.select().from(workflowRuns).where(eq(workflowRuns.projectId, projectId)).orderBy(desc(workflowRuns.startedAt)).limit(1).get();

        let analysis = null;
        try {
            analysis = await db.select().from(haloAnalysis).where(eq(haloAnalysis.projectId, projectId)).get();
        } catch (e) {
            console.error("[getMarketResearch] Analysis fetch failed:", e);
        }

        const comps = await db.select().from(competitors).where(eq(competitors.projectId, projectId));

        return {
            status: workflow?.status || project?.status || 'idle',
            topic: project?.industry || project?.name || 'Market Research',
            competitors: comps ? comps.map(c => c.name) : [],
            painPoints: analysis?.painsAndFears ? JSON.parse(analysis.painsAndFears) : [],
            desires: analysis?.primalDesires ? JSON.parse(analysis.primalDesires) : (analysis?.hopesAndDreams ? JSON.parse(analysis.hopesAndDreams) : []),
            unexpectedInsights: analysis?.unexpectedInsights ? JSON.parse(analysis.unexpectedInsights) : [],
            barriers: analysis?.barriersAndUncertainties ? JSON.parse(analysis.barriersAndUncertainties) : [],
            vernacular: analysis?.vernacular ? JSON.parse(analysis.vernacular) : {},
            dominantEmotion: 'Frustration',
            avatar: avatar ? {
                name: avatar.summaryParagraph || project?.targetMarket || "Target Audience",
                demographics: avatar.demographics ? JSON.parse(avatar.demographics) : {},
                psychographics: avatar.psychographics ? JSON.parse(avatar.psychographics) : {},
                summary: avatar.summaryParagraph
            } : null,
            sources: sources ? sources.map(s => ({
                id: s.id,
                sourceType: s.sourceType,
                sourceUrl: s.sourceUrl,
                sophisticationScore: s.sophisticationScore,
                sophisticationClass: s.sophisticationClass,
                snippet: s.rawContent ? s.rawContent.slice(0, 150) + '...' : '',
                fullContent: s.rawContent || ''
            })) : [],
            rawAnalysis: '',
        };
    } catch (e: any) {
        console.error(`[getMarketResearch] CRITICAL ERROR:`, e);
        return {
            status: 'failed',
            topic: `Backend Error: ${e.message}`,
            competitors: [],
            painPoints: [],
            desires: [],
            unexpectedInsights: [],
            barriers: [],
            rawAnalysis: '',
            sources: [],
            avatar: null
        };
    }
};

// ============================================
// RESEARCH SOURCES
// ============================================

export const getResearchSources = async (db: Db, projectId: string) => {
    const sources = await db.select({
        id: researchSources.id,
        sourceType: researchSources.sourceType,
        sourceUrl: researchSources.sourceUrl,
        rawContent: researchSources.rawContent,
        sophisticationClass: researchSources.sophisticationClass,
        sophisticationScore: researchSources.sophisticationScore,
        isExcluded: researchSources.isExcluded,
    })
        .from(researchSources)
        .where(eq(researchSources.projectId, projectId))
        .orderBy(desc(researchSources.sophisticationScore))
        .limit(50);

    return sources.map(s => ({
        ...s,
        snippet: s.rawContent ? s.rawContent.slice(0, 100) + (s.rawContent.length > 100 ? '...' : '') : '',
    }));
};
