/**
 * Phase 6: HVCO Generation Agent (Title Creator)
 *
 * Goal: Generate irresistible HVCO titles
 * Input: Hair-on-fire problem + Avatar vernacular
 * Output: 10+ title variants with scoring, recommended title
 */

import { PHASE_6_HVCO } from '../prompts/halo-phases';
import type {
    HVCOGenerationResult,
    HVCOTitle,
    HVCOFormula,
    ProblemIdentificationResult,
    AvatarSynthesisResult,
    AgentEnv,
    AgentContext
} from '../types/halo-types';

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
 * HVCO Title Formulas with templates
 */
const TITLE_FORMULAS: Record<HVCOFormula, (problem: string, topic: string) => string[]> = {
    how_to_without: (problem, topic) => [
        `How to [RESULT] Without [PAIN] - Fill in based on ${topic}`,
        `How to Achieve [GOAL] Without [COMMON OBSTACLE]`
    ],
    number_ways: (problem, topic) => [
        `7 Proven Ways to [SOLVE PROBLEM] in [TIMEFRAME]`,
        `5 Little-Known Secrets to [ACHIEVE RESULT]`,
        `9 Powerful Methods for [DESIRED OUTCOME]`
    ],
    mistakes_to_avoid: (problem, topic) => [
        `7 Costly Mistakes [MARKET] Make When [ACTIVITY] (And How to Avoid Them)`,
        `5 Fatal Errors That Keep [MARKET] From [RESULT]`
    ],
    secret_revealed: (problem, topic) => [
        `The Secret [TOP PERFORMERS] Use to [ACHIEVE RESULT] (That Nobody Talks About)`,
        `The Hidden Strategy Behind [SUCCESSFUL OUTCOME]`
    ],
    ultimate_guide: (problem, topic) => [
        `The Ultimate Guide to [RESULT] in [YEAR]`,
        `The Complete [TOPIC] Blueprint for [MARKET]`
    ],
    step_by_step: (problem, topic) => [
        `Step-by-Step: How to [RESULT] in [TIMEFRAME]`,
        `The Exact [NUMBER]-Step Process to [OUTCOME]`
    ],
    checklist: (problem, topic) => [
        `The Complete [TOPIC] Checklist: [NUMBER] Must-Have Items`,
        `Your [TOPIC] Success Checklist (Don't Miss #7)`
    ],
    blueprint: (problem, topic) => [
        `The [TOPIC] Blueprint: Your Roadmap to [RESULT]`,
        `The Proven [TOPIC] Framework for [MARKET]`
    ]
};

/**
 * Intrigue words to boost curiosity
 */
const INTRIGUE_WORDS = [
    'secret', 'hidden', 'revealed', 'little-known', 'proven', 'powerful',
    'forbidden', 'underground', 'insider', 'breakthrough', 'revolutionary',
    'shocking', 'counterintuitive', 'unexpected', 'surprising'
];

/**
 * Score a title based on criteria
 */
function scoreTitle(title: string): { intrigueScore: number; benefitScore: number; specificityScore: number } {
    let intrigueScore = 40;
    let benefitScore = 40;
    let specificityScore = 40;

    // Intrigue scoring
    INTRIGUE_WORDS.forEach(word => {
        if (title.toLowerCase().includes(word)) intrigueScore += 10;
    });
    if (title.includes('?')) intrigueScore += 5;
    if (title.includes('...')) intrigueScore += 5;

    // Benefit scoring (look for outcome words)
    const benefitWords = ['get', 'achieve', 'increase', 'boost', 'double', 'triple', 'save', 'earn', 'grow', 'build', 'create', 'master', 'dominate'];
    benefitWords.forEach(word => {
        if (title.toLowerCase().includes(word)) benefitScore += 8;
    });

    // Specificity scoring (numbers, timeframes, specific markets)
    if (/\d+/.test(title)) specificityScore += 20; // Has numbers
    if (/\d+\s*(days?|weeks?|months?|hours?)/.test(title.toLowerCase())) specificityScore += 15; // Has timeframe
    if (title.length > 30 && title.length < 80) specificityScore += 10; // Good length

    // Cap at 100
    intrigueScore = Math.min(100, intrigueScore);
    benefitScore = Math.min(100, benefitScore);
    specificityScore = Math.min(100, specificityScore);

    return { intrigueScore, benefitScore, specificityScore };
}

