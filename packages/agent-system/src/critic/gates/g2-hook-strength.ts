import { Ai } from '@cloudflare/workers-types';

// Forward declaring to avoid import errors
type Spoke = any;

export interface G2Result {
    score: number;  // 0-100
    breakdown: {
      patternInterrupt: number;  // 0-40
      benefitSignal: number;     // 0-30
      curiosityGap: number;      // 0-30
    };
    notes: string;  // Critic's explanation
}

function buildG2Prompt(spoke: Spoke): string {
    const G2_PROMPT = `You are a Content Quality Critic evaluating hook strength.

    Rate this ${spoke.platform} content on three dimensions:
    
    CONTENT:
    """
    ${spoke.content}
    """
    
    Score each dimension (use ONLY integers):
    1. PATTERN INTERRUPT (0-40): Does this stop the scroll? Is it unexpected?
    2. BENEFIT SIGNAL (0-30): Is the value proposition clear?
    3. CURIOSITY GAP (0-30): Does it create tension that demands resolution?
    
    Respond in JSON format ONLY:
    {
      "patternInterrupt": <0-40>,
      "benefitSignal": <0-30>,
      "curiosityGap": <0-30>,
      "notes": "<brief explanation of scoring>"
    }`;
    return G2_PROMPT;
}

function parseG2Response(response: {response: string}): G2Result {
    try {
        const parsed = JSON.parse(response.response);
        return {
            score: parsed.patternInterrupt + parsed.benefitSignal + parsed.curiosityGap,
            breakdown: {
                patternInterrupt: parsed.patternInterrupt,
                benefitSignal: parsed.benefitSignal,
                curiosityGap: parsed.curiosityGap,
            },
            notes: parsed.notes,
        };
    } catch (e) {
        console.error("Error parsing G2 response", e);
        return {
            score: 0,
            breakdown: {
                patternInterrupt: 0,
                benefitSignal: 0,
                curiosityGap: 0,
            },
            notes: "Error parsing response"
        };
    }
}

export async function evaluateG2(ai: Ai, spoke: Spoke): Promise<G2Result> {
    const prompt = buildG2Prompt(spoke);
    const response:any = await ai.run('@cf/meta/llama-3.1-8b-instruct' as any, {
      messages: [{ role: 'user', content: prompt }],
    });
    return parseG2Response(response);
}
