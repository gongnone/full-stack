/**
 * Phase 2: Deep Listening Agent (Content Extraction)
 *
 * Goal: Extract raw content preserving exact language
 * Input: List of watering holes from Phase 1
 * Output: Raw extracts with verbatim quotes and source attribution
 */

import { performWebSearch } from '../tools';
import { PHASE_2_LISTENING } from '../prompts/halo-phases';
import type { ListeningResult, RawExtract, DiscoveryResult, AgentEnv } from '../types/halo-types';
import { nanoid } from 'nanoid';

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
 * Generate deep search queries for a watering hole
 */
function generateDeepQueries(wateringHole: { url: string; name: string; platform: string }): string[] {
    const queries: string[] = [];

    // For Reddit, search within the community
    if (wateringHole.platform === 'reddit') {
        const subredditMatch = wateringHole.url.match(/r\/([^/]+)/);
        if (subredditMatch) {
            queries.push(`site:reddit.com/r/${subredditMatch[1]} frustration problem`);
            queries.push(`site:reddit.com/r/${subredditMatch[1]} help advice`);
        }
    }

    // General deep dive on the topic from this source
    const sitePart = wateringHole.url.split('/')[2];
    if (sitePart) {
        queries.push(`site:${sitePart} complaints problems`);
    }

    // Add original URL context
    queries.push(`${wateringHole.name} discussion`);

    return queries;
}

/**
 * Process search results into extracts
 */
async function processResultsWithAI(
    env: AgentEnv,
    searchResultsText: string
): Promise<RawExtract[]> {
    const prompt = PHASE_2_LISTENING.replace('{searchResults}', searchResultsText);

    const response = await env.AI.run(MODEL, {
        messages: [
            { role: 'system', content: 'You are a research analyst extracting verbatim content.' },
            { role: 'user', content: prompt }
        ],
        max_tokens: 4000
    });

    try {
        const cleaned = cleanJson(response.response);
        const parsed = JSON.parse(cleaned);

        // Ensure each extract has an ID
        return (parsed.extracts || []).map((extract: any, index: number) => ({
            id: extract.id || `extract_${nanoid(8)}`,
            source: {
                url: extract.source?.url || '',
                platform: extract.source?.platform || 'other',
                title: extract.source?.title || ''
            },
            content: extract.content || '',
            verbatimQuotes: Array.isArray(extract.verbatimQuotes) ? extract.verbatimQuotes : [],
            emotionalTone: extract.emotionalTone || 'neutral',
            engagement: {
                upvotes: extract.engagement?.upvotes || 0,
                comments: extract.engagement?.comments || 0,
                shares: extract.engagement?.shares || 0
            }
        }));
    } catch (e) {
        console.error('[Phase 2] Failed to parse AI response:', e);
        return [];
    }
}

/**
 * Create extracts directly from search results (fallback)
 */
function createExtractsFromResults(
    results: { title: string; url: string; content: string }[]
): RawExtract[] {
    return results.map((result, index) => {
        // Extract potential quotes (sentences with emotional language)
        const sentences = result.content.split(/[.!?]/).filter(s => s.trim().length > 20);
        const emotionalSentences = sentences.filter(s => {
            const lower = s.toLowerCase();
            return lower.includes('frustrated') ||
                lower.includes('problem') ||
                lower.includes('hate') ||
                lower.includes('wish') ||
                lower.includes('help') ||
                lower.includes('struggling') ||
                lower.includes('worst');
        });

        return {
            id: `extract_${nanoid(8)}`,
            source: {
                url: result.url,
                platform: detectPlatformFromUrl(result.url),
                title: result.title
            },
            content: result.content,
            verbatimQuotes: emotionalSentences.slice(0, 3).map(s => s.trim()),
            emotionalTone: detectEmotionalTone(result.content),
            engagement: { upvotes: 0, comments: 0, shares: 0 }
        };
    });
}

/**
 * Detect platform from URL
 */
function detectPlatformFromUrl(url: string): string {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('reddit.com')) return 'reddit';
    if (urlLower.includes('youtube.com')) return 'youtube';
    if (urlLower.includes('facebook.com')) return 'facebook';
    if (urlLower.includes('quora.com')) return 'quora';
    if (urlLower.includes('forum')) return 'forum';
    return 'other';
}

/**
 * Simple emotional tone detection
 */
function detectEmotionalTone(content: string): string {
    const lower = content.toLowerCase();
    if (lower.includes('frustrated') || lower.includes('angry') || lower.includes('hate')) return 'frustrated';
    if (lower.includes('hopeful') || lower.includes('excited') || lower.includes('love')) return 'hopeful';
    if (lower.includes('scared') || lower.includes('worried') || lower.includes('afraid')) return 'fearful';
    if (lower.includes('confused') || lower.includes("don't understand") || lower.includes('help')) return 'confused';
    return 'neutral';
}

/**
 * Run Phase 2: Deep Listening Agent
 */
export async function runListeningAgent(
    env: AgentEnv,
    discoveryResult: DiscoveryResult
): Promise<ListeningResult> {
    console.log(`[Phase 2] Starting Deep Listening on ${discoveryResult.wateringHoles.length} watering holes`);

    const allExtracts: RawExtract[] = [];
    const processedUrls = new Set<string>();

    // Process top watering holes (limit to avoid rate limits)
    const topWateringHoles = discoveryResult.wateringHoles.slice(0, 15);

    // Batch process: generate queries for all watering holes
    const allQueries: string[] = [];
    topWateringHoles.forEach(wh => {
        const queries = generateDeepQueries(wh);
        allQueries.push(...queries);
    });

    // Deduplicate queries
    const uniqueQueries = [...new Set(allQueries)].slice(0, 10); // Limit queries

    console.log(`[Phase 2] Executing ${uniqueQueries.length} deep search queries...`);

    // Execute searches in parallel
    const searchPromises = uniqueQueries.map(q => performWebSearch(q, env.TAVILY_API_KEY));
    const searchResults = await Promise.all(searchPromises);

    // Collect all raw results
    const allResults: { title: string; url: string; content: string }[] = [];
    searchResults.forEach(sr => {
        sr.results.forEach(r => {
            if (!processedUrls.has(r.url)) {
                processedUrls.add(r.url);
                allResults.push(r);
            }
        });
    });

    console.log(`[Phase 2] Collected ${allResults.length} unique content pieces`);

    // Process results in batches with AI
    const BATCH_SIZE = 10;
    for (let i = 0; i < allResults.length; i += BATCH_SIZE) {
        const batch = allResults.slice(i, i + BATCH_SIZE);

        // Format batch for AI processing
        const batchText = batch.map((r, idx) => {
            return `--- SOURCE ${idx + 1} ---
URL: ${r.url}
Title: ${r.title}
Content: ${r.content}
---`;
        }).join('\n\n');

        try {
            const aiExtracts = await processResultsWithAI(env, batchText);
            allExtracts.push(...aiExtracts);
        } catch (e) {
            console.error(`[Phase 2] AI processing failed for batch, using fallback`);
            const fallbackExtracts = createExtractsFromResults(batch);
            allExtracts.push(...fallbackExtracts);
        }
    }

    // If AI processing yielded no results, use direct extraction
    if (allExtracts.length === 0) {
        console.log(`[Phase 2] Using direct extraction fallback`);
        allExtracts.push(...createExtractsFromResults(allResults));
    }

    console.log(`[Phase 2] Extracted ${allExtracts.length} content pieces with verbatim quotes`);

    return {
        rawExtracts: allExtracts,
        totalSourcesAnalyzed: allResults.length,
        timestamp: new Date().toISOString()
    };
}
