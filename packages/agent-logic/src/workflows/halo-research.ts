import { performWebSearch } from "../tools";
import { GENERATE_SEARCH_QUERIES, ANALYZE_SEARCH_RESULTS } from "../prompts/halo-investigator";

// Define the output structure we want (Strict Typing = Quality)
export interface ResearchResult {
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
}

/**
 * Helper to strip "Here is JSON..." text and extract the {...} block.
 */
function cleanJson(text: string): string {
    // Find the first '{' and the last '}'
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');

    if (start === -1 || end === -1) {
        // Fallback: Return original text (might fail parse, but we tried)
        return text;
    }
    return text.substring(start, end + 1);
}

export async function runHaloResearch(
    topic: string,
    aiClient: any,
    apiKey: string,
    context?: { targetAudience?: string; productDescription?: string; }
): Promise<ResearchResult> {

    // Construct a rich context string if available
    let contextString = "";
    if (context) {
        if (context.targetAudience) contextString += `\nTarget Audience: ${context.targetAudience}`;
        if (context.productDescription) contextString += `\nProduct Context: ${context.productDescription}`;
    }

    // --- STEP 1: Plan the Search (The "Watering Holes") ---
    console.log(`[DEBUG] 🟢 runHaloResearch Started. Topic: ${topic}, Context: ${!!context}`);

    // We ask the AI *how* to search, instead of guessing.
    const queryGenResponse = await aiClient.run('@cf/meta/llama-3.1-70b-instruct', {
        messages: [
            { role: "system", content: GENERATE_SEARCH_QUERIES.replace("{topic}", topic).replace("{context}", contextString) }
        ],
    });

    let searchQueries: string[] = [];
    try {
        const cleaned = cleanJson(queryGenResponse.response);
        searchQueries = JSON.parse(cleaned).queries;
        console.log(`[DEBUG] 🧠 AI Generated Queries: ${JSON.stringify(searchQueries)}`);
    } catch (e) {
        console.error("[DEBUG] ⚠️ Failed to parse search queries, using fallback.", e);
        searchQueries = [
            `${topic} reddit complaints`,
            `${topic} forum discussions`,
            `worst things about ${topic}`
        ];
    }

    // Safety check just in case parse succeeded but structure was wrong
    if (!searchQueries || !Array.isArray(searchQueries)) {
        searchQueries = [`${topic} reddit complaints`, `${topic} discussions`];
    }

    console.log(`[DEBUG] 🕵️ Halo Strategy Searching for ${searchQueries.length} queries:`, searchQueries);

    // --- STEP 2: Execute Deep Search (The "Gathering") ---
    // Run all searches in parallel for speed
    console.log(`[DEBUG] 🚀 Triggering ${searchQueries.length} parallel searches...`);
    const searchPromises = searchQueries.map(q => performWebSearch(q, apiKey));
    const searchResults = await Promise.all(searchPromises);

    // Combine the "formattedOutput" strings for the AI
    const combinedContext = searchResults.map(r => r.formattedOutput).join("\n\n---\n\n");

    // Collect all raw source objects for the DB
    const rawSources = searchResults.flatMap(r => r.results);

    // Deduplicate sources by URL to avoid "10x identical sources"
    const uniqueSourcesMap = new Map();
    rawSources.forEach(s => {
        if (!uniqueSourcesMap.has(s.url)) {
            uniqueSourcesMap.set(s.url, s);
        }
    });
    const allSources = Array.from(uniqueSourcesMap.values());

    // --- STEP 3: Analyze Findings (The "Extraction") ---
    // Now we feed the RAW REAL DATA into the LLM
    const analysisResponse = await aiClient.run('@cf/meta/llama-3.1-70b-instruct', {
        messages: [
            { role: "system", content: "You are a helpful research assistant." },
            { role: "user", content: ANALYZE_SEARCH_RESULTS.replace("{topic}", topic).replace("{context}", contextString) + "\n\nCONTEXT:\n" + combinedContext }
        ],
        response_format: { type: "json_object" }, // NOW we force JSON again since we provided schema in prompt
        max_tokens: 3000 // Increase token limit to prevent JSON truncation
    });

    let finalData: any = {};
    try {
        const cleanedAnalysis = cleanJson(analysisResponse.response);
        finalData = JSON.parse(cleanedAnalysis);
    } catch (e) {
        console.error("[DEBUG] ⚠️ Failed to parse Final Analysis.", e);
        console.log("[DEBUG] 🔴 Raw Invalid JSON:", analysisResponse.response);
        // Fallback or empty structure so we don't crash
        finalData = {
            avatar: {
                name: "Error parsing agent output",
                demographics: "Unknown",
                psychographics: "Unknown"
            },
            painPoints: ["Agent failed to format JSON"],
            competitorGaps: [],
            marketDesire: "Unknown",
            verbatimQuotes: []
        };
    }

    // Ensure strict type safety before returning
    return {
        avatar: finalData.avatar || { name: "Unknown", demographics: "Unknown", psychographics: "Unknown" },
        painPoints: Array.isArray(finalData.painPoints) ? finalData.painPoints : [],
        competitorGaps: Array.isArray(finalData.competitorGaps) ? finalData.competitorGaps : [],
        marketDesire: finalData.marketDesire || "High",
        verbatimQuotes: Array.isArray(finalData.verbatimQuotes) ? finalData.verbatimQuotes : [],
        sources: allSources.map(s => ({
            url: s.url || '',
            title: s.title || '',
            content: s.content || ''
        }))
    } as ResearchResult;
}
