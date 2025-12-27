/**
 * Story 3-1: StepSelectClient - Unit Tests
 * Auto-selects current user's client
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { StepSelectClient } from './StepSelectClient';

// Mock useClientId hook
const mockClientId = 'client-123';
vi.mock('@/lib/use-client-id', () => ({
  useClientId: () => mockClientId,
}));

// Mock WIZARD_CONFIG
vi.mock('@/lib/constants', () => ({
  WIZARD_CONFIG: {
    AUTO_ADVANCE_MS: 100,
  },
}));

describe('StepSelectClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders loading state', () => {
    render(<StepSelectClient selectedClientId={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Setting up workspace...')).toBeInTheDocument();
  });

  it('shows animated loading indicator', () => {
    const { container } = render(<StepSelectClient selectedClientId={null} onSelect={vi.fn()} />);
    const animatedDiv = container.querySelector('.animate-pulse');
    expect(animatedDiv).toBeInTheDocument();
  });

  it('auto-selects client after delay when no client selected', async () => {
    const onSelect = vi.fn();
    render(<StepSelectClient selectedClientId={null} onSelect={onSelect} />);

    expect(onSelect).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(onSelect).toHaveBeenCalledWith('client-123');
  });

  it('does not auto-select when client already selected', () => {
    const onSelect = vi.fn();
    render(<StepSelectClient selectedClientId="existing-client" onSelect={onSelect} />);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('clears timeout on unmount', () => {
    const onSelect = vi.fn();
    const { unmount } = render(<StepSelectClient selectedClientId={null} onSelect={onSelect} />);

    unmount();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onSelect).not.toHaveBeenCalled();
  });
});
