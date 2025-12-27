/**
 * [P1] useClientId Hook Tests
 *
 * Tests for client ID retrieval hooks used throughout the application.
 * These hooks determine the current client context for multi-tenant operations.
 *
 * These tests verify the hooks work correctly when integrated with
 * the test mocking infrastructure.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useClientId, useRequiredClientId } from './use-client-id';

// The hooks are mocked in src/test/setup.tsx
// These tests verify the mocks work correctly and test override behavior

describe('[P1] useClientId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useClientId (default mock)', () => {
    it('returns the default mocked clientId', () => {
      // Given: The global mock returns 'client-1'
      // When: rendering the hook
      const { result } = renderHook(() => useClientId());

      // Then: returns the mocked clientId
      expect(result.current).toBe('client-1');
    });

    it('can be overridden to return different values', () => {
      // Given: Override the mock to return a different value
      vi.mocked(useClientId).mockReturnValueOnce('custom-client-id');

      // When: rendering the hook
      const { result } = renderHook(() => useClientId());

      // Then: returns the overridden value
      expect(result.current).toBe('custom-client-id');
    });

    it('can be overridden to return null (unauthenticated)', () => {
      // Given: Override the mock to return null
      vi.mocked(useClientId).mockReturnValueOnce(null);

      // When: rendering the hook
      const { result } = renderHook(() => useClientId());

      // Then: returns null
      expect(result.current).toBeNull();
    });
  });

  describe('useRequiredClientId (default mock)', () => {
    it('returns the default mocked clientId', () => {
      // Given: The global mock returns 'client-1'
      // When: rendering the hook
      const { result } = renderHook(() => useRequiredClientId());

      // Then: returns the mocked clientId
      expect(result.current).toBe('client-1');
    });

    it('can be overridden to return different values', () => {
      // Given: Override the mock to return a different value
      vi.mocked(useRequiredClientId).mockReturnValueOnce('agency-client-xyz');

      // When: rendering the hook
      const { result } = renderHook(() => useRequiredClientId());

      // Then: returns the overridden value
      expect(result.current).toBe('agency-client-xyz');
    });

  });

  describe('mock verification', () => {
    it('useClientId is properly mocked as a vi.fn()', () => {
      expect(vi.isMockFunction(useClientId)).toBe(true);
    });

    it('useRequiredClientId is properly mocked as a vi.fn()', () => {
      expect(vi.isMockFunction(useRequiredClientId)).toBe(true);
    });

    it('tracks call count for useClientId', () => {
      renderHook(() => useClientId());
      renderHook(() => useClientId());

      expect(useClientId).toHaveBeenCalledTimes(2);
    });
  });
});