/**
 * Generate titles using AI
 */
async function generateTitlesWithAI(
    env: AgentEnv,
    context: AgentContext,
    problem: ProblemIdentificationResult,
    avatar: AvatarSynthesisResult
): Promise<HVCOTitle[]> {
    // Prepare vernacular for injection
    const vernacularPhrases = avatar.avatar.dimensions.vernacular
        .slice(0, 5)
        .map(v => v.phrase);

    const prompt = PHASE_6_HVCO
        .replace('{topic}', context.topic)
        .replace('{problem}', JSON.stringify({
            statement: problem.primaryProblem.problem,
            intensity: problem.primaryProblem.intensityScore,
            relatedPains: problem.primaryProblem.relatedPains
        }))
        .replace('{vernacular}', JSON.stringify(vernacularPhrases))
        .replace('{avatarName}', avatar.avatar.name);

    const response = await env.AI.run(MODEL, {
        messages: [
            { role: 'system', content: 'You are the HVCO Architect - a master of irresistible lead magnets.' },
            { role: 'user', content: prompt }
        ],
        max_tokens: 3000
    });

    try {
        const cleaned = cleanJson(response.response);
        const parsed = JSON.parse(cleaned);

        const titles: HVCOTitle[] = (parsed.titles || []).map((t: any) => {
            const scores = scoreTitle(t.title || '');
            return {
                title: t.title || '',
                formula: validateFormula(t.formula),
                intrigueScore: t.intrigueScore || scores.intrigueScore,
                benefitScore: t.benefitScore || scores.benefitScore,
                specificityScore: t.specificityScore || scores.specificityScore,
                totalScore: t.totalScore || calculateTotalScore(scores)
            };
        });

        return titles;
    } catch (e) {
        console.error('[Phase 6] AI title generation failed');
        throw e;
    }
}

/**
 * Validate formula type
 */
function validateFormula(formula: string): HVCOFormula {
    const valid: HVCOFormula[] = [
        'how_to_without', 'number_ways', 'mistakes_to_avoid', 'secret_revealed',
        'ultimate_guide', 'step_by_step', 'checklist', 'blueprint'
    ];
    const normalized = formula?.toLowerCase().replace(/-/g, '_') as HVCOFormula;
    return valid.includes(normalized) ? normalized : 'number_ways';
}

/**
 * Calculate total score
 */
function calculateTotalScore(scores: { intrigueScore: number; benefitScore: number; specificityScore: number }): number {
    return Math.round(
        scores.intrigueScore * 0.35 +
        scores.benefitScore * 0.35 +
        scores.specificityScore * 0.3
    );
}

/**
 * Generate fallback titles
 */
