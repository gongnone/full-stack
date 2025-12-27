/**
 * Halo Research V2 - Zod Validation Schemas
 *
 * These schemas validate the output from the 6-phase agent system.
 */

import { z } from "zod";

// ============================================
// PHASE 1: DISCOVERY
// ============================================

export const WateringHoleSchema = z.object({
    platform: z.enum(['reddit', 'youtube', 'facebook', 'quora', 'forum', 'amazon_book', 'other']),
    url: z.string(),
    name: z.string(),
    relevanceScore: z.number().min(0).max(100),
    estimatedAudience: z.string(),
    sampleTopics: z.array(z.string())
});

export const DiscoveryResultSchema = z.object({
    wateringHoles: z.array(WateringHoleSchema),
    searchQueriesUsed: z.array(z.string()),
    timestamp: z.string()
});

// ============================================
// PHASE 2: DEEP LISTENING
// ============================================

export const ContentSourceSchema = z.object({
    url: z.string(),
    platform: z.string(),
    title: z.string()
});

export const RawExtractSchema = z.object({
    id: z.string(),
    source: ContentSourceSchema,
    content: z.string(),
    verbatimQuotes: z.array(z.string()),
    emotionalTone: z.string(),
    engagement: z.object({
        upvotes: z.number().optional(),
        comments: z.number().optional(),
        shares: z.number().optional()
    })
});

export const ListeningResultSchema = z.object({
    rawExtracts: z.array(RawExtractSchema),
    totalSourcesAnalyzed: z.number(),
    timestamp: z.string()
});

// ============================================
// PHASE 3: CLASSIFICATION
// ============================================

export const SophisticationLevelSchema = z.enum(['newbie', 'intermediate', 'advanced']);
export const AwarenessLevelSchema = z.enum(['unaware', 'problem_aware', 'solution_aware', 'product_aware', 'most_aware']);
export const EmotionalStateSchema = z.enum(['frustrated', 'hopeful', 'fearful', 'confused', 'excited', 'skeptical']);
export const ContentCategorySchema = z.enum(['pains_fears', 'hopes_dreams', 'barriers_uncertainties', 'unexpected_insights']);

export const ClassifiedContentSchema = z.object({
    extractId: z.string(),
    sophisticationLevel: SophisticationLevelSchema,
    awarenessLevel: AwarenessLevelSchema,
    emotionalState: EmotionalStateSchema,
    category: ContentCategorySchema,
    confidence: z.number().min(0).max(100),
    reasoning: z.string()
});

export const ClassificationResultSchema = z.object({
    classifiedContent: z.array(ClassifiedContentSchema),
    distribution: z.object({
        bySophistication: z.record(z.number()),
        byAwareness: z.record(z.number()),
        byCategory: z.record(z.number())
    }),
    timestamp: z.string()
});

// ============================================
// PHASE 4: AVATAR SYNTHESIS
// ============================================

export const DemographicsSchema = z.object({
    age: z.string(),
    gender: z.string(),
    location: z.string(),
    income: z.string(),
    occupation: z.string(),
    education: z.string()
});

export const VernacularEntrySchema = z.object({
    phrase: z.string(),
    source: z.string(),
    context: z.string()
});

export const AvatarDimensionsSchema = z.object({
    wateringHoles: z.array(z.string()),
    informationSources: z.array(z.string()),
    frustrations: z.array(z.string()),
    hopesAndDreams: z.array(z.string()),
    deepestFears: z.array(z.string()),
    communicationPrefs: z.array(z.string()),
    vernacular: z.array(VernacularEntrySchema),
    dayInLife: z.object({
        wakeTime: z.string(),
        morningRoutine: z.string(),
        checkPhoneFirst: z.boolean(),
        commuteType: z.string(),
        peakStressTime: z.string(),
        downtime: z.string(),
        eveningRoutine: z.string(),
        bedTime: z.string(),
        bestContactTimes: z.array(z.string())
    }),
    competitorGapsTheyFeel: z.array(z.string()),
    happinessTriggers: z.array(z.string())
});

export const DreamBuyerAvatarSchema = z.object({
    name: z.string(),
    demographics: DemographicsSchema,
    dimensions: AvatarDimensionsSchema,
    psychographics: z.string(),
    dominantEmotion: EmotionalStateSchema
});

export const AvatarSynthesisResultSchema = z.object({
    avatar: DreamBuyerAvatarSchema,
    evidenceCount: z.number(),
    dimensionsCovered: z.number().min(0).max(9),
    timestamp: z.string()
});

// ============================================
// PHASE 5: PROBLEM IDENTIFICATION
// ============================================

export const EvidenceQuoteSchema = z.object({
    quote: z.string(),
    source: z.string()
});

