/**
 * Market Research V2 - Database Queries
 *
 * Handles saving and retrieving data from the 6-phase Halo Research workflow.
 */

import { eq, desc } from 'drizzle-orm';
import {
    projects,
    haloAnalysis,
    dreamBuyerAvatar,
    researchSources,
    workflowRuns,
    hvcoTitles
} from '../schema';
import { nanoid } from 'nanoid';
import { DrizzleD1Database } from "drizzle-orm/d1";
import type {
    DiscoveryResult,
    ListeningResult,
    ClassificationResult,
    AvatarSynthesisResult,
    ProblemIdentificationResult,
    HVCOGenerationResult
} from '../zod/halo-schema-v2';

type Db = DrizzleD1Database<any>;

/**
 * Save complete Halo Research V2 results
 */
export async function saveHaloResearchV2(
    db: Db,
    projectId: string,
    runId: string,
    data: {
        discovery: DiscoveryResult;
        listening: ListeningResult;
        classification: ClassificationResult;
        avatar: AvatarSynthesisResult;
        problems: ProblemIdentificationResult;
        hvco: HVCOGenerationResult;
        topic: string;
        qualityScore: number;
    }
) {
    console.log(`[DB V2] Saving research results for project ${projectId}`);

    // 1. Update Project Status
    await db.update(projects)
        .set({
            status: 'complete',
            targetMarket: data.avatar.avatar.name,
            industry: data.topic
        })
        .where(eq(projects.id, projectId));

    // 2. Update Workflow Run Status
    await db.update(workflowRuns)
        .set({
            status: 'complete',
            currentStep: 'complete',
            completedAt: new Date()
        })
        .where(eq(workflowRuns.id, runId));

    // 3. Save Halo Analysis
    await db.insert(haloAnalysis).values({
        id: nanoid(),
        projectId: projectId,
        hopesAndDreams: JSON.stringify(data.avatar.avatar.dimensions.hopesAndDreams),
        painsAndFears: JSON.stringify(data.avatar.avatar.dimensions.frustrations),
        barriersAndUncertainties: JSON.stringify(data.avatar.avatar.dimensions.deepestFears),
        vernacular: JSON.stringify(data.avatar.avatar.dimensions.vernacular),
        unexpectedInsights: JSON.stringify(
            data.classification.classifiedContent
                .filter(c => c.category === 'unexpected_insights')
                .map(c => c.extractId)
        ),
        primalDesires: JSON.stringify([data.problems.primaryProblem.hvcoOpportunity]),
    } as any);

    // 4. Save Dream Buyer Avatar with all 9 dimensions
    await db.insert(dreamBuyerAvatar).values({
        id: nanoid(),
        projectId: projectId,
        summaryParagraph: data.avatar.avatar.name,
        demographics: JSON.stringify(data.avatar.avatar.demographics),
        psychographics: JSON.stringify({
            ...data.avatar.avatar.dimensions,
            summary: data.avatar.avatar.psychographics,
            dominantEmotion: data.avatar.avatar.dominantEmotion
        }),
        dayInTheLife: data.avatar.avatar.dimensions.dayInLife,
        mediaConsumption: JSON.stringify(data.avatar.avatar.dimensions.informationSources),
        buyingBehavior: JSON.stringify({
            communicationPrefs: data.avatar.avatar.dimensions.communicationPrefs,
            happinessTriggers: data.avatar.avatar.dimensions.happinessTriggers
        })
    });

    // 5. Save Research Sources with classification
    const sourcesToSave = data.listening.rawExtracts.map(extract => {
        // Find classification for this extract
        const classification = data.classification.classifiedContent.find(
            c => c.extractId === extract.id
        );

        return {
            id: nanoid(),
            projectId: projectId,
            sourceType: extract.source.platform,
            sourceUrl: extract.source.url,
            rawContent: extract.content,
            sophisticationClass: classification?.sophisticationLevel?.charAt(0).toUpperCase() || 'B',
            sophisticationScore: classification?.confidence || 50,
            status: 'complete',
            metadata: JSON.stringify({
                title: extract.source.title,
                emotionalTone: extract.emotionalTone,
                verbatimQuotes: extract.verbatimQuotes,
                awarenessLevel: classification?.awarenessLevel,
                category: classification?.category,
                engagement: extract.engagement
            }),
            createdAt: new Date()
        };
    });

    // Insert sources in batches
    for (const source of sourcesToSave) {
        await db.insert(researchSources).values(source as any);
    }

    // 6. Save HVCO Titles
    for (let i = 0; i < data.hvco.titles.length; i++) {
        const title = data.hvco.titles[i];
        const isWinner = title.title === data.hvco.recommendedTitle.title;

        await db.insert(hvcoTitles).values({
            id: nanoid(),
            projectId: projectId,
            title: title.title,
            formula: title.formula,
            criticScore: title.totalScore,
            criticFeedback: JSON.stringify({
                intrigueScore: title.intrigueScore,
                benefitScore: title.benefitScore,
                specificityScore: title.specificityScore,
                rationale: isWinner ? data.hvco.rationale : null
            }),
            iteration: 1,
            isWinner: isWinner
        } as any);
    }

    console.log(`[DB V2] Saved: ${sourcesToSave.length} sources, ${data.hvco.titles.length} HVCO titles`);

    return true;
}

