/**
 * Phase 4: Avatar Synthesis Agent (Dream Buyer Builder)
 *
 * Goal: Build comprehensive Dream Buyer Avatar with all 9 dimensions
 * Input: Classified content from Phase 3
 * Output: Complete avatar with demographics, psychographics, vernacular
 */

import { PHASE_4_AVATAR } from '../prompts/halo-phases';
import type {
    AvatarSynthesisResult,
    DreamBuyerAvatar,
    ClassificationResult,
    ListeningResult,
    AgentEnv,
    AgentContext,
    VernacularEntry,
    EmotionalState
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
 * Extract verbatim quotes with sources
 */
function extractVernacular(
    extracts: ListeningResult['rawExtracts'],
    classifications: ClassificationResult['classifiedContent']
): VernacularEntry[] {
    const vernacular: VernacularEntry[] = [];

    extracts.forEach(extract => {
        const classification = classifications.find(c => c.extractId === extract.id);
        const category = classification?.category || 'unknown';

        extract.verbatimQuotes.forEach(quote => {
            if (quote && quote.length > 10 && quote.length < 200) {
                vernacular.push({
                    phrase: quote,
                    source: extract.source.url,
                    context: `${category} - ${extract.source.platform}`
                });
            }
        });
    });

    // Sort by length (prefer meaningful phrases) and deduplicate
    const seen = new Set<string>();
    return vernacular
        .filter(v => {
            const normalized = v.phrase.toLowerCase().trim();
            if (seen.has(normalized)) return false;
            seen.add(normalized);
            return true;
        })
        .sort((a, b) => b.phrase.length - a.phrase.length)
        .slice(0, 15); // Keep top 15 vernacular entries
}

/**
 * Aggregate content by category
 */
function aggregateByCategory(
    extracts: ListeningResult['rawExtracts'],
    classifications: ClassificationResult['classifiedContent']
): Record<string, string[]> {
    const aggregated: Record<string, string[]> = {
        pains_fears: [],
        hopes_dreams: [],
        barriers_uncertainties: [],
        unexpected_insights: []
    };

    classifications.forEach(c => {
        const extract = extracts.find(e => e.id === c.extractId);
        if (extract) {
            // Add verbatim quotes to appropriate category
            extract.verbatimQuotes.forEach(quote => {
                if (aggregated[c.category]) {
                    aggregated[c.category].push(quote);
                }
            });
        }
    });

    return aggregated;
}

/**
 * Determine dominant emotion
 */
function getDominantEmotion(
    classifications: ClassificationResult['classifiedContent']
): EmotionalState {
    const emotionCounts: Record<EmotionalState, number> = {
        frustrated: 0,
        hopeful: 0,
        fearful: 0,
        confused: 0,
        excited: 0,
        skeptical: 0
    };

    classifications.forEach(c => {
        emotionCounts[c.emotionalState]++;
    });

    let dominant: EmotionalState = 'frustrated';
    let maxCount = 0;
    (Object.keys(emotionCounts) as EmotionalState[]).forEach(emotion => {
        if (emotionCounts[emotion] > maxCount) {
            maxCount = emotionCounts[emotion];
            dominant = emotion;
        }
    });

    return dominant;
}

/**
 * Create avatar with AI
 */
async function buildAvatarWithAI(
    env: AgentEnv,
    context: AgentContext,
    classifications: ClassificationResult,
    listening: ListeningResult,
    vernacular: VernacularEntry[],
    aggregated: Record<string, string[]>
): Promise<DreamBuyerAvatar> {
    // Prepare classified content summary
    const classifiedSummary = JSON.stringify({
        distribution: classifications.distribution,
        sampleContent: classifications.classifiedContent.slice(0, 10).map(c => ({
            category: c.category,
            emotion: c.emotionalState,
            sophistication: c.sophisticationLevel
        }))
    });

    // Prepare extracts summary
    const extractsSummary = listening.rawExtracts.slice(0, 15).map(e => ({
        platform: e.source.platform,
        quotes: e.verbatimQuotes.slice(0, 2),
        emotion: e.emotionalTone
    }));

    const prompt = PHASE_4_AVATAR
        .replace('{topic}', context.topic)
        .replace('{classifiedContent}', classifiedSummary)
        .replace('{extracts}', JSON.stringify(extractsSummary));

    const response = await env.AI.run(MODEL, {
        messages: [
            { role: 'system', content: 'You are the Dream Buyer Architect creating comprehensive customer avatars.' },
            { role: 'user', content: prompt }
        ],
        max_tokens: 4000
    });

    try {
        const cleaned = cleanJson(response.response);
        const parsed = JSON.parse(cleaned);
        const avatarData = parsed.avatar || parsed;

        // Ensure all required fields exist
        return {
            name: avatarData.name || `${context.topic} Customer`,
            demographics: {
                age: avatarData.demographics?.age || '25-45',
                gender: avatarData.demographics?.gender || 'Mixed',
                location: avatarData.demographics?.location || 'English-speaking countries',
                income: avatarData.demographics?.income || 'Middle to upper income',
                occupation: avatarData.demographics?.occupation || 'Professional',
                education: avatarData.demographics?.education || 'College educated'
            },
            dimensions: {
                wateringHoles: avatarData.dimensions?.wateringHoles || ['Reddit', 'YouTube', 'Industry Forums'],
                informationSources: avatarData.dimensions?.informationSources || ['YouTube', 'Podcasts', 'Blogs'],
                frustrations: aggregated.pains_fears.slice(0, 5) || avatarData.dimensions?.frustrations || [],
                hopesAndDreams: aggregated.hopes_dreams.slice(0, 5) || avatarData.dimensions?.hopesAndDreams || [],
                deepestFears: avatarData.dimensions?.deepestFears || [],
                communicationPrefs: avatarData.dimensions?.communicationPrefs || ['Direct', 'Practical'],
                vernacular: vernacular,
                dayInLife: (typeof avatarData.dimensions?.dayInLife === 'object') ? avatarData.dimensions.dayInLife : {
                    wakeTime: "7:00 AM",
                    morningRoutine: "Coffee",
                    checkPhoneFirst: true,
                    commuteType: "WFH",
                    peakStressTime: "10:00 AM",
                    downtime: "TV",
                    eveningRoutine: "Read",
                    bedTime: "11:00 PM",
                    bestContactTimes: ["9:00 AM"]
                },
                competitorGapsTheyFeel: avatarData.dimensions?.competitorGapsTheyFeel || [],
                happinessTriggers: avatarData.dimensions?.happinessTriggers || []
            },
            psychographics: avatarData.psychographics || 'A professional seeking solutions...',
            dominantEmotion: getDominantEmotion(classifications.classifiedContent)
        };
    } catch (e) {
        console.error('[Phase 4] AI avatar building failed, using fallback');
        throw e;
    }
}

/**
 * Create fallback avatar from data
 */
function buildFallbackAvatar(
    context: AgentContext,
    classifications: ClassificationResult,
    listening: ListeningResult,
    vernacular: VernacularEntry[],
    aggregated: Record<string, string[]>
): DreamBuyerAvatar {
    const platforms = new Set<string>();
    listening.rawExtracts.forEach(e => platforms.add(e.source.platform));

    return {
        name: `${context.topic} Seeker`,
        demographics: {
            age: '25-45',
            gender: 'Mixed',
            location: 'English-speaking countries',
            income: 'Middle income',
            occupation: 'Professional',
            education: 'College educated'
        },
        dimensions: {
            wateringHoles: Array.from(platforms),
            informationSources: ['YouTube', 'Google', 'Reddit', 'Podcasts'],
            frustrations: aggregated.pains_fears.slice(0, 5),
            hopesAndDreams: aggregated.hopes_dreams.slice(0, 5),
            deepestFears: aggregated.barriers_uncertainties.slice(0, 3),
            communicationPrefs: ['Direct communication', 'Practical advice'],
            vernacular: vernacular,
            dayInLife: {
                wakeTime: "7:00 AM",
                morningRoutine: "Checks phone, coffee",
                checkPhoneFirst: true,
                commuteType: "WFH/Hybrid",
                peakStressTime: "11:00 AM",
                downtime: "Streaming TV",
                eveningRoutine: "Social media",
                bedTime: "11:30 PM",
                bestContactTimes: ["8:00 AM", "6:00 PM"]
            },
            competitorGapsTheyFeel: ["Lack of actionable advice", "Overwhelming information"],
            happinessTriggers: ['Finding effective solutions', 'Saving time', 'Getting results']
        },
        psychographics: `A motivated individual actively seeking better solutions for ${context.topic}. They spend considerable time online researching and often feel frustrated by the lack of clear, actionable guidance.`,
        dominantEmotion: getDominantEmotion(classifications.classifiedContent)
    };
}

/**
 * Count dimensions that have meaningful content
 */
function countDimensionsCovered(avatar: DreamBuyerAvatar): number {
    let count = 0;
    const dims = avatar.dimensions;

    if (dims.wateringHoles.length > 0) count++;
    if (dims.informationSources.length > 0) count++;
    if (dims.frustrations.length > 0) count++;
    if (dims.hopesAndDreams.length > 0) count++;
    if (dims.deepestFears.length > 0) count++;
    if (dims.communicationPrefs.length > 0) count++;
    if (dims.vernacular.length > 0) count++;
    if (dims.dayInLife && dims.dayInLife.morningRoutine && dims.dayInLife.morningRoutine.length > 5) count++;
    if (dims.happinessTriggers.length > 0) count++;

    return count;
}

/**
 * Run Phase 4: Avatar Synthesis Agent
 */
export async function runAvatarAgent(
    env: AgentEnv,
    context: AgentContext,
    classificationResult: ClassificationResult,
    listeningResult: ListeningResult
): Promise<AvatarSynthesisResult> {
    console.log(`[Phase 4] Starting Avatar Synthesis`);

    // Extract vernacular with sources
    const vernacular = extractVernacular(
        listeningResult.rawExtracts,
        classificationResult.classifiedContent
    );
    console.log(`[Phase 4] Extracted ${vernacular.length} vernacular entries`);

    // Aggregate content by category
    const aggregated = aggregateByCategory(
        listeningResult.rawExtracts,
        classificationResult.classifiedContent
    );

    let avatar: DreamBuyerAvatar;

    try {
        avatar = await buildAvatarWithAI(
            env,
            context,
            classificationResult,
            listeningResult,
            vernacular,
            aggregated
        );
        console.log(`[Phase 4] AI avatar created: "${avatar.name}"`);
    } catch (e) {
        console.log(`[Phase 4] Using fallback avatar builder`);
        avatar = buildFallbackAvatar(
            context,
            classificationResult,
            listeningResult,
            vernacular,
            aggregated
        );
    }

    const dimensionsCovered = countDimensionsCovered(avatar);
    const evidenceCount = vernacular.length + aggregated.pains_fears.length + aggregated.hopes_dreams.length;

    console.log(`[Phase 4] Avatar complete. Dimensions covered: ${dimensionsCovered}/9, Evidence: ${evidenceCount}`);

    return {
        avatar,
        evidenceCount,
        dimensionsCovered,
        timestamp: new Date().toISOString()
    };
}
