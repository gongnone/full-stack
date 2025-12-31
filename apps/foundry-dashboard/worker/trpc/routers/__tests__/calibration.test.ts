import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calibrationRouter, calculateDrift } from '../calibration';
import { createMockContext } from './utils';
import { TRPCError } from '@trpc/server';

describe('calibrationRouter', () => {
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mockCtx = createMockContext();
    vi.clearAllMocks();
  });

  describe('listSamples', () => {
    it('returns a list of training samples with badges', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const input = { clientId: '00000000-0000-0000-0000-000000000000', limit: 10 };

      const mockSamples = [
        { id: 's1', status: 'analyzed', quality_score: 95, title: 'Sample 1' },
        { id: 's2', status: 'pending', quality_score: null, title: 'Sample 2' },
      ];

      mockDb.all.mockResolvedValue({ results: mockSamples });
      mockDb.first.mockResolvedValue({ total: 2 });

      const result = await caller.listSamples(input);

      expect(result.samples).toHaveLength(2);
      expect(result.samples[0]!.qualityBadge).toBe('excellent');
      expect(result.samples[1]!.qualityBadge).toBe('pending');
    });
  });

  describe('createTextSample', () => {
    it('creates a sample and triggers calibration', async () => {
      const { ctx, mockDb, mockFetch } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        title: 'New Text',
        content: 'This is a long enough text for a sample.',
      };

      mockDb.run.mockResolvedValue({ success: true });
      mockFetch.mockResolvedValue({ ok: true });

      const result = await caller.createTextSample(input);

      // Verified via Drizzle mock in utils, focused on side effect here
      expect(mockFetch).toHaveBeenCalledWith(
        'http://engine/api/calibration/start',
        expect.objectContaining({ method: 'POST' })
      );
      expect(result.status).toBe('pending');
    });
  });

  describe('getSampleStats', () => {
    it('returns aggregate stats and recommendations', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const input = { clientId: '00000000-0000-0000-0000-000000000000' };

      // Mock run to return results array for Drizzle sql template
      mockDb.run.mockResolvedValue({
        results: [{
          total_samples: 5,
          total_words: 1200,
          avg_quality: 85,
          analyzed_count: 4,
          pending_count: 1,
        }]
      });

      const result = await caller.getSampleStats(input);

      expect(result.totalSamples).toBe(5);
      expect(result.recommendation).toContain('Good start');
    });
  });

  describe('analyzeDNA', () => {
    it('throws error if less than 3 samples exist', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const input = { clientId: '00000000-0000-0000-0000-000000000000' };

      mockDb.all.mockResolvedValue({ results: [{ id: 's1' }, { id: 's2' }] }); // Only 2 samples

      await expect(caller.analyzeDNA(input)).rejects.toThrow(TRPCError);
    });
  });

  // Story 9.2: Drift Detection Tests
  describe('getDriftStatus', () => {
    it('returns drift score of 0 when no baseline snapshot exists', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const input = { clientId: '00000000-0000-0000-0000-000000000000' };

      // No snapshot found
      mockDb.first.mockResolvedValueOnce(null); // baseline snapshot
      // mockDb.first.mockResolvedValueOnce(null); // current brand_dna (not reached if baseline is null)
      // mockDb.first.mockResolvedValueOnce({ drift_threshold: 25 }); // client settings (not reached)

      const result = await caller.getDriftStatus(input);

      expect(result.driftScore).toBe(0);
      expect(result.needsCalibration).toBe(false);
    });

    it('calculates drift when voice markers change', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const input = { clientId: '00000000-0000-0000-0000-000000000000' };

      // Baseline snapshot with 5 voice markers
      mockDb.first.mockResolvedValueOnce({
        voice_markers: JSON.stringify(['phrase1', 'phrase2', 'phrase3', 'phrase4', 'phrase5']),
        banned_words: JSON.stringify([]),
        stances: JSON.stringify([]),
        primary_tone: 'Candid',
      });
      // Current Brand DNA with 2 voice markers (3 removed)
      mockDb.first.mockResolvedValueOnce({
        voice_entities: JSON.stringify({
          voiceMarkers: ['phrase1', 'phrase2'],
          bannedWords: [],
          stances: [],
        }),
        primary_tone: 'Candid',
      });
      // Client threshold - lower to ensure trigger is set for 18% drift
      mockDb.first.mockResolvedValueOnce({ drift_threshold: 15 });

      const result = await caller.getDriftStatus(input);

      // Expect drift due to voice marker changes
      expect(result.driftScore).toBeGreaterThan(0);
      expect(result.trigger).toBeDefined();
    });

    it('returns needsCalibration true when drift exceeds threshold', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const input = { clientId: '00000000-0000-0000-0000-000000000000' };

      // Significant drift scenario - major changes in all areas
      mockDb.first.mockResolvedValueOnce({
        voice_markers: JSON.stringify(['old1', 'old2', 'old3', 'old4', 'old5']),
        banned_words: JSON.stringify(['ban1', 'ban2', 'ban3']),
        stances: JSON.stringify([{ topic: 'AI', position: 'pro' }]),
        primary_tone: 'Formal',
      });
      mockDb.first.mockResolvedValueOnce({
        voice_entities: JSON.stringify({
          voiceMarkers: ['new1', 'new2'],
          bannedWords: ['ban4', 'ban5'],
          stances: [{ topic: 'AI', position: 'cautious' }],
        }),
        primary_tone: 'Casual',
      });
      mockDb.first.mockResolvedValueOnce({ drift_threshold: 25 });

      const result = await caller.getDriftStatus(input);

      expect(result.needsCalibration).toBe(true);
      expect(result.suggestion).toBeDefined();
    });

    it('provides actionable suggestion when drift detected', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const input = { clientId: '00000000-0000-0000-0000-000000000000' };

      // Voice markers significantly changed
      mockDb.first.mockResolvedValueOnce({
        voice_markers: JSON.stringify(['phrase1', 'phrase2', 'phrase3', 'phrase4']),
        banned_words: JSON.stringify([]),
        stances: JSON.stringify([]),
        primary_tone: 'Professional',
      });
      mockDb.first.mockResolvedValueOnce({
        voice_entities: JSON.stringify({
          voiceMarkers: [],
          bannedWords: [],
          stances: [],
        }),
        primary_tone: 'Professional',
      });
      mockDb.first.mockResolvedValueOnce({ drift_threshold: 25 });

      const result = await caller.getDriftStatus(input);

      expect(result.driftScore).toBeGreaterThan(25);
      expect(result.suggestion).toContain('voice markers');
    });
  });

  describe('createDNASnapshot', () => {
    it('creates a snapshot of current Brand DNA', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const input = { clientId: '00000000-0000-0000-0000-000000000000' };

      mockDb.first.mockResolvedValueOnce({
        voice_entities: JSON.stringify({
          voiceMarkers: ['phrase1'],
          bannedWords: ['jargon'],
          stances: [],
        }),
        primary_tone: 'Candid',
        writing_style: 'Conversational',
        target_audience: 'Founders',
        strength_score: 75,
      });
      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.createDNASnapshot(input);

      expect(result.success).toBe(true);
      expect(result.snapshotId).toBeDefined();
    });
  });
});