/**
 * Get Market Research V2 (Enhanced version with all data)
 */
export async function getMarketResearchV2(db: Db, projectId: string) {
    console.log(`[getMarketResearchV2] Fetching for projectId: ${projectId}`);

    try {
        const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
        if (!project) {
            console.error(`[getMarketResearchV2] Project not found: ${projectId}`);
            return null;
        }

        const avatar = await db.select().from(dreamBuyerAvatar).where(eq(dreamBuyerAvatar.projectId, projectId)).get();
        const analysis = await db.select().from(haloAnalysis).where(eq(haloAnalysis.projectId, projectId)).get();
        const sources = await db.select().from(researchSources).where(eq(researchSources.projectId, projectId)).orderBy(desc(researchSources.sophisticationScore)).limit(50);
        const titles = await db.select().from(hvcoTitles).where(eq(hvcoTitles.projectId, projectId)).orderBy(desc(hvcoTitles.criticScore)).limit(20);
        const workflow = await db.select().from(workflowRuns).where(eq(workflowRuns.projectId, projectId)).orderBy(desc(workflowRuns.startedAt)).limit(1).get();

        // Parse stored JSON data
        const demographics = avatar?.demographics ? JSON.parse(avatar.demographics) : {};
        const psychographics = avatar?.psychographics ? JSON.parse(avatar.psychographics) : {};
        const vernacular = analysis?.vernacular ? JSON.parse(analysis.vernacular) : [];
        const painsAndFears = analysis?.painsAndFears ? JSON.parse(analysis.painsAndFears) : [];
        const hopesAndDreams = analysis?.hopesAndDreams ? JSON.parse(analysis.hopesAndDreams) : [];
        const barriers = analysis?.barriersAndUncertainties ? JSON.parse(analysis.barriersAndUncertainties) : [];

        return {
            status: workflow?.status || project?.status || 'idle',
            progress: workflow?.currentStep || 'unknown',
            topic: project?.industry || project?.name || 'Market Research',

            // Avatar (9 Dimensions)
            avatar: avatar ? {
                name: avatar.summaryParagraph || project?.targetMarket || "Target Audience",
                demographics,
                psychographics: psychographics.summary || '',
                dimensions: {
                    wateringHoles: psychographics.wateringHoles || [],
                    informationSources: avatar.mediaConsumption ? JSON.parse(avatar.mediaConsumption) : [],
                    frustrations: painsAndFears,
                    hopesAndDreams,
                    deepestFears: barriers,
                    communicationPrefs: psychographics.communicationPrefs || [],
                    vernacular: vernacular,
                    dayInLife: avatar.dayInTheLife || '',
                    happinessTriggers: psychographics.happinessTriggers || []
                },
                dominantEmotion: psychographics.dominantEmotion || 'frustrated'
            } : null,

            // Analysis
            painPoints: painsAndFears,
            desires: hopesAndDreams,
            barriers,
            vernacular: vernacular.map((v: any) => typeof v === 'string' ? { phrase: v, source: '', context: '' } : v),
            unexpectedInsights: analysis?.unexpectedInsights ? JSON.parse(analysis.unexpectedInsights) : [],

            // Sources with classification
            sources: sources.map(s => {
                const metadata = s.metadata ? JSON.parse(s.metadata) : {};
                return {
                    id: s.id,
                    sourceType: s.sourceType,
                    sourceUrl: s.sourceUrl,
                    sophisticationLevel: s.sophisticationClass === 'A' ? 'advanced' :
                        s.sophisticationClass === 'B' ? 'intermediate' : 'newbie',
                    sophisticationScore: s.sophisticationScore,
                    awarenessLevel: metadata.awarenessLevel,
                    category: metadata.category,
                    emotionalTone: metadata.emotionalTone,
                    verbatimQuotes: metadata.verbatimQuotes || [],
                    snippet: s.rawContent ? s.rawContent.slice(0, 150) + '...' : '',
                    fullContent: s.rawContent || ''
                };
            }),

            // HVCO Titles
            hvcoTitles: titles.map(t => {
                const feedback = t.criticFeedback ? JSON.parse(t.criticFeedback) : {};
                return {
                    id: t.id,
                    title: t.title,
                    formula: t.formula,
                    totalScore: t.criticScore,
                    intrigueScore: feedback.intrigueScore,
                    benefitScore: feedback.benefitScore,
                    specificityScore: feedback.specificityScore,
                    isWinner: t.isWinner,
                    rationale: feedback.rationale
                };
            }),
            recommendedTitle: titles.find(t => t.isWinner)?.title || titles[0]?.title || ''
        };
    } catch (e: any) {
        console.error(`[getMarketResearchV2] CRITICAL ERROR:`, e);
        return null;
    }
}

