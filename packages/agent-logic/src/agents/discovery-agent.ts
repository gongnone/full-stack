/**
 * Phase 1: Discovery Agent (Watering Hole Finder)
 *
 * Goal: Find where dream buyers congregate online
 * Input: Topic/niche + target audience description
 * Output: List of watering holes with relevance scores
 */

import { performWebSearch } from '../tools';
import { PHASE_1_DISCOVERY, buildContextString } from '../prompts/halo-phases';
import type { DiscoveryResult, WateringHole, AgentEnv, AgentContext } from '../types/halo-types';

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
 * Parse platform from URL
 */
function detectPlatform(url: string): WateringHole['platform'] {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('reddit.com')) return 'reddit';
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
    if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) return 'facebook';
    if (urlLower.includes('quora.com')) return 'quora';
    if (urlLower.includes('amazon.com') || urlLower.includes('amzn.to')) return 'amazon_book';
    if (urlLower.includes('forum') || urlLower.includes('community')) return 'forum';
    return 'other';
}

/**
 * Calculate relevance score based on content matching
 */
function calculateRelevanceScore(content: string, topic: string): number {
    const topicWords = topic.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();

    let score = 50; // Base score

    // Topic word matches
    topicWords.forEach(word => {
        if (word.length > 3 && contentLower.includes(word)) {
            score += 10;
        }
    });

    // Emotional/pain indicators (good for Halo Strategy)
    const painIndicators = ['frustrated', 'problem', 'help', 'struggling', 'advice', 'hate', 'worst', 'difficult', 'challenge'];
    painIndicators.forEach(indicator => {
        if (contentLower.includes(indicator)) {
            score += 5;
        }
    });

    // Community indicators
    const communityIndicators = ['community', 'discussion', 'thread', 'comment', 'reply', 'group'];
    communityIndicators.forEach(indicator => {
        if (contentLower.includes(indicator)) {
            score += 3;
        }
    });

    return Math.min(100, Math.max(0, score));
}

/**
 * Extract sample topics from content
 */
function extractSampleTopics(content: string): string[] {
    // Extract phrases that look like discussion topics
    const sentences = content.split(/[.!?]/);
    const topics: string[] = [];

    sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        if (trimmed.length > 20 && trimmed.length < 100) {
            // Look for question patterns or topic indicators
            if (trimmed.includes('?') ||
                trimmed.toLowerCase().startsWith('how') ||
                trimmed.toLowerCase().startsWith('why') ||
                trimmed.toLowerCase().startsWith('what')) {
                topics.push(trimmed);
            }
        }
    });

    return topics.slice(0, 3); // Return max 3 sample topics
}

/**
 * Run Phase 1: Discovery Agent
 */
export async function runDiscoveryAgent(
    env: AgentEnv,
    context: AgentContext
): Promise<DiscoveryResult> {
    console.log(`[Phase 1] Starting Discovery Agent for topic: ${context.topic}`);

    const contextString = buildContextString({
        targetAudience: context.targetAudience,
        productDescription: context.productDescription
    });

    // Step 1: Ask AI to generate strategic search queries
    const queryPrompt = PHASE_1_DISCOVERY
        .replace('{topic}', context.topic)
        .replace('{context}', contextString);

    console.log(`[Phase 1] Generating search queries...`);

    const queryResponse = await env.AI.run(MODEL, {
        messages: [{ role: 'system', content: queryPrompt }],
        max_tokens: 1000
    });

    let searchQueries: string[] = [];
    try {
        const cleaned = cleanJson(queryResponse.response);
        const parsed = JSON.parse(cleaned);
        searchQueries = parsed.queries || [];
        console.log(`[Phase 1] Generated ${searchQueries.length} search queries`);
    } catch (e) {
        console.error(`[Phase 1] Failed to parse queries, using fallback`);
        searchQueries = [
            `${context.topic} reddit community discussions`,
            `${context.topic} problems frustrations site:reddit.com`,
            `${context.topic} help advice forum`,
            `${context.topic} reviews complaints`,
            `${context.topic} questions site:quora.com`,
            `worst things about ${context.topic}`,
            `${context.topic} facebook group`,
            `${context.topic} struggles youtube`,
            `amazon book reviews ${context.topic} 3 stars`,
            `best books on ${context.topic} amazon`
        ];
    }

    // Step 2: Execute searches in parallel
    console.log(`[Phase 1] Executing ${searchQueries.length} searches...`);
    const searchPromises = searchQueries.map(q => performWebSearch(q, env.TAVILY_API_KEY));
    const searchResults = await Promise.all(searchPromises);

    // Step 3: Process results into watering holes
    const wateringHolesMap = new Map<string, WateringHole>();

    searchResults.forEach(result => {
        result.results.forEach(item => {
            // Deduplicate by URL
            if (!wateringHolesMap.has(item.url)) {
                const platform = detectPlatform(item.url);
                const relevanceScore = calculateRelevanceScore(item.content, context.topic);
                const sampleTopics = extractSampleTopics(item.content);

                wateringHolesMap.set(item.url, {
                    platform,
                    url: item.url,
                    name: item.title,
                    relevanceScore,
                    estimatedAudience: platform === 'reddit' ? 'Community members' :
                        platform === 'youtube' ? 'Video viewers' :
                            platform === 'quora' ? 'Question seekers' :
                                'Forum participants',
                    sampleTopics
                });
            }
        });
    });

    // Step 4: Sort by relevance and take top results
    const wateringHoles = Array.from(wateringHolesMap.values())
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 20); // Keep top 20 most relevant

    console.log(`[Phase 1] Found ${wateringHoles.length} unique watering holes`);

    return {
        wateringHoles,
        searchQueriesUsed: searchQueries,
        timestamp: new Date().toISOString()
    };
}