function generateFallbackTitles(
    context: AgentContext,
    problem: ProblemIdentificationResult,
    avatar: AvatarSynthesisResult
): HVCOTitle[] {
    const topic = context.topic;
    const painSummary = problem.primaryProblem.problem.slice(0, 30);

    const templates: { template: string; formula: HVCOFormula }[] = [
        {
            template: `7 Proven Ways to Master ${topic} (Without the Frustration)`,
            formula: 'number_ways'
        },
        {
            template: `How to Succeed with ${topic} Without ${painSummary}`,
            formula: 'how_to_without'
        },
        {
            template: `5 Costly Mistakes to Avoid When Starting with ${topic}`,
            formula: 'mistakes_to_avoid'
        },
        {
            template: `The Secret Top Performers Use to Excel at ${topic}`,
            formula: 'secret_revealed'
        },
        {
            template: `The Ultimate ${topic} Guide for ${new Date().getFullYear()}`,
            formula: 'ultimate_guide'
        },
        {
            template: `Step-by-Step: How to Master ${topic} in 30 Days`,
            formula: 'step_by_step'
        },
        {
            template: `The Complete ${topic} Checklist: 21 Essential Steps`,
            formula: 'checklist'
        },
        {
            template: `The ${topic} Blueprint: Your Roadmap to Success`,
            formula: 'blueprint'
        },
        {
            template: `9 Little-Known ${topic} Secrets That Change Everything`,
            formula: 'number_ways'
        },
        {
            template: `How to Overcome ${painSummary} and Finally Succeed`,
            formula: 'how_to_without'
        }
    ];

    return templates.map(t => {
        const scores = scoreTitle(t.template);
        return {
            title: t.template,
            formula: t.formula,
            ...scores,
            totalScore: calculateTotalScore(scores)
        };
    });
}

/**
 * Select recommended title
 */
function selectRecommendedTitle(titles: HVCOTitle[]): HVCOTitle {
    if (titles.length === 0) {
        return {
            title: 'The Ultimate Guide',
            formula: 'ultimate_guide',
            intrigueScore: 50,
            benefitScore: 50,
            specificityScore: 50,
            totalScore: 50
        };
    }

    // Sort by total score
    const sorted = [...titles].sort((a, b) => b.totalScore - a.totalScore);
    return sorted[0];
}

/**
 * Generate rationale for recommended title
 */
function generateRationale(title: HVCOTitle, problem: ProblemIdentificationResult): string {
    const reasons: string[] = [];

    if (title.intrigueScore >= 70) {
        reasons.push('creates strong curiosity');
    }
    if (title.benefitScore >= 70) {
        reasons.push('clearly communicates the benefit');
    }
    if (title.specificityScore >= 70) {
        reasons.push('uses specific, concrete language');
    }
    if (/\d+/.test(title.title)) {
        reasons.push('includes specific numbers for credibility');
    }
    if (INTRIGUE_WORDS.some(w => title.title.toLowerCase().includes(w))) {
        reasons.push('uses intrigue words that capture attention');
    }

    const reasonText = reasons.length > 0
        ? reasons.join(', ')
        : 'balances intrigue, benefit, and specificity';

    return `This title scores highest (${title.totalScore}/100) because it ${reasonText}. It directly addresses the identified pain point: "${problem.primaryProblem.problem.slice(0, 50)}..."`;
}

/**
 * Run Phase 6: HVCO Generation Agent
 */
export async function runHVCOAgent(
    env: AgentEnv,
    context: AgentContext,
    problemResult: ProblemIdentificationResult,
    avatarResult: AvatarSynthesisResult
): Promise<HVCOGenerationResult> {
    console.log(`[Phase 6] Starting HVCO Title Generation`);

    let titles: HVCOTitle[];

    try {
        titles = await generateTitlesWithAI(env, context, problemResult, avatarResult);
        console.log(`[Phase 6] AI generated ${titles.length} titles`);
    } catch (e) {
        console.log(`[Phase 6] Using fallback title generator`);
        titles = generateFallbackTitles(context, problemResult, avatarResult);
    }

    // Ensure we have at least 10 titles
    if (titles.length < 10) {
        const fallbacks = generateFallbackTitles(context, problemResult, avatarResult);
        titles = [...titles, ...fallbacks].slice(0, 12);
    }

    // Sort by score
    titles.sort((a, b) => b.totalScore - a.totalScore);

    const recommendedTitle = selectRecommendedTitle(titles);
    const rationale = generateRationale(recommendedTitle, problemResult);

    console.log(`[Phase 6] Recommended title: "${recommendedTitle.title}" (Score: ${recommendedTitle.totalScore})`);

    return {
        titles,
        recommendedTitle,
        rationale,
        timestamp: new Date().toISOString()
    };
}
