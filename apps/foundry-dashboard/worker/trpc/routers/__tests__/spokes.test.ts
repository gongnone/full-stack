import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpokePlatform } from '../../../types';
import { TRPCError } from '@trpc/server';
import { z } from 'zod'; // Import zod to make it available for schema definitions

// Removed createCallerFactory import and usage, will directly call procedures.
// import { createCallerFactory } from '@trpc/server/unstable-core-do-not-import';

// --- MOCK SETUP ---
// Declare mocks at the top level
const mockCallAgent = vi.fn();
let mockAssertClientAccess = vi.fn();

// Mock the middleware/client-access module BEFORE spokes.ts is imported
vi.mock('../../middleware/client-access', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../middleware/client-access')>();
  return {
    ...mod,
    assertClientAccess: mockAssertClientAccess,
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
    callAgent: mockCallAgent,
    env: {
      CONTENT_ENGINE: {
        fetch: vi.fn(),
      },
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCallAgent.mockResolvedValue(MOCK_ORIGINAL_SPOKE); // Default mock for getSpoke
    mockAssertClientAccess.mockResolvedValue(undefined); // Reset mock for each test
    mockCtx.env.CONTENT_ENGINE.fetch.mockReset(); // Reset fetch mock as well
  });

  it('should successfully clone a spoke in "exact" mode (AC3)', async () => {
    mockCallAgent.mockResolvedValueOnce({ id: 'new-spoke-id-exact' }); // for duplicateSpoke

    const caller = spokesRouter.createCaller(mockCtx);
    const result = await caller.clone({
      clientId: MOCK_CLIENT_ID,
      spokeId: MOCK_SPOKE_ID,
      mode: 'exact',
    });

    expect(mockAssertClientAccess).toHaveBeenCalledWith(mockCtx, MOCK_CLIENT_ID);
    expect(mockCallAgent).toHaveBeenCalledWith(MOCK_CLIENT_ID, 'getSpoke', { spokeId: MOCK_SPOKE_ID });
    expect(mockCallAgent).toHaveBeenCalledWith(MOCK_CLIENT_ID, 'duplicateSpoke', {
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
    mockCallAgent.mockResolvedValueOnce({ id: 'new-spoke-id-platform' }); // for duplicateSpoke
    const targetPlatform: SpokePlatform = 'linkedin';

    const caller = spokesRouter.createCaller(mockCtx);
    const result = await caller.clone({
      clientId: MOCK_CLIENT_ID,
      spokeId: MOCK_SPOKE_ID,
      mode: 'platform',
      targetPlatform,
    });

    expect(mockAssertClientAccess).toHaveBeenCalledWith(mockCtx, MOCK_CLIENT_ID);
    expect(mockCallAgent).toHaveBeenCalledWith(MOCK_CLIENT_ID, 'getSpoke', { spokeId: MOCK_SPOKE_ID });
    expect(mockCallAgent).toHaveBeenCalledWith(MOCK_CLIENT_ID, 'duplicateSpoke', {
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
    mockCallAgent.mockResolvedValueOnce(MOCK_ORIGINAL_SPOKE); 

    const caller = spokesRouter.createCaller(mockCtx);
    await expect(
      caller.clone({
        clientId: MOCK_CLIENT_ID,
        spokeId: MOCK_SPOKE_ID,
        mode: 'platform',
        // targetPlatform is missing - Zod should catch this via superRefine
      } as any)
    ).rejects.toThrowError(/`targetPlatform` must be defined for `platform` mode/); 
    // mockAssertClientAccess is called inside the procedure, but Zod validation happens BEFORE
    // Actually, TRPC inputs are validated before handler.
    // So assertClientAccess might NOT be called if validation fails.
    // expect(mockAssertClientAccess).toHaveBeenCalledWith(mockCtx, MOCK_CLIENT_ID); 
  });

  it('should successfully clone a spoke in "variation" mode (AC4)', async () => {
    const VARIATION_COUNT = 3;
    const mockContentEngineResponse = {
      ok: true,
      json: () => Promise.resolve({
        status: 'processing',
        parentSpokeId: MOCK_SPOKE_ID,
        variationsQueued: VARIATION_COUNT,
        instances: Array.from({ length: VARIATION_COUNT }).map((_, i) => ({
          instanceId: `instance-${i}`,
          spokeId: `variation-spoke-${i}`,
          platform: MOCK_ORIGINAL_SPOKE.platform,
        })),
      }),
    };
    mockCtx.env.CONTENT_ENGINE.fetch.mockResolvedValueOnce(mockContentEngineResponse);

    const caller = spokesRouter.createCaller(mockCtx);
    const result = await caller.clone({
      clientId: MOCK_CLIENT_ID,
      spokeId: MOCK_SPOKE_ID,
      mode: 'variation',
      count: VARIATION_COUNT,
    });

    expect(mockAssertClientAccess).toHaveBeenCalledWith(mockCtx, MOCK_CLIENT_ID);
    expect(mockCallAgent).toHaveBeenCalledWith(MOCK_CLIENT_ID, 'getSpoke', { spokeId: MOCK_SPOKE_ID });
    expect(mockCtx.env.CONTENT_ENGINE.fetch).toHaveBeenCalledWith(
      new Request('http://internal/api/spokes/variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: MOCK_CLIENT_ID,
          parentSpokeId: MOCK_SPOKE_ID,
          count: VARIATION_COUNT,
        }),
      })
    );
    expect(result.newSpokeIds.length).toBe(VARIATION_COUNT);
    expect(result.mode).toBe('variation');
    expect(result.clonedFrom).toBe(MOCK_SPOKE_ID);
  });

  it('should throw an error if original spoke is not found', async () => {
    mockCallAgent.mockResolvedValue(null); // getSpoke returns null

    const caller = spokesRouter.createCaller(mockCtx);
    await expect(
      caller.clone({
        clientId: MOCK_CLIENT_ID,
        spokeId: '11111111-1111-1111-1111-111111111111',
        mode: 'exact',
      })
    ).rejects.toThrow(TRPCError);
    expect(mockAssertClientAccess).toHaveBeenCalledWith(mockCtx, MOCK_CLIENT_ID);
    expect(mockCallAgent).toHaveBeenCalledWith(MOCK_CLIENT_ID, 'getSpoke', { spokeId: '11111111-1111-1111-1111-111111111111' });
  });
});