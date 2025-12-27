/**
 * Story 4.1: GenerationProgress - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GenerationProgress } from './GenerationProgress';
import type { SpokeGenerationProgress } from '../../../worker/types';

describe('GenerationProgress', () => {
  describe('Null State', () => {
    it('returns null when progress is null', () => {
      const { container } = render(<GenerationProgress progress={null} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('In Progress State', () => {
    const inProgressData: SpokeGenerationProgress = {
      hub_id: 'hub-1',
      client_id: 'client-1',
      status: 'generating',
      total_spokes: 10,
      completed_spokes: 5,
      total_pillars: 4,
      completed_pillars: 2,
      current_pillar_id: 'pillar-1',
      current_pillar_name: 'Marketing',
      error_message: null,
      started_at: Date.now(),
      completed_at: null,
      updated_at: Date.now(),
    };

    it('shows generating title', () => {
      render(<GenerationProgress progress={inProgressData} />);

      expect(screen.getByText('Generating Spokes...')).toBeInTheDocument();
    });

    it('shows progress percentage', () => {
      render(<GenerationProgress progress={inProgressData} />);

      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('shows spoke count', () => {
      render(<GenerationProgress progress={inProgressData} />);

      expect(screen.getByText('5 / 10 spokes')).toBeInTheDocument();
    });

    it('shows pillar count', () => {
      render(<GenerationProgress progress={inProgressData} />);

      expect(screen.getByText('2 / 4 pillars')).toBeInTheDocument();
    });
  });

  describe('Completed State', () => {
    const completedData: SpokeGenerationProgress = {
      hub_id: 'hub-1',
      client_id: 'client-1',
      status: 'completed',
      total_spokes: 10,
      completed_spokes: 10,
      total_pillars: 4,
      completed_pillars: 4,
      current_pillar_id: null,
      current_pillar_name: null,
      error_message: null,
      started_at: Date.now() - 60000,
      completed_at: Date.now(),
      updated_at: Date.now(),
    };

    it('shows completion title', () => {
      render(<GenerationProgress progress={completedData} />);

      expect(screen.getByText('Generation Complete')).toBeInTheDocument();
    });

    it('shows 100% progress', () => {
      render(<GenerationProgress progress={completedData} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero total spokes', () => {
      const zeroData: SpokeGenerationProgress = {
        hub_id: 'hub-1',
        client_id: 'client-1',
        status: 'generating',
        total_spokes: 0,
        completed_spokes: 0,
        total_pillars: 0,
        completed_pillars: 0,
        current_pillar_id: null,
        current_pillar_name: null,
        error_message: null,
        started_at: Date.now(),
        completed_at: null,
        updated_at: Date.now(),
      };

      render(<GenerationProgress progress={zeroData} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('rounds percentage correctly', () => {
      const partialData: SpokeGenerationProgress = {
        hub_id: 'hub-1',
        client_id: 'client-1',
        status: 'generating',
        total_spokes: 3,
        completed_spokes: 1,
        total_pillars: 1,
        completed_pillars: 0,
        current_pillar_id: 'pillar-1',
        current_pillar_name: 'Test',
        error_message: null,
        started_at: Date.now(),
        completed_at: null,
        updated_at: Date.now(),
      };

      render(<GenerationProgress progress={partialData} />);

      expect(screen.getByText('33%')).toBeInTheDocument();
    });
  });
});
