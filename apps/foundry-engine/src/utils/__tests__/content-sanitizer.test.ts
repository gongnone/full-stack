import { describe, it, expect } from 'vitest';
import { sanitizeContent, detectLeakage } from '../content-sanitizer';

describe('QR-3: Content Sanitizer', () => {
  describe('sanitizeContent', () => {
    it('strips "Here is the generated content:" prefix', () => {
      const result = sanitizeContent('Here is the generated content:\n\nYour small business is NOT invisible.');
      expect(result).toBe('Your small business is NOT invisible.');
    });

    it('strips "Here is the content:" prefix', () => {
      const result = sanitizeContent('Here is the content:\n\n1/7 Want to know the secret...');
      expect(result).toBe('1/7 Want to know the secret...');
    });

    it('strips "Here\'s a rewritten version" prefix', () => {
      const result = sanitizeContent("Here's a rewritten version of the content, tailored to the brand:\n\n**Hook**");
      expect(result).toBe('**Hook**');
    });

    it('strips "I\'m ready to get started" prefix', () => {
      const result = sanitizeContent("I'm ready to get started. Please share the source material.\n\n**Slide 1:**");
      expect(result).toBe('**Slide 1:**');
    });

    it('strips "Note: This rewritten content aligns" suffix', () => {
      const result = sanitizeContent('Great content here.\n\nNote: This rewritten content aligns with the brand voice and platform requirements.');
      expect(result).toBe('Great content here.');
    });

    it('preserves clean content unchanged', () => {
      const clean = 'Your competitors are NOT who you think they are. #SmallBusiness';
      expect(sanitizeContent(clean)).toBe(clean);
    });

    it('handles multiple leakage patterns', () => {
      const result = sanitizeContent("Here is the generated content:\n\nGreat stuff.\n\nNote: The script is within the limit.");
      expect(result).toBe('Great stuff.');
    });

    it('strips "You didn\'t provide the source material"', () => {
      const result = sanitizeContent("You didn't provide the source material. Please provide the source material, and I'll generate the content.");
      expect(result).toBe('');
    });
  });

  describe('detectLeakage', () => {
    it('detects leakage in dirty content', () => {
      const leaks = detectLeakage('Here is the generated content:\n\nYour biz rocks.');
      expect(leaks.length).toBeGreaterThan(0);
      expect(leaks).toContain('here is the generated content');
    });

    it('returns empty for clean content', () => {
      const leaks = detectLeakage('Your small business is NOT invisible. #Growth');
      expect(leaks).toHaveLength(0);
    });

    it('detects "you didn\'t provide" leakage', () => {
      const leaks = detectLeakage("You didn't provide the source material.");
      expect(leaks.length).toBeGreaterThan(0);
    });
  });
});