export const HairOnFireProblemSchema = z.object({
    problem: z.string(),
    frequencyScore: z.number().min(0).max(100),
    intensityScore: z.number().min(0).max(100),
    totalScore: z.number().min(0).max(100),
    evidenceQuotes: z.array(EvidenceQuoteSchema),
    relatedPains: z.array(z.string()),
    hvcoOpportunity: z.string()
});

export const ProblemIdentificationResultSchema = z.object({
    primaryProblem: HairOnFireProblemSchema,
    secondaryProblems: z.array(HairOnFireProblemSchema),
    timestamp: z.string()
});

// ============================================
// PHASE 6: HVCO GENERATION
// ============================================

export const HVCOFormulaSchema = z.enum([
    'how_to_without',
    'number_ways',
    'mistakes_to_avoid',
    'secret_revealed',
    'ultimate_guide',
    'step_by_step',
    'checklist',
    'blueprint'
]);

export const HVCOTitleSchema = z.object({
    title: z.string(),
    formula: HVCOFormulaSchema,
    intrigueScore: z.number().min(0).max(100),
    benefitScore: z.number().min(0).max(100),
    specificityScore: z.number().min(0).max(100),
    totalScore: z.number().min(0).max(100)
});

export const HVCOGenerationResultSchema = z.object({
    titles: z.array(HVCOTitleSchema),
    recommendedTitle: HVCOTitleSchema,
    rationale: z.string(),
    timestamp: z.string()
});

// ============================================
// PHASE 1.5: COMPETITOR RECON
// ============================================

export const CompetitorOfferSchema = z.object({
    competitorName: z.string(),
    url: z.string(),
    hvco: z.string(), // Their lead magnet
    primaryOffer: z.object({
        name: z.string(),
        price: z.string(),
        promise: z.string()
    }),
    funnelSteps: z.array(z.string()),
    weaknesses: z.array(z.string())
});

export const CompetitorReconResultSchema = z.object({
    competitors: z.array(CompetitorOfferSchema),
    timestamp: z.string()
});

// ============================================
// COMPLETE RESEARCH RESULT
// ============================================

export const CompleteHaloResearchSchema = z.object({
    projectId: z.string(),
    runId: z.string(),
    topic: z.string(),
    discovery: DiscoveryResultSchema,
    competitorRecon: CompetitorReconResultSchema.optional(), // Phase 1.5
    listening: ListeningResultSchema,
    classification: ClassificationResultSchema,
    avatar: AvatarSynthesisResultSchema,
    problems: ProblemIdentificationResultSchema,
    hvco: HVCOGenerationResultSchema,
    status: z.enum(['complete', 'failed', 'partial']),
    completedAt: z.string(),
    qualityScore: z.number().min(0).max(100)
});

// ============================================
// TYPE EXPORTS
// ============================================

export type WateringHole = z.infer<typeof WateringHoleSchema>;
export type DiscoveryResult = z.infer<typeof DiscoveryResultSchema>;
export type RawExtract = z.infer<typeof RawExtractSchema>;
export type ListeningResult = z.infer<typeof ListeningResultSchema>;
export type ClassifiedContent = z.infer<typeof ClassifiedContentSchema>;
export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;
export type DreamBuyerAvatar = z.infer<typeof DreamBuyerAvatarSchema>;
export type AvatarSynthesisResult = z.infer<typeof AvatarSynthesisResultSchema>;
export type HairOnFireProblem = z.infer<typeof HairOnFireProblemSchema>;
export type ProblemIdentificationResult = z.infer<typeof ProblemIdentificationResultSchema>;
export type HVCOTitle = z.infer<typeof HVCOTitleSchema>;
export type HVCOGenerationResult = z.infer<typeof HVCOGenerationResultSchema>;
export type CompetitorReconResult = z.infer<typeof CompetitorReconResultSchema>;
export type CompleteHaloResearch = z.infer<typeof CompleteHaloResearchSchema>;

// Legacy compatibility alias
export const HaloResearchSchemaV2 = CompleteHaloResearchSchema;

// ============================================
// V1 COMPATIBILITY - For Frontend Display
// ============================================

/**
 * Simplified schema for frontend display compatibility.
 * Maps V2's rich data structure to the simpler V1 display format.
 */
export const HaloResearchSchema = z.object({
    avatar: z.object({
        name: z.string(),
        demographics: z.union([z.string(), z.record(z.any())]),
        psychographics: z.union([z.string(), z.record(z.any())]),
    }),
    painPoints: z.array(z.any()),
    competitorGaps: z.array(z.any()),
    marketDesire: z.string(),
    verbatimQuotes: z.array(z.any()),
    suggestedAngles: z.array(z.string()).optional(),
    sources: z.array(z.object({
        url: z.string(),
        title: z.string(),
        content: z.string()
    })).optional(),
    hvcoTitles: z.array(z.any()).optional(), // V2 Phase 6 Output
});

export type HaloResearchData = z.infer<typeof HaloResearchSchema>;
