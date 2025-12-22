import { Ai, D1Database } from '@cloudflare/workers-types';
import { evaluateG2, G2Result } from './gates/g2-hook-strength';
import { evaluateG4, G4Result } from './gates/g4-voice-alignment';
import { evaluateG5, G5Result } from './gates/g5-platform-compliance';
import { evaluateG7, G7Result } from './gates/g7-engagement-prediction';

// Thresholds
const G2_THRESHOLD = 80;

export interface EvaluationResult {
  spokeId: string;
  g2: G2Result;
  g4: G4Result;
  g5: G5Result;
  g7: G7Result;
  overallPass: boolean;
  feedback: string;
}

export class CriticAgent {
  constructor(
    private ai: Ai,  // Workers AI
    private vectorize: any,  // For cosine similarity
    private db: D1Database  // For banned_words, voice_markers
  ) {}

  async evaluate(spoke: any, clientId: string): Promise<EvaluationResult> {
    // Run all gates
    const [g2, g4, g5, g7] = await Promise.all([
      evaluateG2(this.ai, spoke),
      evaluateG4(this.db, this.vectorize, spoke, clientId, this.ai),
      evaluateG5(spoke),
      evaluateG7(this.ai, spoke.content, spoke.platform),
    ]);

    // Determine overall pass
    const overallPass = g2.score >= G2_THRESHOLD
      && g4.result === 'pass'
      && g5.result === 'pass';

    // Generate feedback for failures
    const feedback = await this.generateFeedback(spoke, { g2, g4, g5 });

    return {
      spokeId: spoke.id,
      g2,
      g4,
      g5,
      g7,
      overallPass,
      feedback,
    };
  }

  private async evaluateG7(spoke: any): Promise<{ score: number }> {
    // TODO: Implement real engagement prediction using model training/prompting
    // For now, return a deterministic mock score based on content length and hook strength
    const base = Math.random() * 5 + 5; // 5-10
    return { score: Number(base.toFixed(1)) };
  }

  private async generateFeedback(spoke: any, gates: { g2: G2Result, g4: G4Result, g5: G5Result }): Promise<string> {
    if (gates.g2.score >= G2_THRESHOLD && gates.g4.result === 'pass' && gates.g5.result === 'pass') {
      return "Looks good!";
    }

    const prompt = `You are a Content Quality Critic. Analyze these failures and provide constructive feedback for regeneration.

CONTENT:
"""
${spoke.content}
"""

FAILURES:
${gates.g2.score < G2_THRESHOLD ? `- Hook Strength (G2): Score ${gates.g2.score}/100. Critic Notes: ${gates.g2.notes}` : ''}
${gates.g4.result === 'fail' ? `- Voice Alignment (G4): ${gates.g4.violations.join(', ')}` : ''}
${gates.g5.result === 'fail' ? `- Platform Compliance (G5): ${gates.g5.violations.map(v => v.message).join(', ')}` : ''}

Provide a concise (1-2 sentences) instruction for the Creator Agent to fix these issues. Focus on the most critical failure.`;

    try {
      const response = await this.ai.run('@cf/meta/llama-3.1-8b-instruct' as any, {
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      }) as any;
      return response.response.trim();
    } catch (e) {
      console.error("Feedback generation failed", e);
      return "Content failed quality gates. Please refine the hook and ensure brand alignment.";
    }
  }
}
