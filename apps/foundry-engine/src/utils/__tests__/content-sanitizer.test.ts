import { describe, it, expect } from 'vitest';
import { sanitizeContent, detectLeakage } from '../content-sanitizer';

describe('Content Sanitizer', () => {
  describe('sanitizeContent — prefix stripping', () => {
    const cases: [string, string, string][] = [
      ['basic "Here is the content:"', 'Here is the generated content:\n\nYour small business rocks.', 'Your small business rocks.'],
      ['"Here is the content:" no qualifier', 'Here is the content:\n\n1/7 Want to know...', '1/7 Want to know...'],
      ['"Here\'s a rewritten version"', "Here's a rewritten version of the content, tailored to the brand:\n\n**Hook**", '**Hook**'],
      ['"Here is the regenerated content:"', 'Here is the regenerated content:\n\n🔥 Breaking news...', '🔥 Breaking news...'],
      ['"Here\'s the revised content:"', "Here's the revised content:\n\nSlide 1: Hook", 'Slide 1: Hook'],
      ['"Sure! Here is"', "Sure! Here is the improved content:\n\nBold claim here.", 'Bold claim here.'],
      ['"I\'ve regenerated"', "I've regenerated the content based on feedback:\n\nNew hook here.", 'New hook here.'],
      ['"I\'m ready to get started"', "I'm ready to get started. Please share the source material.\n\n**Slide 1:**", '**Slide 1:**'],
      ['"You didn\'t provide"', "You didn't provide the source material. Please provide it and I'll generate.", ''],
      ['"Absolutely! Here\'s"', "Absolutely! Here's the updated post:\n\n📊 Data shows...", '📊 Data shows...'],
      ['"Attempt 2:"', "Attempt 2:\n\nFresh take on the topic...", 'Fresh take on the topic...'],
      ['"Regenerated content"', "Regenerated content based on G2 feedback:\n\nPowerful opener.", 'Powerful opener.'],
      ['chained prefixes', "Sure! Here is the regenerated content:\n\nHere's what I came up with:\n\nActual content.", 'Actual content.'],
    ];

    for (const [name, input, expected] of cases) {
      it(`strips ${name}`, () => {
        expect(sanitizeContent(input)).toBe(expected);
      });
    }
  });

  describe('sanitizeContent — suffix stripping', () => {
    it('strips "Note: This rewritten content aligns" suffix', () => {
      expect(sanitizeContent('Great content.\n\nNote: This rewritten content aligns with brand voice.'))
        .toBe('Great content.');
    });

    it('strips "I hope this helps" suffix', () => {
      expect(sanitizeContent('Content here.\n\nI hope this helps! Let me know if you need changes.'))
        .toBe('Content here.');
    });

    it('strips "Word count: 280" suffix', () => {
      expect(sanitizeContent('Post content.\n\nWord count: 280'))
        .toBe('Post content.');
    });
  });

  describe('sanitizeContent — clean content preserved', () => {
    it('preserves clean tweet', () => {
      const clean = '"Your competitors are NOT who you think. #SmallBusiness"';
      expect(sanitizeContent(clean)).toBe(clean);
    });

    it('preserves clean carousel', () => {
      const clean = '**Slide 1: Hook**\nThe $1 Trillion Myth\n\n**Slide 2:**\nHere is where most fail.';
      expect(sanitizeContent(clean)).toBe(clean);
    });

    it('preserves "here" in body text', () => {
      const clean = 'Want to know the truth? Here is what nobody tells you about growth.';
      expect(sanitizeContent(clean)).toBe(clean);
    });
  });

  describe('detectLeakage', () => {
    it('detects "Here is the" in content body', () => {
      expect(detectLeakage('Here is the generated content:\n\nStuff').length).toBeGreaterThan(0);
    });

    it('returns empty for clean content', () => {
      expect(detectLeakage('Bold claim about industry disruption. #Growth')).toHaveLength(0);
    });
  });
});
