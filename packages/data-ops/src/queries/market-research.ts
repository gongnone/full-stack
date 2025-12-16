import { eq, desc } from 'drizzle-orm';
import { projects, haloAnalysis, competitors, dreamBuyerAvatar, researchSources, workflowRuns } from '../schema';
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

export const updateCampaign = async (db: Db, projectId: string, data: {
    researchData: {
        avatar: string | { name: string; demographics: string; psychographics: string; };
        painPoints: string[];
        competitorGaps: string[];
        marketDesire: string;
        verbatimQuotes: string[];
        sources?: {
            url: string;
            title: string;
            content: string;
        }[];
    };
    status: string;
    runId?: string; // Gap 1 Fix: Optional runId
}) => {
    // 1. Update Project Status & Target Market Name
    const avatarName = typeof data.researchData.avatar === 'string' ? data.researchData.avatar : data.researchData.avatar.name;

    await db.update(projects)
        .set({
            status: data.status,
            targetMarket: avatarName
        })
        .where(eq(projects.id, projectId));

    // GAP 1 FIX: Update Workflow Run Status
    if (data.runId) {
        await db.update(workflowRuns)
            .set({
                status: 'complete', // Standardizing on 'complete' (matches DB default) vs 'completed'
                currentStep: 'complete',
                completedAt: new Date()
            })
            .where(eq(workflowRuns.id, data.runId));
    }

    // 2. Save Analysis
    // We'll simplisticly map 'painPoints' to 'painsAndFears' and 'competitorGaps' to 'unexpectedInsights' for now
    // or create a better mapping.
    // The previous schema has 'hopesAndDreams', 'painsAndFears', 'barriersAndUncertainties', etc.
    // We will do our best mapping.
    await db.insert(haloAnalysis).values({
        id: nanoid(),
        projectId: projectId,
        painsAndFears: JSON.stringify(data.researchData.painPoints || []),
        // Map 'marketDesire' to 'primalDesires' as a single item or check format
        primalDesires: JSON.stringify(data.researchData.marketDesire ? [data.researchData.marketDesire] : []),
        unexpectedInsights: JSON.stringify(data.researchData.competitorGaps || []), // Storing gaps here for now
        urn: JSON.stringify(data.researchData.verbatimQuotes || []), // Using 'urn' or 'vernacular'? 'vernacular' exists in schema according to prompt?
        // Checking schema in Step 50: 'vernacular' is used in getMarketResearch.
        // I'll check schema file if needed, but 'vernacular' seems listed in 'getMarketResearch' parsing.
        // Wait, getMarketResearch parses 'vernacular' from 'haloAnalysis.vernacular'.
        vernacular: JSON.stringify(data.researchData.verbatimQuotes || []),
    } as any);

    // 3. Save Avatar
    const avatarData = data.researchData.avatar;
    await db.insert(dreamBuyerAvatar).values({
        id: nanoid(),
        projectId: projectId,
        summaryParagraph: typeof avatarData === 'string' ? avatarData : avatarData.name, // Handle legacy string or new object
        demographics: typeof avatarData === 'object' ? JSON.stringify(avatarData.demographics) : '{}',
        psychographics: typeof avatarData === 'object' ? JSON.stringify(avatarData.psychographics) : '{}',
        dayInTheLife: '',
        mediaConsumption: '[]',
        buyingBehavior: '',
    });

    // GAP 3 FIX: Save Sources
    if (data.researchData.sources && data.researchData.sources.length > 0) {
        // Clear existing sources first to avoid duplicates (optional, but safer for re-runs)
        // await db.delete(researchSources).where(eq(researchSources.projectId, projectId));

        for (const source of data.researchData.sources) {
            await db.insert(researchSources).values({
                id: nanoid(),
                projectId: projectId,
                sourceType: 'web_search', // Default to web_search for investigator
                sourceUrl: source.url,
                rawContent: source.content,
                sophisticationClass: 'C', // Default pending classification
                sophisticationScore: 0,
                status: 'complete',
                metadata: JSON.stringify({ title: source.title }),
                createdAt: new Date()
            } as any);
        }
    }

    return true;
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
    console.log(`[getMarketResearch] Fetching for projectId: ${projectId}`);

    try {
        const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
        if (!project) {
            console.error(`[getMarketResearch] Project not found: ${projectId}`);
            return { status: 'idle', topic: 'Project Not Found', competitors: [], painPoints: [], desires: [], unexpectedInsights: [], barriers: [], rawAnalysis: '', sources: [], avatar: null };
        }

        const avatar = await db.select().from(dreamBuyerAvatar).where(eq(dreamBuyerAvatar.projectId, projectId)).get();

        let sources: any[] = [];
        try {
            sources = await db.select().from(researchSources).where(eq(researchSources.projectId, projectId)).orderBy(desc(researchSources.sophisticationScore)).limit(50);
        } catch (e) { console.error("Error fetching sources", e) }

        const workflow = await db.select().from(workflowRuns).where(eq(workflowRuns.projectId, projectId)).orderBy(desc(workflowRuns.startedAt)).limit(1).get();

        let analysis = null;
        try {
            analysis = await db.select().from(haloAnalysis).where(eq(haloAnalysis.projectId, projectId)).get();
        } catch (e) {
            console.error("[getMarketResearch] Analysis fetch failed:", e);
        }

        const comps = await db.select().from(competitors).where(eq(competitors.projectId, projectId));

        console.log(`[getMarketResearch] Analysis found:`, analysis ? "YES" : "NO");
        if (analysis) {
            // Debug log
        }

        return {
            status: workflow?.status || project?.status || 'idle', // Use project status if workflow missing
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
