/**
 * Halo Research Multi-Phase Agent Types
 * Based on Sabri Suby's Quantum Growth Methodology
 */

// ============================================
// PHASE 1: DISCOVERY (Watering Hole Finder)
// ============================================

export interface WateringHole {
    platform: 'reddit' | 'youtube' | 'facebook' | 'quora' | 'forum' | 'amazon_book' | 'other';
    url: string;
    name: string;
    relevanceScore: number; // 0-100
    estimatedAudience: string;
    sampleTopics: string[];
}

export interface DiscoveryResult {
    wateringHoles: WateringHole[];
    searchQueriesUsed: string[];
export interface DiscoveryResult {
    wateringHoles: WateringHole[];
    searchQueriesUsed: string[];
    timestamp: string;
}

// ============================================
// PHASE 1.5: COMPETITOR RECON
// ============================================

export interface CompetitorOffer {
    competitorName: string;
    url: string;
    hvco: string;
    primaryOffer: {
        name: string;
        price: string;
        promise: string;
    };
    funnelSteps: string[];
    weaknesses: string[];
}

export interface CompetitorReconResult {
    competitors: CompetitorOffer[];
    timestamp: string;
}

// ============================================
// PHASE 2: DEEP LISTENING (Content Extraction)
// ============================================

export interface ContentSource {
    url: string;
    platform: string;
    title: string;
    reviewRating?: number;     // for Amazon 3-star analysis
    whatWasMissing?: string;   // Golden Gap
    reviewTitle?: string;
}

export interface RawExtract {
    id: string;
    source: ContentSource;
    content: string;
    verbatimQuotes: string[];
    emotionalTone: string;
    engagement: {
        upvotes?: number;
        comments?: number;
        shares?: number;
    };
}

export interface ListeningResult {
    rawExtracts: RawExtract[];
    totalSourcesAnalyzed: number;
    timestamp: string;
}

// ============================================
// PHASE 3: CLASSIFICATION (Sophistication)
// ============================================

export type SophisticationLevel = 'newbie' | 'intermediate' | 'advanced';
export type AwarenessLevel = 'unaware' | 'problem_aware' | 'solution_aware' | 'product_aware' | 'most_aware';
export type EmotionalState = 'frustrated' | 'hopeful' | 'fearful' | 'confused' | 'excited' | 'skeptical';
export type ContentCategory = 'pains_fears' | 'hopes_dreams' | 'barriers_uncertainties' | 'unexpected_insights';

export interface ClassifiedContent {
    extractId: string;
    sophisticationLevel: SophisticationLevel;
    awarenessLevel: AwarenessLevel;
    emotionalState: EmotionalState;
    category: ContentCategory;
    confidence: number; // 0-100
    reasoning: string;
}

export interface ClassificationResult {
    classifiedContent: ClassifiedContent[];
    distribution: {
        bySophistication: Record<SophisticationLevel, number>;
        byAwareness: Record<AwarenessLevel, number>;
        byCategory: Record<ContentCategory, number>;
    };
    timestamp: string;
}

// ============================================
// PHASE 4: AVATAR SYNTHESIS (Dream Buyer)
// ============================================

export interface Demographics {
    age: string;
    gender: string;
    location: string;
    income: string;
    occupation: string;
    education: string;
}

export interface VernacularEntry {
    phrase: string;
    source: string;
    context: string;
}

export interface AvatarDimensions {
    wateringHoles: string[];           // Dim 1: Where they hang out
    informationSources: string[];      // Dim 2: Where they get info
    frustrations: string[];            // Dim 3: Challenges
    hopesAndDreams: string[];          // Dim 4: Desires
    deepestFears: string[];            // Dim 5: Fears
    communicationPrefs: string[];      // Dim 6: How they communicate
    vernacular: VernacularEntry[];     // Dim 7: Their exact language
    dayInLife: {
        wakeTime: string;
        morningRoutine: string;
        checkPhoneFirst: boolean;
        commuteType: string;
        peakStressTime: string;
        downtime: string;
        eveningRoutine: string;
        bedTime: string;
        bestContactTimes: string[];
    }; // Dim 8: Typical day narrative
    competitorGapsTheyFeel: string[];
    happinessTriggers: string[];       // Dim 9: What makes them happy
}

export interface DreamBuyerAvatar {
    name: string;                      // Persona name (e.g., "Frustrated Frank")
    demographics: Demographics;
    dimensions: AvatarDimensions;
    psychographics: string;            // Summary paragraph
    dominantEmotion: EmotionalState;
}

export interface AvatarSynthesisResult {
    avatar: DreamBuyerAvatar;
    evidenceCount: number;
    dimensionsCovered: number;
    timestamp: string;
}

// ============================================
// PHASE 5: PROBLEM IDENTIFICATION (Hair-on-Fire)
// ============================================

export interface EvidenceQuote {
    quote: string;
    source: string;
}

export interface HairOnFireProblem {
    problem: string;
    frequencyScore: number;            // How often mentioned (0-100)
    intensityScore: number;            // Emotional intensity (0-100)
    totalScore: number;                // Combined score
    evidenceQuotes: EvidenceQuote[];
    relatedPains: string[];
    hvcoOpportunity: string;           // How HVCO can address this
}

export interface ProblemIdentificationResult {
    primaryProblem: HairOnFireProblem;
    secondaryProblems: HairOnFireProblem[];
    timestamp: string;
}

// ============================================
// PHASE 6: HVCO GENERATION (Title Creator)
// ============================================

export type HVCOFormula =
    | 'how_to_without'                 // How to [RESULT] without [PAIN POINT]
    | 'number_ways'                    // X Ways to [RESULT]
    | 'mistakes_to_avoid'              // X Mistakes to Avoid When [ACTIVITY]
    | 'secret_revealed'                // The Secret [MARKET] Uses to [RESULT]
    | 'ultimate_guide'                 // The Ultimate Guide to [RESULT]
    | 'step_by_step'                   // Step-by-Step: How to [RESULT]
    | 'checklist'                      // The Complete [TOPIC] Checklist
    | 'blueprint';                     // The [TOPIC] Blueprint for [RESULT]

export interface HVCOTitle {
    title: string;
    formula: HVCOFormula;
    intrigueScore: number;             // 0-100
    benefitScore: number;              // 0-100
    specificityScore: number;          // 0-100
    totalScore: number;
}

export interface HVCOGenerationResult {
    titles: HVCOTitle[];
    recommendedTitle: HVCOTitle;
    rationale: string;
    timestamp: string;
}

// ============================================
// COMPLETE RESEARCH RESULT
// ============================================

export interface CompleteHaloResearch {
    projectId: string;
    runId: string;
    topic: string;

    // Phase outputs
    discovery: DiscoveryResult;
    competitorRecon?: CompetitorReconResult; // Phase 1.5
    listening: ListeningResult;
    classification: ClassificationResult;
    avatar: AvatarSynthesisResult;
    problems: ProblemIdentificationResult;
    hvco: HVCOGenerationResult;

    // Metadata
    status: 'complete' | 'failed' | 'partial';
    completedAt: string;
    qualityScore: number;              // Overall quality 0-100
}

// ============================================
// ENVIRONMENT & CONFIG
// ============================================

export interface AgentEnv {
    AI: any;                           // Cloudflare Workers AI binding
    TAVILY_API_KEY: string;
    DB: any;                           // D1 Database binding
}

export interface AgentContext {
    topic: string;
    targetAudience?: string;
    productDescription?: string;
    projectId: string;
    runId: string;
}
