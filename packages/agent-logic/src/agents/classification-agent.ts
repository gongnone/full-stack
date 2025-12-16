/**
 * Phase 3: Classification Agent (Sophistication Classifier)
 *
 * Goal: Categorize each piece of content by market sophistication
 * Input: Raw extracts from Phase 2
 * Output: Classified content with sophistication, awareness, emotion, category
 */

import { PHASE_3_CLASSIFICATION } from '../prompts/halo-phases';
import type {
    ClassificationResult,
    ClassifiedContent,
    ListeningResult,
    AgentEnv,
    SophisticationLevel,
    AwarenessLevel,
    EmotionalState,
    ContentCategory
} from '../types/halo-types';

const MODEL = '@cf/meta/llama-3.1-70b-instruct';

/**
 * Clean JSON response from LLM
 */
function cleanJson(text: string): string {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return text;
    return text.substring(start, end + 1);
}

/**
 * Validate sophistication level
 */
function validateSophistication(value: string): SophisticationLevel {
    const valid: SophisticationLevel[] = ['newbie', 'intermediate', 'advanced'];
    const normalized = value?.toLowerCase() as SophisticationLevel;
    return valid.includes(normalized) ? normalized : 'intermediate';
}

/**
 * Validate awareness level
 */
function validateAwareness(value: string): AwarenessLevel {
    const valid: AwarenessLevel[] = ['unaware', 'problem_aware', 'solution_aware', 'product_aware', 'most_aware'];
    const normalized = value?.toLowerCase() as AwarenessLevel;
    return valid.includes(normalized) ? normalized : 'problem_aware';
}

/**
 * Validate emotional state
 */
function validateEmotion(value: string): EmotionalState {
    const valid: EmotionalState[] = ['frustrated', 'hopeful', 'fearful', 'confused', 'excited', 'skeptical'];
    const normalized = value?.toLowerCase() as EmotionalState;
    return valid.includes(normalized) ? normalized : 'frustrated';
}

/**
 * Validate content category
 */
function validateCategory(value: string): ContentCategory {
    const valid: ContentCategory[] = ['pains_fears', 'hopes_dreams', 'barriers_uncertainties', 'unexpected_insights'];
    const normalized = value?.toLowerCase() as ContentCategory;
    return valid.includes(normalized) ? normalized : 'pains_fears';
}

/**
 * Heuristic-based classification (fallback)
 */
function classifyWithHeuristics(content: string, id: string): ClassifiedContent {
    const lower = content.toLowerCase();

    // Sophistication detection
    let sophisticationLevel: SophisticationLevel = 'intermediate';
    if (lower.includes('what is') || lower.includes('how do i') || lower.includes("i'm new") || lower.includes('beginner')) {
        sophisticationLevel = 'newbie';
    } else if (lower.includes('technical') || lower.includes('advanced') || lower.includes('expert')) {
        sophisticationLevel = 'advanced';
    }

    // Awareness detection (Larger Market Formula)
    let awarenessLevel: AwarenessLevel = 'problem_aware';
    if (lower.includes('buying') || lower.includes('purchase') || lower.includes('price') || lower.includes('cost')) {
        awarenessLevel = 'most_aware';
    } else if (lower.includes('compare') || lower.includes('vs') || lower.includes('alternative') || lower.includes('which is better')) {
        awarenessLevel = 'solution_aware';
    } else if (lower.includes('problem') || lower.includes('struggle') || lower.includes('frustrated')) {
        awarenessLevel = 'problem_aware';
    }

    // Emotion detection
    let emotionalState: EmotionalState = 'frustrated';
    if (lower.includes('excited') || lower.includes('love') || lower.includes('amazing')) {
        emotionalState = 'excited';
    } else if (lower.includes('scared') || lower.includes('worried') || lower.includes('afraid')) {
        emotionalState = 'fearful';
    } else if (lower.includes('confused') || lower.includes("don't understand")) {
        emotionalState = 'confused';
    } else if (lower.includes('hope') || lower.includes('wish') || lower.includes('dream')) {
        emotionalState = 'hopeful';
    } else if (lower.includes('doubt') || lower.includes('skeptic') || lower.includes('scam')) {
        emotionalState = 'skeptical';
    }

    // Category detection
    let category: ContentCategory = 'pains_fears';
    if (lower.includes('hope') || lower.includes('dream') || lower.includes('goal') || lower.includes('want to')) {
        category = 'hopes_dreams';
    } else if (lower.includes('but') || lower.includes('objection') || lower.includes("can't") || lower.includes('obstacle')) {
        category = 'barriers_uncertainties';
    } else if (lower.includes('interesting') || lower.includes('surprising') || lower.includes('unexpected')) {
        category = 'unexpected_insights';
    }

    return {
        extractId: id,
        sophisticationLevel,
        awarenessLevel,
        emotionalState,
        category,
        confidence: 60, // Lower confidence for heuristic-based
        reasoning: 'Classified using keyword heuristics'
    };
}