// Unit tests for the drift calculation algorithm (pure function)
describe('calculateDrift', () => {
  it('returns 0 when baseline and current are identical', () => {
    const baseline = {
      voiceMarkers: ['phrase1', 'phrase2'],
      bannedWords: ['word1'],
      stances: [{ topic: 'AI', position: 'pro' }],
      primaryTone: 'Candid',
    };
    const current = { ...baseline };

    const result = calculateDrift(baseline, current);

    expect(result.driftScore).toBe(0);
    expect(result.needsCalibration).toBe(false);
  });

  it('calculates voice marker drift correctly (30% weight)', () => {
    const baseline = {
      voiceMarkers: ['p1', 'p2', 'p3', 'p4', 'p5'],
      bannedWords: [],
      stances: [],
      primaryTone: 'Candid',
    };
    const current = {
      voiceMarkers: ['p1', 'p2'], // 3 removed = 60% change
      bannedWords: [],
      stances: [],
      primaryTone: 'Candid',
    };

    const result = calculateDrift(baseline, current);

    // 60% change * 0.3 weight = 18 points
    expect(result.driftScore).toBeCloseTo(18, 0);
    expect(result.components.voiceMarkerDrift).toBeCloseTo(60, 0);
  });

  it('calculates banned word drift correctly (20% weight)', () => {
    const baseline = {
      voiceMarkers: [],
      bannedWords: ['w1', 'w2', 'w3', 'w4', 'w5'],
      stances: [],
      primaryTone: 'Candid',
    };
    const current = {
      voiceMarkers: [],
      bannedWords: ['w1'], // 4 removed = 80% change
      stances: [],
      primaryTone: 'Candid',
    };

    const result = calculateDrift(baseline, current);

    // 80% change * 0.2 weight = 16 points
    expect(result.driftScore).toBeCloseTo(16, 0);
    expect(result.components.bannedWordDrift).toBeCloseTo(80, 0);
  });

  it('calculates stance drift correctly (30% weight)', () => {
    const baseline = {
      voiceMarkers: [],
      bannedWords: [],
      stances: [
        { topic: 'AI', position: 'pro' },
        { topic: 'Remote Work', position: 'advocate' },
      ],
      primaryTone: 'Candid',
    };
    const current = {
      voiceMarkers: [],
      bannedWords: [],
      stances: [{ topic: 'AI', position: 'cautious' }], // 1 changed position, 1 removed
      primaryTone: 'Candid',
    };

    const result = calculateDrift(baseline, current);

    // Significant stance change should contribute to drift
    expect(result.driftScore).toBeGreaterThan(15);
    expect(result.components.stanceDrift).toBeGreaterThan(0);
  });

  it('calculates tone drift correctly (20% weight)', () => {
    const baseline = {
      voiceMarkers: [],
      bannedWords: [],
      stances: [],
      primaryTone: 'Formal & Professional',
    };
    const current = {
      voiceMarkers: [],
      bannedWords: [],
      stances: [],
      primaryTone: 'Casual & Friendly',
    };

    const result = calculateDrift(baseline, current);

    // Complete tone change = 100% * 0.2 weight = 20 points
    expect(result.driftScore).toBeCloseTo(20, 0);
    expect(result.components.toneDrift).toBe(100);
  });

  it('combines all drift components correctly', () => {
    const baseline = {
      voiceMarkers: ['p1', 'p2', 'p3', 'p4'],
      bannedWords: ['w1', 'w2', 'w3', 'w4'],
      stances: [{ topic: 'AI', position: 'pro' }],
      primaryTone: 'Professional',
    };
    const current = {
      voiceMarkers: ['p1', 'p2'], // 50% change
      bannedWords: ['w1', 'w2'], // 50% change
      stances: [], // 100% change
      primaryTone: 'Casual', // 100% change
    };

    const result = calculateDrift(baseline, current);

    // Expected: (50*0.3) + (50*0.2) + (100*0.3) + (100*0.2) = 15 + 10 + 30 + 20 = 75
    expect(result.driftScore).toBeCloseTo(75, 0);
    expect(result.needsCalibration).toBe(true);
  });

  it('respects custom threshold for needsCalibration', () => {
    const baseline = {
      voiceMarkers: ['p1', 'p2', 'p3', 'p4'],
      bannedWords: [],
      stances: [],
      primaryTone: 'Candid',
    };
    const current = {
      voiceMarkers: ['p1', 'p2', 'p3'], // 25% change = 7.5 drift score
      bannedWords: [],
      stances: [],
      primaryTone: 'Candid',
    };

    // With default threshold (25), should NOT need calibration
    const result1 = calculateDrift(baseline, current, 25);
    expect(result1.needsCalibration).toBe(false);

    // With lower threshold (5), SHOULD need calibration
    const result2 = calculateDrift(baseline, current, 5);
    expect(result2.needsCalibration).toBe(true);
  });
});

