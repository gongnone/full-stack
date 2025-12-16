/**
 * Halo Research V2 - Multi-Phase Orchestration
 *
 * This is the new 6-phase research workflow based on Sabri Suby's Quantum Growth methodology.
 * Each phase is a separate step that can retry independently.
 *
 * Phases:
 * 1. Discovery - Find watering holes
 * 2. Listening - Extract verbatim content
 * 3. Classification - Categorize content
 * 4. Avatar - Build Dream Buyer Avatar
 * 5. Problem - Identify hair-on-fire problem
 * 6. HVCO - Generate title variants
 */

import {
    runDiscoveryAgent,
    runListeningAgent,
    runClassificationAgent,
    runAvatarAgent,
    runProblemAgent,
    runHVCOAgent,
    type AgentEnv,
    type AgentContext,
    type DiscoveryResult,
    type ListeningResult,
    type ClassificationResult,
    type AvatarSynthesisResult,
    type ProblemIdentificationResult,
    type HVCOGenerationResult,
    type CompleteHaloResearch
} from '../agents';

/**
 * Quality score calculation
 */
function calculateQualityScore(
    discovery: DiscoveryResult,
    listening: ListeningResult,
    classification: ClassificationResult,
    avatar: AvatarSynthesisResult,
    problems: ProblemIdentificationResult,
    hvco: HVCOGenerationResult
): number {
    let score = 0;
    let maxScore = 0;

    // Discovery quality (max 15 points)
    maxScore += 15;
    score += Math.min(15, discovery.wateringHoles.length);

    // Listening quality (max 20 points)
    maxScore += 20;
    const verbatimCount = listening.rawExtracts.reduce(
        (sum, e) => sum + e.verbatimQuotes.length, 0
    );
    score += Math.min(20, verbatimCount);

    // Classification quality (max 15 points)
    maxScore += 15;
    const avgConfidence = classification.classifiedContent.reduce(
        (sum, c) => sum + c.confidence, 0
    ) / Math.max(1, classification.classifiedContent.length);
    score += Math.round(avgConfidence * 0.15);

    // Avatar quality (max 20 points)
    maxScore += 20;
    score += avatar.dimensionsCovered * 2; // 2 points per dimension (max 18)
    score += avatar.avatar.dimensions.vernacular.length > 5 ? 2 : 0;

    // Problem quality (max 15 points)
    maxScore += 15;
    score += Math.min(10, problems.primaryProblem.evidenceQuotes.length * 3);
    score += problems.primaryProblem.totalScore > 70 ? 5 : 0;

    // HVCO quality (max 15 points)
    maxScore += 15;
    score += Math.min(10, hvco.titles.length);
    score += hvco.recommendedTitle.totalScore > 75 ? 5 : 0;

    return Math.round((score / maxScore) * 100);
}

/**
 * Run the complete 6-phase Halo Research workflow
 *
 * This function is designed to be called from a Cloudflare Workflow
 * where each phase is wrapped in a step.do() call.
 */
