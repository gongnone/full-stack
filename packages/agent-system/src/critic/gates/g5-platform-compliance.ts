// Forward declaring to avoid import errors
type Spoke = any;

export interface G5Violation {
    type: 'char_limit' | 'format' | 'structure';
    message: string;
    actual?: number;
    expected?: number;
}

export interface G5Result {
    result: 'pass' | 'fail';
    platform: string;
    violations: G5Violation[];
}
  
const PLATFORM_RULES:any = {
    twitter: { maxChars: 280, hashtagLimit: 3 },
    linkedin: { maxChars: 3000, paragraphBreaks: true },
    tiktok: { maxWords: 150, scriptFormat: true },
    instagram: { maxChars: 2200, emojiAllowed: true },
    newsletter: { maxWords: 500, sectionsRequired: false },
    thread: { minPosts: 5, maxPosts: 7, hookRequired: true },
    carousel: { minSlides: 5, maxSlides: 8, slideMaxChars: 200 },
};

export async function evaluateG5(spoke: any): Promise<G5Result> {
    const rules = PLATFORM_RULES[spoke.platform];
    const violations: G5Violation[] = [];

    if (!rules) {
        return {
            result: 'fail',
            platform: spoke.platform,
            violations: [{
                type: 'structure',
                message: `No rules found for platform ${spoke.platform}`
            }],
        };
    }

    const content = spoke.content || "";

    // 1. Character/Word Limit Checks
    if (rules.maxChars && content.length > rules.maxChars) {
      violations.push({
        type: 'char_limit',
        message: `Exceeds ${rules.maxChars} character limit`,
        actual: content.length,
        expected: rules.maxChars,
      });
    }

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    if (rules.maxWords && wordCount > rules.maxWords) {
        violations.push({
            type: 'char_limit',
            message: `Exceeds ${rules.maxWords} word limit`,
            actual: wordCount,
            expected: rules.maxWords,
        });
    }

    // 2. Platform-Specific Format/Structure Checks
    if (spoke.platform === 'twitter' || spoke.platform === 'instagram') {
        const hashtagCount = (content.match(/#/g) || []).length;
        const limit = rules.hashtagLimit || 5;
        if (hashtagCount > limit) {
            violations.push({
                type: 'format',
                message: `Too many hashtags (${hashtagCount}). Limit is ${limit}.`,
                actual: hashtagCount,
                expected: limit,
            });
        }
    }

    if (spoke.platform === 'thread') {
        // Simple check for sequential indicators like "1/" or "1/n"
        const hasSequence = /1\//.test(content) || /1\./.test(content);
        if (!hasSequence) {
            violations.push({
                type: 'structure',
                message: 'Thread missing sequential indicators (e.g., "1/")'
            });
        }
    }

    if (spoke.platform === 'carousel') {
        // Expecting something like "Slide 1:", "Slide 2:", etc.
        const slideMatches = content.match(/Slide \d+/gi) || [];
        const slideCount = slideMatches.length;
        if (slideCount < (rules.minSlides || 5)) {
            violations.push({
                type: 'structure',
                message: `Carousel needs at least ${rules.minSlides || 5} slides. Found ${slideCount}.`,
                actual: slideCount,
                expected: rules.minSlides || 5
            });
        }
    }

    return {
      result: violations.length === 0 ? 'pass' : 'fail',
      platform: spoke.platform,
      violations,
    };
}
