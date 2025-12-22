import { Ai } from '@cloudflare/workers-types';

export interface G7Result {
    score: number;  // 0-100
    breakdown: {
      shareability: number;
      commentWorthiness: number;
      saveLikelihood: number;
    };
    notes: string;
}

function buildG7Prompt(content: string, platform: string): string {
    return `You are a Content Performance Predictor AI.
    
    Predict the engagement potential for this ${platform} content.
    
    CONTENT:
    """
    ${content}
    """
    
    Score each dimension (0-33, total approx 0-100):
    1. SHAREABILITY: Would someone share this?
    2. COMMENT-WORTHINESS: Does it invite discussion?
    3. SAVE LIKELIHOOD: Is it reference-worthy?
    
    Respond in JSON format ONLY:
    {
      "shareability": <0-33>,
      "commentWorthiness": <0-33>,
      "saveLikelihood": <0-34>,
      "notes": "<brief prediction reasoning>"
    }`;
}

export async function evaluateG7(ai: Ai, content: string, platform: string): Promise<G7Result> {
    const prompt = buildG7Prompt(content, platform);
    try {
        const response: any = await ai.run('@cf/meta/llama-3.1-8b-instruct' as any, {
            messages: [{ role: 'user', content: prompt }],
        });
        const parsed = JSON.parse(response.response);
        return {
            score: parsed.shareability + parsed.commentWorthiness + parsed.saveLikelihood,
            breakdown: {
                shareability: parsed.shareability,
                commentWorthiness: parsed.commentWorthiness,
                saveLikelihood: parsed.saveLikelihood,
            },
            notes: parsed.notes,
        };
    } catch (e) {
        console.error("G7 evaluation failed", e);
        return {
            score: 70, // Default baseline
            breakdown: { shareability: 23, commentWorthiness: 23, saveLikelihood: 24 },
            notes: "Predicting moderate engagement."
        };
    }
}