export async function runHaloResearchV2(
    env: AgentEnv,
    context: AgentContext
): Promise<CompleteHaloResearch> {
    console.log(`[HaloResearch V2] Starting multi-phase research for: ${context.topic}`);
    console.log(`[HaloResearch V2] Project: ${context.projectId}, Run: ${context.runId}`);

    // ========================================
    // PHASE 1: DISCOVERY
    // ========================================
    console.log(`[HaloResearch V2] === PHASE 1: DISCOVERY ===`);
    const discovery = await runDiscoveryAgent(env, context);
    console.log(`[HaloResearch V2] Found ${discovery.wateringHoles.length} watering holes`);

    // ========================================
    // PHASE 2: DEEP LISTENING
    // ========================================
    console.log(`[HaloResearch V2] === PHASE 2: DEEP LISTENING ===`);
    const listening = await runListeningAgent(env, discovery);
    console.log(`[HaloResearch V2] Extracted ${listening.rawExtracts.length} content pieces`);

    // ========================================
    // PHASE 3: CLASSIFICATION
    // ========================================
    console.log(`[HaloResearch V2] === PHASE 3: CLASSIFICATION ===`);
    const classification = await runClassificationAgent(env, listening);
    console.log(`[HaloResearch V2] Classified ${classification.classifiedContent.length} items`);

    // ========================================
    // PHASE 4: AVATAR SYNTHESIS
    // ========================================
    console.log(`[HaloResearch V2] === PHASE 4: AVATAR SYNTHESIS ===`);
    const avatar = await runAvatarAgent(env, context, classification, listening);
    console.log(`[HaloResearch V2] Created avatar: "${avatar.avatar.name}"`);

    // ========================================
    // PHASE 5: PROBLEM IDENTIFICATION
    // ========================================
    console.log(`[HaloResearch V2] === PHASE 5: PROBLEM IDENTIFICATION ===`);
    const problems = await runProblemAgent(env, context, avatar, classification, listening);
    console.log(`[HaloResearch V2] Primary problem: "${problems.primaryProblem.problem.slice(0, 50)}..."`);

    // ========================================
    // PHASE 6: HVCO GENERATION
    // ========================================
    console.log(`[HaloResearch V2] === PHASE 6: HVCO GENERATION ===`);
    const hvco = await runHVCOAgent(env, context, problems, avatar);
    console.log(`[HaloResearch V2] Generated ${hvco.titles.length} titles`);

    // ========================================
    // CALCULATE QUALITY SCORE
    // ========================================
    const qualityScore = calculateQualityScore(
        discovery, listening, classification, avatar, problems, hvco
    );
    console.log(`[HaloResearch V2] Quality score: ${qualityScore}/100`);

    // ========================================
    // COMPILE RESULTS
    // ========================================
    const result: CompleteHaloResearch = {
        projectId: context.projectId,
        runId: context.runId,
        topic: context.topic,
        discovery,
        listening,
        classification,
        avatar,
        problems,
        hvco,
        status: qualityScore >= 50 ? 'complete' : 'partial',
        completedAt: new Date().toISOString(),
        qualityScore
    };

    console.log(`[HaloResearch V2] Research complete. Status: ${result.status}`);
    return result;
}

/**
 * Legacy-compatible wrapper that returns the old format
 *
 * This allows gradual migration - existing code can still use the old interface
 */
export async function runHaloResearchV2Legacy(
    topic: string,
    aiClient: any,
    apiKey: string,
    context?: { targetAudience?: string; productDescription?: string },
    projectId?: string,
    runId?: string
): Promise<{
    avatar: {
        name: string;
        demographics: string;
        psychographics: string;
    };
    painPoints: string[];
    competitorGaps: string[];
    marketDesire: string;
    verbatimQuotes: string[];
    sources: {
        url: string;
        title: string;
        content: string;
    }[];
}> {
    const env: AgentEnv = {
        AI: aiClient,
        TAVILY_API_KEY: apiKey,
        DB: null // Not used in this legacy wrapper
    };

    const agentContext: AgentContext = {
        topic,
        targetAudience: context?.targetAudience,
        productDescription: context?.productDescription,
        projectId: projectId || 'legacy',
        runId: runId || 'legacy'
    };

    const result = await runHaloResearchV2(env, agentContext);

    // Transform to legacy format
    return {
        avatar: {
            name: result.avatar.avatar.name,
            demographics: JSON.stringify(result.avatar.avatar.demographics),
            psychographics: result.avatar.avatar.psychographics
        },
        painPoints: result.avatar.avatar.dimensions.frustrations,
        competitorGaps: result.problems.secondaryProblems.map(p => p.problem),
        marketDesire: result.problems.primaryProblem.hvcoOpportunity,
        verbatimQuotes: result.avatar.avatar.dimensions.vernacular.map(v => v.phrase),
        sources: result.listening.rawExtracts.map(e => ({
            url: e.source.url,
            title: e.source.title,
            content: e.content.slice(0, 500)
        }))
    };
}