/**
 * Get Research Quality Metrics
 */
export async function getResearchQualityMetrics(db: Db, projectId: string) {
    const sources = await db.select().from(researchSources).where(eq(researchSources.projectId, projectId));
    const avatar = await db.select().from(dreamBuyerAvatar).where(eq(dreamBuyerAvatar.projectId, projectId)).get();
    const titles = await db.select().from(hvcoTitles).where(eq(hvcoTitles.projectId, projectId));
    const analysis = await db.select().from(haloAnalysis).where(eq(haloAnalysis.projectId, projectId)).get();

    // Count verbatim quotes
    let verbatimCount = 0;
    sources.forEach(s => {
        const metadata = s.metadata ? JSON.parse(s.metadata) : {};
        verbatimCount += (metadata.verbatimQuotes || []).length;
    });

    // Count avatar dimensions
    let dimensionsCovered = 0;
    if (avatar) {
        const psychographics = avatar.psychographics ? JSON.parse(avatar.psychographics) : {};
        if (psychographics.wateringHoles?.length > 0) dimensionsCovered++;
        if (avatar.mediaConsumption && JSON.parse(avatar.mediaConsumption).length > 0) dimensionsCovered++;
        if (analysis?.painsAndFears && JSON.parse(analysis.painsAndFears).length > 0) dimensionsCovered++;
        if (analysis?.hopesAndDreams && JSON.parse(analysis.hopesAndDreams).length > 0) dimensionsCovered++;
        if (analysis?.barriersAndUncertainties && JSON.parse(analysis.barriersAndUncertainties).length > 0) dimensionsCovered++;
        if (psychographics.communicationPrefs?.length > 0) dimensionsCovered++;
        if (analysis?.vernacular && JSON.parse(analysis.vernacular).length > 0) dimensionsCovered++;
        if (avatar.dayInTheLife && avatar.dayInTheLife.length > 50) dimensionsCovered++;
        if (psychographics.happinessTriggers?.length > 0) dimensionsCovered++;
    }

    return {
        sourcesAnalyzed: sources.length,
        verbatimQuotes: verbatimCount,
        dimensionsCovered,
        hvcoTitles: titles.length,
        hasWinnerTitle: titles.some(t => t.isWinner),
        qualityGrade: dimensionsCovered >= 7 ? 'A' :
            dimensionsCovered >= 5 ? 'B' :
                dimensionsCovered >= 3 ? 'C' : 'D'
    };
}
