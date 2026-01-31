/**
 * QR-3: Content Sanitizer — strips AI meta-commentary and prompt leakage
 */

const LEAKAGE_PREFIXES = [
  /^here is the (?:generated |revised |rewritten |new |updated )?(?:content|version|tweet|post|thread|script)[\s:.,\n]*/i,
  /^here(?:'s| is) (?:a |the )?(?:rewritten |revised |updated |new )?(?:version|attempt|tweet|post|content)(?:[,\s].*?)?\s*[:.\n]+\s*/i,
  /^here's a new attempt[\s\S]*?[:.\n]+\s*/i,
  /^i'm ready to get started[\s\S]*?(?=\n\n|\*\*|$)/i,
  /^let(?:'s| me) get started[\s.!]*/i,
  /^let me (?:generate|create|write)[\s.!]*/i,
  /^you didn't provide the source material[\s\S]*/i,
  /^please (?:share|provide) the source material[\s\S]*/i,
  /^(?:sure|okay|alright)[,!.]?\s*(?:here|let)/i,
  /^(?:output|response|result)[\s:]*\n/i,
  /^(?:i've |i have )?(?:revised|rewritten|updated|created|generated) (?:the |a )?(?:content|version|tweet|post)[\s\S]*?[:.\n]+\s*/i,
];

const LEAKAGE_SUFFIXES = [
  /\n\s*note:\s*(?:the script|this (?:rewritten|content)|the content)[\s\S]*$/i,
  /\n\s*this (?:rewritten|revised) content (?:aligns|meets|follows)[\s\S]*$/i,
  /\n\s*(?:i hope|let me know|feel free)[\s\S]*$/i,
];

/**
 * Strip AI meta-commentary from generated content.
 * Returns cleaned content string.
 */
export function sanitizeContent(content: string): string {
  let cleaned = content.trim();

  // Strip prefix leakage (run twice to catch chained prefixes)
  for (let pass = 0; pass < 2; pass++) {
    for (const pattern of LEAKAGE_PREFIXES) {
      cleaned = cleaned.replace(pattern, '').trim();
    }
  }

  // Strip suffix leakage
  for (const pattern of LEAKAGE_SUFFIXES) {
    cleaned = cleaned.replace(pattern, '');
  }

  return cleaned.trim();
}

/**
 * Check if content contains known leakage patterns.
 * Returns array of detected patterns (empty = clean).
 */
export function detectLeakage(content: string): string[] {
  const detected: string[] = [];
  const lower = content.toLowerCase();

  const checks = [
    'here is the generated content',
    'here is the content',
    'here is the revised content',
    'here is the rewritten',
    "here's a rewritten",
    "i'm ready to get started",
    "you didn't provide the source material",
    'please share the source material',
    'please provide the source material',
    'let me generate',
    "let's get started",
  ];

  for (const check of checks) {
    if (lower.includes(check)) {
      detected.push(check);
    }
  }

  return detected;
}
