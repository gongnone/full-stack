import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpokePlatform } from '../../../types';
import { TRPCError } from '@trpc/server';

// Removed createCallerFactory import and usage, will directly call procedures.
// import { createCallerFactory } from '@trpc/server/unstable-core-do-not-import';

// --- MOCK SETUP ---
// Declare mocks at the top level using vi.hoisted to ensure they are available for vi.mock
const mocks = vi.hoisted(() => ({
  mockAssertClientAccess: vi.fn(),
  mockCallAgent: vi.fn(),
}));

// Mock the middleware/client-access module BEFORE spokes.ts is imported
vi.mock('../../middleware/client-access', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../middleware/client-access')>();
  return {
    ...mod,
    assertClientAccess: mocks.mockAssertClientAccess,
  };
});

// Import the module under test AFTER the mock is established
import { spokesRouter } from '../spokes';
// --- END MOCK SETUP ---

describe('spokesRouter.clone', () => {
  const MOCK_CLIENT_ID = 'test-client-id';
  const MOCK_SPOKE_ID = '00000000-0000-0000-0000-000000000000';
  const MOCK_ORIGINAL_SPOKE = {
    id: MOCK_SPOKE_ID,
    hubId: 'test-hub-id',
    pillarId: 'test-pillar-id',
    platform: 'twitter' as SpokePlatform,
    content: 'Original content',
    status: 'ready',
    qualityScores: {},
    regenerationCount: 0,
    mutatedAt: null,
    parentSpokeId: null,
    createdAt: '2025-01-01T00:00:00Z',
    clonedFrom: null,
  };

  const mockCtx = {
    clientId: MOCK_CLIENT_ID,
    callAgent: mocks.mockCallAgent,
    callEngine: vi.fn(),
    env: {
      CONTENT_ENGINE: {
        fetch: vi.fn(),
      },
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockCallAgent.mockResolvedValue(MOCK_ORIGINAL_SPOKE); // Default mock for getSpoke
    mocks.mockAssertClientAccess.mockResolvedValue(undefined); // Reset mock for each test
    mockCtx.env.CONTENT_ENGINE.fetch.mockReset(); // Reset fetch mock as well
    mockCtx.callEngine.mockReset(); // Reset callEngine
  });

  it('should successfully clone a spoke in "exact" mode (AC3)', async () => {
    // 1st call: getSpoke, 2nd call: duplicateSpoke
    mocks.mockCallAgent
      .mockResolvedValueOnce(MOCK_ORIGINAL_SPOKE)
      .mockResolvedValueOnce({ id: 'new-spoke-id-exact' });

    const caller = spokesRouter.createCaller(mockCtx);
    const result = await caller.clone({
      clientId: MOCK_CLIENT_ID,
      spokeId: MOCK_SPOKE_ID,
      mode: 'exact',
    });

    expect(mocks.mockAssertClientAccess).toHaveBeenCalledWith(mockCtx, MOCK_CLIENT_ID);
    expect(mocks.mockCallAgent).toHaveBeenCalledWith(MOCK_CLIENT_ID, 'getSpoke', { spokeId: MOCK_SPOKE_ID });
    expect(mocks.mockCallAgent).toHaveBeenCalledWith(MOCK_CLIENT_ID, 'duplicateSpoke', {
      spokeId: MOCK_SPOKE_ID,
      clonedFrom: MOCK_SPOKE_ID,
    });
    expect(result).toEqual({
      newSpokeIds: ['new-spoke-id-exact'],
      status: 'complete',
      mode: 'exact',
      clonedFrom: MOCK_SPOKE_ID,
    });
  });

  it('should successfully clone a spoke in "platform" mode (AC5)', async () => {
    // 1st call: getSpoke, 2nd call: duplicateSpoke
    mocks.mockCallAgent
      .mockResolvedValueOnce(MOCK_ORIGINAL_SPOKE)
      .mockResolvedValueOnce({ id: 'new-spoke-id-platform' });
    const targetPlatform: SpokePlatform = 'linkedin';

    const caller = spokesRouter.createCaller(mockCtx);
    const result = await caller.clone({
      clientId: MOCK_CLIENT_ID,
      spokeId: MOCK_SPOKE_ID,
      mode: 'platform',
      targetPlatform,
    });

    expect(mocks.mockAssertClientAccess).toHaveBeenCalledWith(mockCtx, MOCK_CLIENT_ID);
    expect(mocks.mockCallAgent).toHaveBeenCalledWith(MOCK_CLIENT_ID, 'getSpoke', { spokeId: MOCK_SPOKE_ID });
    expect(mocks.mockCallAgent).toHaveBeenCalledWith(MOCK_CLIENT_ID, 'duplicateSpoke', {
      spokeId: MOCK_SPOKE_ID,
      clonedFrom: MOCK_SPOKE_ID,
      overrides: {
        platform: targetPlatform,
      },
    });
    expect(result).toEqual({
      newSpokeIds: ['new-spoke-id-platform'],
      status: 'complete',
      mode: 'platform',
      clonedFrom: MOCK_SPOKE_ID,
      targetPlatform,
    });
  });

  it('should throw ZodError if targetPlatform is missing for "platform" mode', async () => {
    const caller = spokesRouter.createCaller(mockCtx);
    await expect(
      caller.clone({
        clientId: MOCK_CLIENT_ID,
        spokeId: MOCK_SPOKE_ID,
        mode: 'platform',
        // targetPlatform is missing - Zod should catch this via superRefine
      } as any)
    ).rejects.toThrowError(/`targetPlatform` must be defined for `platform` mode/); 
  });

  it('should successfully clone a spoke in "variation" mode (AC4)', async () => {
    const VARIATION_COUNT = 3;
    const mockVariationResponse = {
      status: 'processing',
      parentSpokeId: MOCK_SPOKE_ID,
      variationsQueued: VARIATION_COUNT,
      instances: Array.from({ length: VARIATION_COUNT }).map((_, i) => ({
        instanceId: `instance-${i}`,
        spokeId: `variation-spoke-${i}`,
        platform: MOCK_ORIGINAL_SPOKE.platform,
      })),
    };
    mockCtx.callEngine.mockResolvedValueOnce(mockVariationResponse);

    const caller = spokesRouter.createCaller(mockCtx);
    const result = await caller.clone({
      clientId: MOCK_CLIENT_ID,
      spokeId: MOCK_SPOKE_ID,
      mode: 'variation',
      count: VARIATION_COUNT,
    });

    expect(mocks.mockAssertClientAccess).toHaveBeenCalledWith(mockCtx, MOCK_CLIENT_ID);
    expect(mocks.mockCallAgent).toHaveBeenCalledWith(MOCK_CLIENT_ID, 'getSpoke', { spokeId: MOCK_SPOKE_ID });
    expect(mockCtx.callEngine).toHaveBeenCalledWith(
      'http://internal/api/spokes/variations',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: MOCK_CLIENT_ID,
          parentSpokeId: MOCK_SPOKE_ID,
          count: VARIATION_COUNT,
        }),
      }
    );
    expect(result.newSpokeIds.length).toBe(VARIATION_COUNT);
    expect(result.mode).toBe('variation');
    expect(result.clonedFrom).toBe(MOCK_SPOKE_ID);
  });

  it('should throw an error if original spoke is not found', async () => {
    mocks.mockCallAgent.mockResolvedValue(null); // getSpoke returns null

    const caller = spokesRouter.createCaller(mockCtx);
    await expect(
      caller.clone({
        clientId: MOCK_CLIENT_ID,
        spokeId: '11111111-1111-1111-1111-111111111111',
        mode: 'exact',
      })
    ).rejects.toThrow(TRPCError);
    expect(mocks.mockAssertClientAccess).toHaveBeenCalledWith(mockCtx, MOCK_CLIENT_ID);
    expect(mocks.mockCallAgent).toHaveBeenCalledWith(MOCK_CLIENT_ID, 'getSpoke', { spokeId: '11111111-1111-1111-1111-111111111111' });
  });
});