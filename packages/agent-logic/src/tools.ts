export interface SearchResponse {
    results: { title: string; url: string; content: string }[];
    formattedOutput: string;
}

export async function performWebSearch(query: string, apiKey: string): Promise<SearchResponse> {
    try {
        console.log(`[Tools] 🌐 Calling Tavily API: ${query}`);
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                query,
                search_depth: "basic",
                include_answer: true,
                max_results: 5
            })
        });

        console.log(`[Tools] ✅ Tavily Response Status: ${response.status}`);

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Tavily API error: ${response.status} ${error}`);
        }

        const data = await response.json() as any;

        // Format results for AI
        let resultString = `[Web Search Results for: "${query}"]\n\n`;

        if (data.answer) {
            resultString += `Direct Answer: ${data.answer}\n\n`;
        }

        const cleanResults: { title: string; url: string; content: string }[] = [];

        if (data.results && Array.isArray(data.results)) {
            data.results.forEach((res: any, index: number) => {
                resultString += `${index + 1}. ${res.title}\n   URL: ${res.url}\n   Snippet: ${res.content}\n\n`;
                cleanResults.push({
                    title: res.title,
                    url: res.url,
                    content: res.content
                });
            });
        }

        return {
            results: cleanResults,
            formattedOutput: resultString
        };
    } catch (error: any) {
        console.error("Web Search Error:", error);
        return {
            results: [],
            formattedOutput: `[System Error] Failed to perform web search: ${error.message}`
        };
    }
}