// Integration test for full drift detection flow
describe('Drift Detection Integration', () => {
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mockCtx = createMockContext();
    vi.clearAllMocks();
  });

  it('creates snapshot and detects drift in end-to-end flow', async () => {
    const { ctx, mockDb } = mockCtx;
    const caller = calibrationRouter.createCaller(ctx);
    const clientId = '00000000-0000-0000-0000-000000000000';

    // Step 1: Create initial snapshot
    mockDb.first.mockResolvedValueOnce({
      voice_entities: JSON.stringify({
        voiceMarkers: ['phrase1', 'phrase2', 'phrase3'],
        bannedWords: ['jargon', 'synergy'],
        stances: [{ topic: 'AI', position: 'pro' }],
      }),
      primary_tone: 'Candid & Direct',
      writing_style: 'Conversational',
      target_audience: 'Founders',
      strength_score: 75,
    });
    mockDb.run.mockResolvedValue({ success: true });

    const snapshotResult = await caller.createDNASnapshot({ clientId });
    expect(snapshotResult.success).toBe(true);

    // Step 2: Check drift status (no change yet, same data)
    mockDb.first
      .mockResolvedValueOnce({
        voice_markers: JSON.stringify(['phrase1', 'phrase2', 'phrase3']),
        banned_words: JSON.stringify(['jargon', 'synergy']),
        stances: JSON.stringify([{ topic: 'AI', position: 'pro' }]),
        primary_tone: 'Candid & Direct',
      })
      .mockResolvedValueOnce({
        voice_entities: JSON.stringify({
          voiceMarkers: ['phrase1', 'phrase2', 'phrase3'],
          bannedWords: ['jargon', 'synergy'],
          stances: [{ topic: 'AI', position: 'pro' }],
        }),
        primary_tone: 'Candid & Direct',
      })
      .mockResolvedValueOnce({ drift_threshold: 25 });

    const noDriftResult = await caller.getDriftStatus({ clientId });
    expect(noDriftResult.driftScore).toBe(0);
    expect(noDriftResult.needsCalibration).toBe(false);

    // Step 3: Simulate significant changes in Brand DNA
    mockDb.first
      .mockResolvedValueOnce({
        voice_markers: JSON.stringify(['phrase1', 'phrase2', 'phrase3']),
        banned_words: JSON.stringify(['jargon', 'synergy']),
        stances: JSON.stringify([{ topic: 'AI', position: 'pro' }]),
        primary_tone: 'Candid & Direct',
      })
      .mockResolvedValueOnce({
        voice_entities: JSON.stringify({
          voiceMarkers: [], // All voice markers removed
          bannedWords: ['corp-speak'], // Different banned words
          stances: [{ topic: 'AI', position: 'skeptical' }], // Changed stance
        }),
        primary_tone: 'Formal & Professional', // Changed tone
      })
      .mockResolvedValueOnce({ drift_threshold: 25 });

    const driftResult = await caller.getDriftStatus({ clientId });

    // Verify drift is detected
    expect(driftResult.driftScore).toBeGreaterThan(25);
    expect(driftResult.needsCalibration).toBe(true);
    expect(driftResult.trigger).toBeDefined();
    expect(driftResult.suggestion).toBeDefined();
  });

  it('respects per-client drift threshold', async () => {
    const { ctx, mockDb } = mockCtx;
    const caller = calibrationRouter.createCaller(ctx);
    const clientId = '00000000-0000-0000-0000-000000000000';

    // Minor change that exceeds low threshold but not high
    mockDb.first
      .mockResolvedValueOnce({
        voice_markers: JSON.stringify(['p1', 'p2', 'p3', 'p4', 'p5']),
        banned_words: JSON.stringify([]),
        stances: JSON.stringify([]),
        primary_tone: 'Candid',
      })
      .mockResolvedValueOnce({
        voice_entities: JSON.stringify({
          voiceMarkers: ['p1', 'p2', 'p3', 'p4'], // 1 removed = 20% change = 6 drift
          bannedWords: [],
          stances: [],
        }),
        primary_tone: 'Candid',
      })
      .mockResolvedValueOnce({ drift_threshold: 10 }); // Very sensitive client

    const sensitiveResult = await caller.getDriftStatus({ clientId });
    expect(sensitiveResult.needsCalibration).toBe(false); // 6 < 10

    // Same data with even lower threshold
    mockDb.first
      .mockResolvedValueOnce({
        voice_markers: JSON.stringify(['p1', 'p2', 'p3', 'p4', 'p5']),
        banned_words: JSON.stringify([]),
        stances: JSON.stringify([]),
        primary_tone: 'Candid',
      })
      .mockResolvedValueOnce({
        voice_entities: JSON.stringify({
          voiceMarkers: ['p1', 'p2', 'p3', 'p4'],
          bannedWords: [],
          stances: [],
        }),
        primary_tone: 'Candid',
      })
      .mockResolvedValueOnce({ drift_threshold: 5 }); // Very very sensitive

    const veryDriftResult = await caller.getDriftStatus({ clientId });
    expect(veryDriftResult.needsCalibration).toBe(true); // 6 > 5
  });
});