/**
 * Process batch with AI
 */
async function classifyBatchWithAI(
    env: AgentEnv,
    extracts: Array<{ id: string; content: string; source: any }>
): Promise<ClassifiedContent[]> {
    // Format extracts for the prompt
    const extractsText = extracts.map((e, idx) => {
        return `EXTRACT ${idx + 1} (ID: ${e.id}):
Platform: ${e.source?.platform || 'unknown'}
Content: ${e.content.slice(0, 500)}...`;
    }).join('\n\n');

    const prompt = PHASE_3_CLASSIFICATION.replace('{extracts}', extractsText);

    const response = await env.AI.run(MODEL, {
        messages: [
            { role: 'system', content: 'You are a market psychologist analyzing buyer content.' },
            { role: 'user', content: prompt }
        ],
        max_tokens: 3000
    });

    try {
        const cleaned = cleanJson(response.response);
        const parsed = JSON.parse(cleaned);

        return (parsed.classifications || []).map((c: any) => ({
            extractId: c.extractId || '',
            sophisticationLevel: validateSophistication(c.sophisticationLevel),
            awarenessLevel: validateAwareness(c.awarenessLevel),
            emotionalState: validateEmotion(c.emotionalState),
            category: validateCategory(c.category),
            confidence: typeof c.confidence === 'number' ? c.confidence : 70,
            reasoning: c.reasoning || ''
        }));
    } catch (e) {
        console.error('[Phase 3] AI classification failed, using heuristics');
        return extracts.map(e => classifyWithHeuristics(e.content, e.id));
    }
}

/**
 * Calculate distribution statistics
 */
function calculateDistribution(classifications: ClassifiedContent[]): ClassificationResult['distribution'] {
    const bySophistication: Record<SophisticationLevel, number> = {
        newbie: 0,
        intermediate: 0,
        advanced: 0
    };

    const byAwareness: Record<AwarenessLevel, number> = {
        unaware: 0,
        problem_aware: 0,
        solution_aware: 0,
        product_aware: 0,
        most_aware: 0
    };

    const byCategory: Record<ContentCategory, number> = {
        pains_fears: 0,
        hopes_dreams: 0,
        barriers_uncertainties: 0,
        unexpected_insights: 0
    };

    classifications.forEach(c => {
        bySophistication[c.sophisticationLevel]++;
        byAwareness[c.awarenessLevel]++;
        byCategory[c.category]++;
    });

    return { bySophistication, byAwareness, byCategory };
}

/**
 * Run Phase 3: Classification Agent
 */
export async function runClassificationAgent(
    env: AgentEnv,
    listeningResult: ListeningResult
): Promise<ClassificationResult> {
    console.log(`[Phase 3] Starting Classification of ${listeningResult.rawExtracts.length} extracts`);

    const allClassifications: ClassifiedContent[] = [];

    // Process in batches to avoid token limits
    const BATCH_SIZE = 5;
    const extracts = listeningResult.rawExtracts;

    for (let i = 0; i < extracts.length; i += BATCH_SIZE) {
        const batch = extracts.slice(i, i + BATCH_SIZE);

        console.log(`[Phase 3] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(extracts.length / BATCH_SIZE)}`);

        try {
            const batchClassifications = await classifyBatchWithAI(env, batch);

            // Match classifications to extract IDs
            batch.forEach((extract, idx) => {
                const classification = batchClassifications[idx] || classifyWithHeuristics(extract.content, extract.id);
                classification.extractId = extract.id; // Ensure ID is correct
                allClassifications.push(classification);
            });
        } catch (e) {
            console.error(`[Phase 3] Batch processing failed, using heuristics`);
            batch.forEach(extract => {
                allClassifications.push(classifyWithHeuristics(extract.content, extract.id));
            });
        }
    }

    const distribution = calculateDistribution(allClassifications);

    console.log(`[Phase 3] Classification complete. Distribution:`, {
        sophistication: distribution.bySophistication,
        awareness: distribution.byAwareness
    });

    return {
        classifiedContent: allClassifications,
        distribution,
        timestamp: new Date().toISOString()
    };
}
