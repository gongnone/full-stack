export async function performWebSearch(query: string, apiKey: string): Promise<string> {
    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // Tavily expects auth in header or body, checking docs usually header works or 'api_key' in body
            },
            body: JSON.stringify({
                query,
                search_depth: "basic",
                include_answer: true,
                max_results: 5
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Tavily API error: ${response.status} ${error}`);
        }

        const data = await response.json() as any;

        // Format results
        let resultString = `[Web Search Results for: "${query}"]\n\n`;

        if (data.answer) {
            resultString += `Direct Answer: ${data.answer}\n\n`;
        }

        if (data.results && Array.isArray(data.results)) {
            data.results.forEach((res: any, index: number) => {
                resultString += `${index + 1}. ${res.title}\n   URL: ${res.url}\n   Snippet: ${res.content}\n\n`;
            });
        }

        return resultString;
    } catch (error: any) {
        console.error("Web Search Error:", error);
        return `[System Error] Failed to perform web search: ${error.message}`;
    }
}
