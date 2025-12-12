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

                // 4. Try Code-Based Repair (Simple Heuristics)
                try {
                    const repaired = jsonMatch[0]
                        // Remove trailing commas before closing braces/brackets
                        .replace(/,(\s*[}\]])/g, '$1')
                        // Aggressive: Fix missing commas between double quotes (e.g. "val" "key" -> "val", "key")
                        // matches a quote, whitespace, then lookahead for another quote
                        .replace(/"\s+(?=")/g, '", ')
                        // Fix unescaped newlines in strings
                        .replace(/\n/g, '\\n')
                        // Re-normalize actual newlines for formatting if needed, but JSON.parse hates real newlines in strings
                        // For this specific error "Expected , or }", it's often a missing comma between fields
                        // e.g. "key": "val" "key2": "val"
                        // It is hard to fix that safely with regex.
                        ;
                    // We won't go too crazy with regex to avoid corruption.
                    // A simple trailing comma fix is the safest.
                    const trailingCommaFixed = jsonMatch[0].replace(/,(\s*[}\]])/g, '$1');
                    return JSON.parse(trailingCommaFixed);
                } catch (repairError) {
                    // Fallthrough to throw original error
                }

                throw new Error(`Found JSON-like block but failed to parse: ${innerError.message}`);
            }
        }

        console.error(`[safeParseAIResponse] No JSON block found in response:`, response.substring(0, 500));
        throw new Error(`Could not extract JSON from AI response: "${response.substring(0, 50)}..."`);
    }
}
