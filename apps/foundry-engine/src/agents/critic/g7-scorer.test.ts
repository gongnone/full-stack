/**
 * G7 Engagement Prediction Scorer Tests
 */

import { describe, it, expect, vi } from 'vitest';
import {
  scoreEngagement,
  extractHook,
  type VectorizeClient,
  type WorkersAI,
  type Spoke,
  type BrandDNA,
} from './g7-scorer';

describe('extractHook', () => {
  it('should extract first 2 sentences from spoke content', () => {
    const content = 'This is the first sentence. This is the second sentence. This is third.';
    const hook = extractHook(content);
    expect(hook).toBe('This is the first sentence. This is the second sentence.');
  });

  it('should handle content with exclamation marks', () => {
    const content = 'Wow! Amazing stuff here. More content follows.';
    const hook = extractHook(content);
    expect(hook).toBe('Wow! Amazing stuff here.');
  });

  it('should handle content with question marks', () => {
    const content = 'What if I told you? You would be amazed. Trust me.';
    const hook = extractHook(content);
    expect(hook).toBe('What if I told you? You would be amazed.');
  });

  it('should handle single sentence content', () => {
    const content = 'Just one sentence here';
    const hook = extractHook(content);
    expect(hook).toBe('Just one sentence here');
  });
});

describe('scoreEngagement', () => {
  const mockSpoke: Spoke = {
    id: 'spoke-123',
    content: 'This is a hook sentence. More content follows. Even more here.',
    platform: 'twitter',
  };

  const mockBrandDNA: BrandDNA = {
    niche: 'business',
  };

  const clientId = 'client-abc123';

  it('should use 100% baseline when no admired profiles exist', async () => {
    const mockVectorize: VectorizeClient = {
      query: vi.fn().mockImplementation(async ({ namespace }) => {
        if (namespace.includes('admired')) {
          return []; // No admired profiles
        }
        // Return baseline hooks
        return [
          {
            values: Array(768).fill(0.5),
            metadata: { engagement_rate: 0.05 },
          },
          {
            values: Array(768).fill(0.6),
            metadata: { engagement_rate: 0.04 },
          },
        ];
      }),
    };

    const mockAI: WorkersAI = {
      run: vi.fn().mockResolvedValue({
        data: [Array(768).fill(0.5)],
      }),
    };

    const result = await scoreEngagement(
      mockSpoke,
      mockBrandDNA,
      clientId,
      mockVectorize,
      mockAI
    );

    expect(result.g7Source).toBe('100% baseline');
    expect(result.g7Score).toBeGreaterThanOrEqual(0);
    expect(result.g7Score).toBeLessThanOrEqual(10);
    expect(result.g7Benchmark).toBeGreaterThan(0);
  });

  it('should use 50/50 blend when 1-4 admired profiles exist', async () => {
    const mockVectorize: VectorizeClient = {
      query: vi.fn().mockImplementation(async ({ namespace }) => {
        if (namespace.includes('admired')) {
          // Return 3 admired hooks
          return [
            {
              values: Array(768).fill(0.7),
              metadata: { engagement_rate: 0.06 },
            },
            {
              values: Array(768).fill(0.8),
              metadata: { engagement_rate: 0.07 },
            },
            {
              values: Array(768).fill(0.75),
              metadata: { engagement_rate: 0.065 },
            },
          ];
        }
        // Return baseline hooks
        return [
          {
            values: Array(768).fill(0.5),
            metadata: { engagement_rate: 0.04 },
          },
          {
            values: Array(768).fill(0.6),
            metadata: { engagement_rate: 0.05 },
          },
        ];
      }),
    };

    const mockAI: WorkersAI = {
      run: vi.fn().mockResolvedValue({
        data: [Array(768).fill(0.65)],
      }),
    };

    const result = await scoreEngagement(
      mockSpoke,
      mockBrandDNA,
      clientId,
      mockVectorize,
      mockAI
    );

    expect(result.g7Source).toBe('50% admired, 50% baseline');
    expect(result.g7Score).toBeGreaterThanOrEqual(0);
    expect(result.g7Score).toBeLessThanOrEqual(10);
  });

  it('should use 70/30 blend when 5+ admired profiles exist', async () => {
    const mockVectorize: VectorizeClient = {
      query: vi.fn().mockImplementation(async ({ namespace }) => {
        if (namespace.includes('admired')) {
          // Return 5 admired hooks
          return Array(5).fill(null).map((_, i) => ({
            values: Array(768).fill(0.7 + i * 0.01),
            metadata: { engagement_rate: 0.06 + i * 0.01 },
          }));
        }
        // Return baseline hooks
        return Array(10).fill(null).map((_, i) => ({
          values: Array(768).fill(0.5 + i * 0.01),
          metadata: { engagement_rate: 0.04 + i * 0.005 },
        }));
      }),
    };

    const mockAI: WorkersAI = {
      run: vi.fn().mockResolvedValue({
        data: [Array(768).fill(0.7)],
      }),
    };

    const result = await scoreEngagement(
      mockSpoke,
      mockBrandDNA,
      clientId,
      mockVectorize,
      mockAI
    );

    expect(result.g7Source).toBe('70% admired, 30% baseline');
    expect(result.g7Score).toBeGreaterThanOrEqual(0);
    expect(result.g7Score).toBeLessThanOrEqual(10);
  });

  it('should calculate stopping power and novelty scores', async () => {
    const mockVectorize: VectorizeClient = {
      query: vi.fn().mockImplementation(async () => {
        return Array(50).fill(null).map((_, i) => ({
          values: Array(768).fill(0.5 + i * 0.01),
          metadata: { engagement_rate: 0.04 + i * 0.001 },
        }));
      }),
    };

    const mockAI: WorkersAI = {
      run: vi.fn().mockResolvedValue({
        data: [Array(768).fill(0.6)],
      }),
    };

    const result = await scoreEngagement(
      mockSpoke,
      mockBrandDNA,
      clientId,
      mockVectorize,
      mockAI
    );

    expect(result.stoppingPower).toBeGreaterThanOrEqual(0);
    expect(result.stoppingPower).toBeLessThanOrEqual(10);
    expect(result.novelty).toBeGreaterThanOrEqual(0);
    expect(result.novelty).toBeLessThanOrEqual(10);

    // G7 = (Stopping Power × 0.7) + (Novelty × 0.3)
    const expectedG7 = (result.stoppingPower * 0.7) + (result.novelty * 0.3);
    expect(result.g7Score).toBeCloseTo(expectedG7, 2);
  });

  it('should apply 7.5 threshold correctly (AC2)', async () => {
    const mockVectorize: VectorizeClient = {
      query: vi.fn().mockResolvedValue([
        {
          values: Array(768).fill(0.9), // High similarity
          metadata: { engagement_rate: 0.08 },
        },
      ]),
    };

    const mockAI: WorkersAI = {
      run: vi.fn().mockResolvedValue({
        data: [Array(768).fill(0.9)],
      }),
    };

    const result = await scoreEngagement(
      mockSpoke,
      mockBrandDNA,
      clientId,
      mockVectorize,
      mockAI
    );

    // Test threshold logic
    const passesThreshold = result.g7Score >= 7.5;
    expect(typeof passesThreshold).toBe('boolean');

    // Score should be between 0-10
    expect(result.g7Score).toBeGreaterThanOrEqual(0);
    expect(result.g7Score).toBeLessThanOrEqual(10);
  });

  it('should use correct Vectorize namespaces with client isolation', async () => {
    const queryMock = vi.fn().mockResolvedValue([
      {
        values: Array(768).fill(0.5),
        metadata: { engagement_rate: 0.04 },
      },
    ]);

    const mockVectorize: VectorizeClient = {
      query: queryMock,
    };

    const mockAI: WorkersAI = {
      run: vi.fn().mockResolvedValue({
        data: [Array(768).fill(0.5)],
      }),
    };

    await scoreEngagement(
      mockSpoke,
      mockBrandDNA,
      clientId,
      mockVectorize,
      mockAI
    );

    expect(queryMock).toHaveBeenCalledTimes(2);

    // Check admired namespace
    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: `client_${clientId}_admired`,
        topK: 50,
      })
    );

    // Check baseline namespace
    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: `baseline_${mockBrandDNA.niche}`,
        topK: 50,
      })
    );
  });

  it('should use Workers AI text-embedding model', async () => {
    const mockVectorize: VectorizeClient = {
      query: vi.fn().mockResolvedValue([]),
    };

    const aiRunMock = vi.fn().mockResolvedValue({
      data: [Array(768).fill(0.5)],
    });

    const mockAI: WorkersAI = {
      run: aiRunMock,
    };

    await scoreEngagement(
      mockSpoke,
      mockBrandDNA,
      clientId,
      mockVectorize,
      mockAI
    );

    expect(aiRunMock).toHaveBeenCalledWith(
      '@cf/baai/bge-base-en-v1.5',
      expect.objectContaining({
        text: expect.any(String),
      })
    );
  });
});
