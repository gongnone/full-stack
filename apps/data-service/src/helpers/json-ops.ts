export function safeParseAIResponse<T>(response: string): T {
    try {
        // 1. Try direct parsing first (fast path)
        return JSON.parse(response);
    } catch (e) {
        // 2. Clean Markdown (```json ... ```)
        let cleaned = response.replace(/```json/g, '').replace(/```/g, '');

        // 3. Extract JSON object using Regex (Finds the first { and last })
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (innerError: any) {
                console.error(`[safeParseAIResponse] Failed to parse regex-extracted block:`, jsonMatch[0].substring(0, 500));

                // 4. Try Code-Based Repair
                let repaired = jsonMatch[0];

                // 1. Remove trailing commas before closing braces/brackets
                repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

                // 2. Fix missing commas between properties
                // Case A: "val" "key" -> "val", "key"
                repaired = repaired.replace(/"\s+(?=")/g, '", ');
                // Case B: number "key" -> number, "key"
                repaired = repaired.replace(/(\d+)\s+(?=")/g, '$1, ');
                // Case C: boolean/null "key" -> boolean/null, "key"
                repaired = repaired.replace(/(true|false|null)\s+(?=")/g, '$1, ');
                // Case D: } "key" -> }, "key" (end of object)
                repaired = repaired.replace(/}\s+(?=")/g, '}, ');
                // Case E: ] "key" -> ], "key" (end of array)
                repaired = repaired.replace(/]\s+(?=")/g, '], ');

                // 3. Fix unescaped newlines
                repaired = repaired.replace(/\n/g, '\\n');

                try {
                    return JSON.parse(repaired);
                } catch (repairError) {
                    // 5. Fix Unbalanced Braces (Truncated JSON)
                    // If parsing still failed, it might be due to missing closing braces
                    const openBraces = (repaired.match(/{/g) || []).length;
                    const closeBraces = (repaired.match(/}/g) || []).length;
                    const openBrackets = (repaired.match(/\[/g) || []).length;
                    const closeBrackets = (repaired.match(/\]/g) || []).length;

                    if (openBraces > closeBraces) {
                        repaired += '}'.repeat(openBraces - closeBraces);
                    }
                    if (openBrackets > closeBrackets) {
                        repaired += ']'.repeat(openBrackets - closeBrackets);
                    }

                    try {
                        return JSON.parse(repaired);
                    } catch (finalError) {
                        // Only throw original error if all repairs fail
                    }
                }

                throw new Error(`Found JSON-like block but failed to parse: ${innerError.message}`);
            }
        }

        console.error(`[safeParseAIResponse] No JSON block found in response:`, response.substring(0, 500));
        throw new Error(`Could not extract JSON from AI response: "${response.substring(0, 50)}..."`);
    }
}
