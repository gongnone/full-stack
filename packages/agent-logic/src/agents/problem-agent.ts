/**
 * Phase 5: Problem Identification Agent (Hair-on-Fire Finder)
 *
 * Goal: Identify the #1 most pressing problem
 * Input: Avatar + classified content
 * Output: Primary problem with frequency, intensity scores, and evidence
 */

import { PHASE_5_PROBLEM } from '../prompts/halo-phases';
import type {
    ProblemIdentificationResult,
    HairOnFireProblem,
    AvatarSynthesisResult,
    ClassificationResult,
    ListeningResult,
    AgentEnv,
    AgentContext,
    EvidenceQuote
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
 * Extract pain points from content
 */
interface PainPoint {
    text: string;
    source: string;
    frequency: number;
    intensity: number;
}

function extractPainPoints(
    listening: ListeningResult,
    classifications: ClassificationResult
): PainPoint[] {
    const painMap = new Map<string, PainPoint>();

    // Get all pain/fear classified content
    const painClassifications = classifications.classifiedContent.filter(
        c => c.category === 'pains_fears'
    );

    painClassifications.forEach(c => {
        const extract = listening.rawExtracts.find(e => e.id === c.extractId);
        if (!extract) return;

        // Process each verbatim quote
        extract.verbatimQuotes.forEach(quote => {
            const normalized = quote.toLowerCase().trim();

            // Skip very short or very long quotes
            if (normalized.length < 15 || normalized.length > 300) return;

            // Create a key for deduplication (first 50 chars)
            const key = normalized.slice(0, 50);

            if (painMap.has(key)) {
                // Increment frequency
                const existing = painMap.get(key)!;
                existing.frequency++;
            } else {
                // Calculate intensity based on emotional language
                let intensity = 50;
                const emotionWords = ['frustrated', 'hate', 'worst', 'terrible', 'impossible', 'struggling', 'desperate', 'sick of', 'fed up'];
                emotionWords.forEach(word => {
                    if (normalized.includes(word)) intensity += 10;
                });
                intensity = Math.min(100, intensity);

                painMap.set(key, {
                    text: quote,
                    source: extract.source.url,
                    frequency: 1,
                    intensity
                });
            }
        });
    });

    // Convert to array and sort by combined score
    return Array.from(painMap.values())
        .map(p => ({
            ...p,
            // Normalize frequency to 0-100 scale
            frequency: Math.min(100, p.frequency * 20)
        }))
        .sort((a, b) => {
            const scoreA = a.frequency * 0.4 + a.intensity * 0.6;
            const scoreB = b.frequency * 0.4 + b.intensity * 0.6;
            return scoreB - scoreA;
        });
}

/**
 * Group related pain points
 */
function groupRelatedPains(painPoints: PainPoint[]): string[] {
    // Take top pain points and extract unique themes
    const themes = new Set<string>();

    painPoints.slice(0, 10).forEach(p => {
        // Extract key phrases
        const words = p.text.toLowerCase().split(/\s+/);
        const significantWords = words.filter(w => w.length > 4);
        significantWords.slice(0, 3).forEach(w => themes.add(w));
    });

    return Array.from(themes).slice(0, 5);
}

/**
 * Build problem using AI
 */
async function buildProblemWithAI(
    env: AgentEnv,
    context: AgentContext,
    avatar: AvatarSynthesisResult,
    classifications: ClassificationResult,
    painPoints: PainPoint[]
): Promise<{ primary: HairOnFireProblem; secondary: HairOnFireProblem[] }> {
    // Prepare avatar summary
    const avatarSummary = {
        name: avatar.avatar.name,
        frustrations: avatar.avatar.dimensions.frustrations.slice(0, 5),
        fears: avatar.avatar.dimensions.deepestFears.slice(0, 3),
        dominantEmotion: avatar.avatar.dominantEmotion
    };

    // Prepare classified content summary
    const classifiedSummary = {
        painsFears: classifications.distribution.byCategory.pains_fears,
        topPains: painPoints.slice(0, 10).map(p => ({
            text: p.text,
            source: p.source,
            score: Math.round(p.frequency * 0.4 + p.intensity * 0.6)
        }))
    };

    const prompt = PHASE_5_PROBLEM
        .replace('{topic}', context.topic)
        .replace('{avatar}', JSON.stringify(avatarSummary))
        .replace('{classifiedContent}', JSON.stringify(classifiedSummary));

    const response = await env.AI.run(MODEL, {
        messages: [
            { role: 'system', content: 'You are the Pain Detective identifying hair-on-fire problems.' },
            { role: 'user', content: prompt }
        ],
        max_tokens: 3000
    });

    try {
        const cleaned = cleanJson(response.response);
        const parsed = JSON.parse(cleaned);

        const buildProblem = (data: any, painPoints: PainPoint[]): HairOnFireProblem => {
            const frequencyScore = typeof data.frequencyScore === 'number' ? data.frequencyScore : 70;
            const intensityScore = typeof data.intensityScore === 'number' ? data.intensityScore : 75;

            return {
                problem: data.problem || 'Unable to identify specific problem',
                frequencyScore,
                intensityScore,
                totalScore: data.totalScore || Math.round(frequencyScore * 0.4 + intensityScore * 0.6),
                evidenceQuotes: Array.isArray(data.evidenceQuotes)
                    ? data.evidenceQuotes.map((eq: any) => ({
                        quote: eq.quote || '',
                        source: eq.source || ''
                    }))
                    : painPoints.slice(0, 3).map(p => ({ quote: p.text, source: p.source })),
                relatedPains: Array.isArray(data.relatedPains) ? data.relatedPains : [],
                hvcoOpportunity: data.hvcoOpportunity || ''
            };
        };

        const primary = buildProblem(parsed.primaryProblem || parsed, painPoints);
        const secondary = Array.isArray(parsed.secondaryProblems)
            ? parsed.secondaryProblems.map((p: any) => buildProblem(p, painPoints))
            : [];

        return { primary, secondary };
    } catch (e) {
        console.error('[Phase 5] AI problem identification failed');
        throw e;
    }
}

/**
 * Build fallback problem from data
 */
function buildFallbackProblem(
    context: AgentContext,
    painPoints: PainPoint[]
): { primary: HairOnFireProblem; secondary: HairOnFireProblem[] } {
    const topPain = painPoints[0];

    if (!topPain) {
        return {
            primary: {
                problem: `Challenges with ${context.topic}`,
                frequencyScore: 50,
                intensityScore: 50,
                totalScore: 50,
                evidenceQuotes: [],
                relatedPains: [],
                hvcoOpportunity: `A guide addressing common ${context.topic} challenges`
            },
            secondary: []
        };
    }

    const primary: HairOnFireProblem = {
        problem: topPain.text.length > 100 ? topPain.text.slice(0, 100) + '...' : topPain.text,
        frequencyScore: topPain.frequency,
        intensityScore: topPain.intensity,
        totalScore: Math.round(topPain.frequency * 0.4 + topPain.intensity * 0.6),
        evidenceQuotes: painPoints.slice(0, 3).map(p => ({
            quote: p.text,
            source: p.source
        })),
        relatedPains: groupRelatedPains(painPoints),
        hvcoOpportunity: `A comprehensive guide showing how to overcome "${topPain.text.slice(0, 50)}..."`
    };

    const secondary: HairOnFireProblem[] = painPoints.slice(1, 4).map(p => ({
        problem: p.text.length > 100 ? p.text.slice(0, 100) + '...' : p.text,
        frequencyScore: p.frequency,
        intensityScore: p.intensity,
        totalScore: Math.round(p.frequency * 0.4 + p.intensity * 0.6),
        evidenceQuotes: [{ quote: p.text, source: p.source }],
        relatedPains: [],
        hvcoOpportunity: ''
    }));

    return { primary, secondary };
}

/**
 * Run Phase 5: Problem Identification Agent
 */
export async function runProblemAgent(
    env: AgentEnv,
    context: AgentContext,
    avatarResult: AvatarSynthesisResult,
    classificationResult: ClassificationResult,
    listeningResult: ListeningResult
): Promise<ProblemIdentificationResult> {
    console.log(`[Phase 5] Starting Problem Identification`);

    // Extract and rank pain points
    const painPoints = extractPainPoints(listeningResult, classificationResult);
    console.log(`[Phase 5] Found ${painPoints.length} distinct pain points`);

    let result: { primary: HairOnFireProblem; secondary: HairOnFireProblem[] };

    try {
        result = await buildProblemWithAI(
            env,
            context,
            avatarResult,
            classificationResult,
            painPoints
        );
        console.log(`[Phase 5] AI identified problem: "${result.primary.problem.slice(0, 50)}..."`);
    } catch (e) {
        console.log(`[Phase 5] Using fallback problem builder`);
        result = buildFallbackProblem(context, painPoints);
    }

    console.log(`[Phase 5] Primary problem score: ${result.primary.totalScore}, Evidence quotes: ${result.primary.evidenceQuotes.length}`);

    return {
        primaryProblem: result.primary,
        secondaryProblems: result.secondary,
        timestamp: new Date().toISOString()
    };
}
