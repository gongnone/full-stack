/**
 * QR-3: Content Sanitizer — aggressively strips AI meta-commentary and prompt leakage
 * 
 * Strategy: Run prefix patterns in a loop until no more matches. This handles
 * chained preambles like "Sure! Here is the regenerated content:\n\n..."
 */

const LEAKAGE_PREFIXES: RegExp[] = [
  // "Here is/Here's" variants — the most common leakage
  /^here(?:'s| is) (?:the |a |my |your |an )?(?:generated |revised |rewritten |regenerated |new |updated |improved |alternative |final )?(?:content|version|tweet|post|thread|script|text|copy|caption|article|response|output|variation|attempt)(?:\s*(?:for|that|which|,|:|\.)[\s\S]*?)?\s*[:.\n]+\s*/i,
  /^here(?:'s| is) (?:the |a |my )?(?:rewritten |revised |updated |new |improved )?(?:version|attempt)[\s\S]*?[:.\n]+\s*/i,
  /^here(?:'s| is) (?:what i |the )[\s\S]*?[:.\n]+\s*/i,
  
  // Meta-commentary openers
  /^(?:sure|okay|alright|absolutely|of course|certainly|great)[,!.\s]*(?:here|let|i'(?:ll|ve|m))[\s\S]*?[:.\n]+\s*/i,
  /^(?:i've |i have |i )(?:revised|rewritten|updated|created|generated|regenerated|improved|crafted|written)[\s\S]*?[:.\n]+\s*/i,
  /^(?:i'm ready|let me|let's|allow me)[\s\S]*?(?:\n\n|\*\*|$)/i,
  
  // Source material complaints
  /^(?:you didn't|you haven't|i don't see|i notice|there(?:'s| is) no) (?:provide|share|include|see)[\s\S]*/i,
  /^please (?:share|provide|send|include) (?:the |your )?source[\s\S]*/i,
  
  // Instruction echoes
  /^(?:output|response|result|answer|content)[\s:]*\n+/i,
  /^(?:note|disclaimer|important)[\s:]+(?:this|the|i)[\s\S]*?\n\n/i,
  
  // Attempt/regeneration references
  /^(?:attempt|try|revision|version|draft|take) \d[\s:.\-]*\n*/i,
  /^(?:regenerat|rewrit|revis)(?:ed|ing) (?:content|version|the)[\s\S]*?[:.\n]+\s*/i,
  
  // Transition phrases after stripping
  /^(?:so,?\s+|now,?\s+|okay,?\s+|well,?\s+|right,?\s+)/i,
];

const LEAKAGE_SUFFIXES: RegExp[] = [
  /\n\s*(?:note|disclaimer|p\.?s\.?|nb)[\s:]+[\s\S]*$/i,
  /\n\s*(?:this |the )(?:rewritten|revised|regenerated|improved|above) (?:content|version|post|text) (?:aligns|meets|follows|addresses|incorporates|fixes)[\s\S]*$/i,
  /\n\s*(?:i hope|let me know|feel free|please let|happy to|if you)[\s\S]*$/i,
  /\n\s*(?:word count|character count|length)[\s:]\s*\d+[\s\S]*$/i,
  /\n\s*---\s*\n[\s\S]*$/i,  // Strip anything after a horizontal rule at end
];

/**
 * Aggressively strip AI meta-commentary from generated content.
 * Runs multiple passes to handle nested/chained leakage.
 */
export function sanitizeContent(content: string): string {
  if (!content) return '';
  let cleaned = content.trim();
  
  // Run up to 5 passes to strip chained prefixes
  for (let pass = 0; pass < 5; pass++) {
    const before = cleaned;
    for (const pattern of LEAKAGE_PREFIXES) {
      cleaned = cleaned.replace(pattern, '').trim();
    }
    if (cleaned === before) break; // No more changes
  }

  // Strip suffix leakage
  for (const pattern of LEAKAGE_SUFFIXES) {
    cleaned = cleaned.replace(pattern, '').trim();
  }

  // Final cleanup: strip leading quotes/dashes if they got exposed
  cleaned = cleaned.replace(/^["']\s*\n/, '').trim();
  
  return cleaned;
}

/**
 * Check if content still contains known leakage patterns after sanitization.
 * Returns array of detected patterns (empty = clean).
 */
export function detectLeakage(content: string): string[] {
  const detected: string[] = [];
  const lower = content.toLowerCase();

  const checks = [
    'here is the',
    "here's the",
    "here's a",
    "here's my",
    'here is my',
    "i'm ready to",
    "you didn't provide",
    'please share the source',
    'please provide the source',
    'let me generate',
    "let's get started",
    'regenerated content',
    'revised content',
    'rewritten content',
    'improved version',
  ];

  for (const check of checks) {
    if (lower.includes(check)) {
      detected.push(check);
    }
  }

  return detected;
}
