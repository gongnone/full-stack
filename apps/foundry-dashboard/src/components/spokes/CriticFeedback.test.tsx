/**
 * Story 4.2: Adversarial Critic Service - E2E Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CriticFeedback } from './CriticFeedback';
import type { G2Breakdown } from '@/components/ui/gate-badge';

describe('CriticFeedback', () => {
  const mockContent = 'This is a test spoke content about productivity hacks.';
  const mockSpokeId = 'spoke-123';

  const mockG2Breakdown: G2Breakdown = {
    hook: 85,
    pattern: 35,
    benefit: 25,
    curiosity: 20,
    notes: 'Strong hook with clear benefit signal',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders component with title', () => {
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
        />
      );
      expect(screen.getByText('Adversarial Critic Feedback')).toBeInTheDocument();
    });

    it('displays description text', () => {
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
        />
      );
      expect(screen.getByText(/AI critic evaluated this spoke/i)).toBeInTheDocument();
    });

    it('shows all three gate badges', () => {
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          g4Status="pass"
          g5Status="pass"
        />
      );

      const gateBadges = screen.getAllByText(/G[245]/);
      expect(gateBadges.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Overall Status Banner', () => {
    it('shows "Ready to Publish" when all gates pass', () => {
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          g4Status="pass"
          g5Status="pass"
        />
      );
      expect(screen.getByText('Ready to Publish')).toBeInTheDocument();
    });

    it('shows "Requires Revision" when a gate fails', () => {
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={50}
          g4Status="fail:tone_mismatch"
          g5Status="pass"
        />
      );
      expect(screen.getByText('Requires Revision')).toBeInTheDocument();
    });

    it('shows "Acceptable with Caution" when G2 is warning', () => {
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={65}
          g4Status="pass"
          g5Status="pass"
        />
      );
      expect(screen.getByText('Acceptable with Caution')).toBeInTheDocument();
    });

    it('displays appropriate status icon', () => {
      const { rerender } = render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          g4Status="pass"
          g5Status="pass"
        />
      );
      expect(screen.getByText('✓')).toBeInTheDocument();

      rerender(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={50}
          g4Status="fail:tone_mismatch"
          g5Status="pass"
        />
      );
      expect(screen.getByText('✗')).toBeInTheDocument();
    });
  });

  describe('Critic Notes', () => {
    it('displays critic notes when provided', () => {
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          criticNotes="Excellent hook but could improve curiosity gap"
        />
      );
      expect(screen.getByText(/Excellent hook but could improve curiosity gap/i)).toBeInTheDocument();
    });

    it('shows "Critic\'s Notes" heading when notes provided', () => {
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          criticNotes="Good work"
        />
      );
      expect(screen.getByText("Critic's Notes")).toBeInTheDocument();
    });

    it('does not show notes section when no notes provided', () => {
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
        />
      );
      expect(screen.queryByText("Critic's Notes")).not.toBeInTheDocument();
    });
  });

  describe('Gate Feedback Sections', () => {
    it('renders all three gate sections', () => {
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          g4Status="pass"
          g5Status="pass"
        />
      );
      expect(screen.getByText('Hook Strength Analysis')).toBeInTheDocument();
      expect(screen.getByText('Voice Alignment Check')).toBeInTheDocument();
      expect(screen.getByText('Platform Compliance')).toBeInTheDocument();
    });

    it('expands section when clicked', async () => {
      const user = userEvent.setup();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          g2Breakdown={mockG2Breakdown}
        />
      );

      const hookSection = screen.getByRole('button', {
        name: /Hook Strength Analysis/i,
      });
      await user.click(hookSection);

      // After expanding, both "Analysis" and "Suggestions" headings should appear
      // Use role='heading' to distinguish from button text
      expect(screen.getByRole('heading', { name: 'Analysis' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Suggestions' })).toBeInTheDocument();
    });

    it('collapses section when clicked again', async () => {
      const user = userEvent.setup();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          g2Breakdown={mockG2Breakdown}
        />
      );

      const hookSection = screen.getByRole('button', {
        name: /Hook Strength Analysis/i,
      });

      await user.click(hookSection);
      expect(screen.getByRole('heading', { name: 'Analysis' })).toBeInTheDocument();

      await user.click(hookSection);
      expect(screen.queryByRole('heading', { name: 'Analysis' })).not.toBeInTheDocument();
    });
  });

  describe('G2 Hook Strength', () => {
    it('displays G2 score in details', async () => {
      const user = userEvent.setup();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          g2Breakdown={mockG2Breakdown}
        />
      );

      await user.click(screen.getByRole('button', { name: /Hook Strength Analysis/i }));
      expect(screen.getByText(/Overall Score: 85\/100/i)).toBeInTheDocument();
    });

    it('displays breakdown components when provided', async () => {
      const user = userEvent.setup();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          g2Breakdown={mockG2Breakdown}
        />
      );

      await user.click(screen.getByRole('button', { name: /Hook Strength Analysis/i }));
      expect(screen.getByText(/Hook Strength: 85\/100/i)).toBeInTheDocument();
      expect(screen.getByText(/Pattern Interrupt: 35\/40/i)).toBeInTheDocument();
      expect(screen.getByText(/Benefit Signal: 25\/30/i)).toBeInTheDocument();
      expect(screen.getByText(/Curiosity Gap: 20\/30/i)).toBeInTheDocument();
    });

    it('shows failure suggestions when G2 score is low', async () => {
      const user = userEvent.setup();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={50}
        />
      );

      await user.click(screen.getByRole('button', { name: /Hook Strength Analysis/i }));
      expect(screen.getByText(/Hook is too weak/i)).toBeInTheDocument();
    });

    it('shows warning suggestions when G2 score is medium', async () => {
      const user = userEvent.setup();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={65}
        />
      );

      await user.click(screen.getByRole('button', { name: /Hook Strength Analysis/i }));
      expect(screen.getByText(/Hook could be stronger/i)).toBeInTheDocument();
    });

    it('shows success message when G2 score is high', async () => {
      const user = userEvent.setup();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
        />
      );

      await user.click(screen.getByRole('button', { name: /Hook Strength Analysis/i }));
      expect(screen.getByText(/Hook is strong - ready to publish/i)).toBeInTheDocument();
    });
  });

  describe('G4 Voice Alignment', () => {
    it('displays pass status for G4', async () => {
      const user = userEvent.setup();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          g4Status="pass"
        />
      );

      await user.click(screen.getByRole('button', { name: /Voice Alignment Check/i }));
      expect(screen.getByText(/Status: Pass/i)).toBeInTheDocument();
    });

    it('displays cosine similarity when provided', async () => {
      const user = userEvent.setup();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          g4Status="pass"
          g4Similarity={0.92}
        />
      );

      await user.click(screen.getByRole('button', { name: /Voice Alignment Check/i }));
      expect(screen.getByText(/Cosine Similarity: 92.0%/i)).toBeInTheDocument();
    });

    it('displays violations when G4 fails', async () => {
      const user = userEvent.setup();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          g4Status="fail:tone_mismatch"
          g4Violations={['Tone mismatch', 'Missing signature phrases']}
        />
      );

      await user.click(screen.getByRole('button', { name: /Voice Alignment Check/i }));
      expect(screen.getByText(/Tone mismatch/i)).toBeInTheDocument();
      expect(screen.getByText(/Missing signature phrases/i)).toBeInTheDocument();
    });
  });

  describe('G5 Platform Compliance', () => {
    it('displays pass status for G5', async () => {
      const user = userEvent.setup();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          g5Status="pass"
        />
      );

      await user.click(screen.getByRole('button', { name: /Platform Compliance/i }));
      expect(screen.getByText(/Status: Pass/i)).toBeInTheDocument();
    });

    it('displays violations when G5 fails', async () => {
      const user = userEvent.setup();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          g5Status="fail:char_limit"
          g5Violations={['Exceeds 280 character limit']}
        />
      );

      await user.click(screen.getByRole('button', { name: /Platform Compliance/i }));
      expect(screen.getByText(/Exceeds 280 character limit/i)).toBeInTheDocument();
    });
  });

  describe('Content Preview', () => {
    it('displays content preview section', () => {
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
        />
      );
      expect(screen.getByText('Content Preview')).toBeInTheDocument();
    });

    it('shows the spoke content', () => {
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
        />
      );
      expect(screen.getByText(mockContent)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('shows Accept button when onAccept is provided', () => {
      const handleAccept = vi.fn();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          onAccept={handleAccept}
        />
      );
      expect(screen.getByRole('button', { name: /Accept Anyway/i })).toBeInTheDocument();
    });

    it('shows Regenerate button when onReject is provided', () => {
      const handleReject = vi.fn();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          onReject={handleReject}
        />
      );
      expect(screen.getByRole('button', { name: /Regenerate/i })).toBeInTheDocument();
    });

    it('calls onAccept when Accept button is clicked', async () => {
      const user = userEvent.setup();
      const handleAccept = vi.fn();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          onAccept={handleAccept}
        />
      );

      await user.click(screen.getByRole('button', { name: /Accept Anyway/i }));
      expect(handleAccept).toHaveBeenCalledTimes(1);
    });

    it('calls onReject when Regenerate button is clicked', async () => {
      const user = userEvent.setup();
      const handleReject = vi.fn();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
          onReject={handleReject}
        />
      );

      await user.click(screen.getByRole('button', { name: /Regenerate/i }));
      expect(handleReject).toHaveBeenCalledTimes(1);
    });

    it('does not show actions when callbacks not provided', () => {
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
        />
      );
      expect(screen.queryByRole('button', { name: /Accept/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Regenerate/i })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
        />
      );
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'Adversarial Critic Feedback'
      );
    });

    it('section buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(
        <CriticFeedback
          spokeId={mockSpokeId}
          content={mockContent}
          g2Score={85}
        />
      );

      const hookSection = screen.getByRole('button', { name: /Hook Strength Analysis/i });
      hookSection.focus();
      expect(hookSection).toHaveFocus();

      await user.keyboard('{Enter}');
      // After pressing Enter, the section should expand and show "Analysis" heading
      expect(screen.getByRole('heading', { name: 'Analysis' })).toBeInTheDocument();
    });
  });
});
