/**
 * Halo Research Multi-Phase Agent System
 *
 * This module exports all 6 phases of the Halo Strategy research workflow:
 * 1. Discovery Agent - Find watering holes
 * 2. Listening Agent - Extract verbatim content
 * 3. Classification Agent - Categorize by sophistication/awareness
 * 4. Avatar Agent - Build Dream Buyer Avatar
 * 5. Problem Agent - Identify hair-on-fire problem
 * 6. HVCO Agent - Generate irresistible titles
 */

// Phase 1: Discovery
export { runDiscoveryAgent } from './discovery-agent';

// Phase 1.5: Competitor Recon
export { runCompetitorReconAgent } from './competitor-recon-agent';

// Phase 2: Deep Listening
export { runListeningAgent } from './listening-agent';

// Phase 3: Classification
export { runClassificationAgent } from './classification-agent';

// Phase 4: Avatar Synthesis
export { runAvatarAgent } from './avatar-agent';

// Phase 5: Problem Identification
export { runProblemAgent } from './problem-agent';

// Phase 6: HVCO Generation
export { runHVCOAgent } from './hvco-agent';

// Re-export types
export type {
    // Phase outputs
    DiscoveryResult,
    ListeningResult,
    ClassificationResult,
    AvatarSynthesisResult,
    ProblemIdentificationResult,
    HVCOGenerationResult,

    // Core types
    WateringHole,
    RawExtract,
    ClassifiedContent,
    DreamBuyerAvatar,
    HairOnFireProblem,
    HVCOTitle,

    // Enums/unions
    SophisticationLevel,
    AwarenessLevel,
    EmotionalState,
    ContentCategory,
    HVCOFormula,

    // Environment
    AgentEnv,
    AgentContext,
    CompleteHaloResearch
} from '../types/halo-types';