// Story R-11: Voice Recording & Brand DNA Security Remediation Tests
// NOTE: These tests verify pure validation logic that doesn't depend on DB queries
// Tests using DB-dependent mutations (addBannedWord, etc.) are skipped as they require
// full Drizzle mock setup. The implementation is verified via E2E tests.
describe('Story R-11: Voice Recording Security', () => {
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mockCtx = createMockContext();
    vi.clearAllMocks();
  });

  // Task 6.1: Voice recording path validation tests
  describe('getVoiceUploadUrl', () => {
    it('validates audio file extensions', async () => {
      const { ctx } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const clientId = '00000000-0000-0000-0000-000000000000';

      // Valid extensions should succeed
      const validResult = await caller.getVoiceUploadUrl({ clientId, filename: 'test.webm' });
      expect(validResult.r2Key).toContain('voice-samples/');
      expect(validResult.r2Key).toContain(clientId);

      // Invalid extension should throw
      await expect(caller.getVoiceUploadUrl({ clientId, filename: 'test.pdf' }))
        .rejects.toThrow('Invalid audio format');
    });

    it('uses voice-samples prefix for voice uploads', async () => {
      const { ctx } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const clientId = '00000000-0000-0000-0000-000000000000';

      const result = await caller.getVoiceUploadUrl({ clientId, filename: 'voice.mp3' });
      expect(result.r2Key.startsWith(`voice-samples/${clientId}/`)).toBe(true);
    });
  });

  describe('recordVoice path validation', () => {
    it('rejects brand-samples prefix for voice', async () => {
      const { ctx } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const clientId = '00000000-0000-0000-0000-000000000000';

      await expect(caller.recordVoice({
        clientId,
        audioR2Key: `brand-samples/${clientId}/12345-test.webm`,
      })).rejects.toThrow('client isolation violation');
    });

    it('rejects cross-client paths', async () => {
      const { ctx } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const clientId = '00000000-0000-0000-0000-000000000000';
      const otherClientId = '11111111-1111-1111-1111-111111111111';

      await expect(caller.recordVoice({
        clientId,
        audioR2Key: `voice-samples/${otherClientId}/12345-test.webm`,
      })).rejects.toThrow('client isolation violation');
    });
  });

  describe('Auth checks on implemented procedures', () => {
    it('getDriftStatus with valid access returns data', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const clientId = '00000000-0000-0000-0000-000000000000';

      // No snapshot found case
      mockDb.first.mockResolvedValueOnce(null); 

      // With default agency_owner role, should pass auth
      const result = await caller.getDriftStatus({ clientId });
      expect(result.driftScore).toBe(0);
      expect(result.needsCalibration).toBe(false);
    });

    it('createDNASnapshot with valid access creates snapshot', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const clientId = '00000000-0000-0000-0000-000000000000';

      // Mock getBrandDNA
      mockDb.first.mockResolvedValueOnce({
        voice_entities: JSON.stringify({}),
        primary_tone: 'Neutral',
      });
      // Mock insert run
      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.createDNASnapshot({ clientId });
      expect(result.success).toBe(true);
      expect(result.snapshotId).toBeDefined();
    });
  });

  // Task 6.5: JSON.parse error tests - verify the error handling logic
  describe('JSON.parse error handling', () => {
    it('removeBannedWord handles malformed voice_entities gracefully', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const clientId = '00000000-0000-0000-0000-000000000000';

      // Mock getBrandDNA returning malformed JSON
      mockDb.first.mockResolvedValueOnce({ 
        voice_entities: '{ invalid json' 
      });
      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.removeBannedWord({ clientId, word: 'test' });
      
      // Should succeed and return empty list instead of throwing
      expect(result.success).toBe(true);
      expect(result.bannedWords).toEqual([]);
    });

    it('removeVoiceMarker handles malformed voice_entities gracefully', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const clientId = '00000000-0000-0000-0000-000000000000';

      // Mock getBrandDNA returning malformed JSON
      mockDb.first.mockResolvedValueOnce({ 
        voice_entities: '!!NOT_JSON!!' 
      });
      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.removeVoiceMarker({ clientId, phrase: 'test' });
      
      expect(result.success).toBe(true);
      expect(result.voiceMarkers).toEqual([]);
    });

    it('getBrandDNAReport handles malformed components gracefully', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const clientId = '00000000-0000-0000-0000-000000000000';

      mockDb.first.mockResolvedValueOnce({
        tone_profile: '{ bad }',
        signature_patterns: '["valid"]',
        topics_to_avoid: 'broken',
        strength_score: 50,
        primary_tone: 'Candid'
      });

      const result = await caller.getBrandDNAReport({ clientId });
      
      expect(result).not.toBeNull();
      expect(result?.signaturePhrases).toEqual(['valid']);
      // Should have defaulted tone match to 0 due to parse error
      expect(result?.breakdown.tone_match).toBe(0);
    });
  });

  describe('Safe DO Sync', () => {
    it('handles Durable Object failures gracefully in addBannedWord', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const clientId = '00000000-0000-0000-0000-000000000000';

      mockDb.first.mockResolvedValueOnce({ voice_entities: JSON.stringify({ bannedWords: [] }) });
      mockDb.run.mockResolvedValue({ success: true });
      
      // Simulate DO fetch failure
      ctx.callAgent = vi.fn().mockRejectedValue(new Error('DO Unavailable'));

      const result = await caller.addBannedWord({ clientId, word: 'forbidden' });
      
      expect(result.success).toBe(true);
      expect(result.doSyncFailed).toBe(true);
    });
  });
});
