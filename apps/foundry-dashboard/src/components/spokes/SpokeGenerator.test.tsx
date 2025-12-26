/**
 * Story 4.1: Deterministic Spoke Fracturing - E2E Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpokeGenerator, type GeneratedSpoke } from './SpokeGenerator';
import type { SpokePlatform } from '../../../worker/types';

describe('SpokeGenerator', () => {
  const mockHubId = 'hub-123';
  const mockPlatforms: SpokePlatform[] = ['twitter', 'linkedin'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders component with correct title', () => {
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);
      expect(screen.getByText('Spoke Generation')).toBeInTheDocument();
    });

    it('displays platform count in description', () => {
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);
      expect(screen.getByText(/Generating content for 2 platforms/i)).toBeInTheDocument();
    });

    it('shows Start Generation button initially', () => {
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);
      expect(screen.getByRole('button', { name: /Start Generation/i })).toBeInTheDocument();
    });

    it('displays selected platforms', () => {
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);
      expect(screen.getByText('twitter')).toBeInTheDocument();
      expect(screen.getByText('linkedin')).toBeInTheDocument();
    });
  });

  describe('Platform Selection', () => {
    it('renders all platform badges with icons', () => {
      const platforms: SpokePlatform[] = ['twitter', 'linkedin', 'tiktok', 'instagram'];
      render(<SpokeGenerator hubId={mockHubId} platforms={platforms} />);

      expect(screen.getByText('twitter')).toBeInTheDocument();
      expect(screen.getByText('linkedin')).toBeInTheDocument();
      expect(screen.getByText('tiktok')).toBeInTheDocument();
      expect(screen.getByText('instagram')).toBeInTheDocument();
    });

    it('uses default platforms when none provided', () => {
      render(<SpokeGenerator hubId={mockHubId} />);
      expect(screen.getByText('twitter')).toBeInTheDocument();
      expect(screen.getByText('linkedin')).toBeInTheDocument();
    });
  });

  describe('Generation Progress', () => {
    it('shows progress bar when generation starts', async () => {
      const user = userEvent.setup();
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);

      const startButton = screen.getByRole('button', { name: /Start Generation/i });
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByText(/Processing:/i)).toBeInTheDocument();
      });
    });

    it('displays progress percentage', async () => {
      const user = userEvent.setup();
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(() => {
        expect(screen.getByText(/\d+%/)).toBeInTheDocument();
      });
    });

    it('shows spoke count progress', async () => {
      const user = userEvent.setup();
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(() => {
        expect(screen.getByText(/spokes/i)).toBeInTheDocument();
      });
    });

    it('shows pillar count progress', async () => {
      const user = userEvent.setup();
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(() => {
        expect(screen.getByText(/pillars/i)).toBeInTheDocument();
      });
    });
  });

  describe('Quality Gate Summary', () => {
    it('displays quality gate summary when spokes are generated', async () => {
      const user = userEvent.setup();
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(
        () => {
          expect(screen.getByText('Quality Gate Summary')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('shows G2, G4, and G5 gate badges', async () => {
      const user = userEvent.setup();
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(
        () => {
          const gateBadges = screen.getAllByText(/G[245]/);
          expect(gateBadges.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );
    });

    it('displays pass/warning/fail counts for G2', async () => {
      const user = userEvent.setup();
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/Pass \(80\+\)/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('displays pass/fail counts for G4 and G5', async () => {
      const user = userEvent.setup();
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(
        () => {
          const passLabels = screen.getAllByText(/Pass/i);
          expect(passLabels.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Generated Spokes List', () => {
    it('displays list of generated spokes', async () => {
      const user = userEvent.setup();
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/Generated Spokes \(\d+\)/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('shows spoke content preview', async () => {
      const user = userEvent.setup();
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/Generated content for/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('displays platform icons for each spoke', async () => {
      const user = userEvent.setup();
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(
        () => {
          const platformTexts = screen.getAllByText(/twitter|linkedin/i);
          expect(platformTexts.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );
    });

    it('shows psychological angle badges', async () => {
      const user = userEvent.setup();
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(
        () => {
          expect(
            screen.getByText(/Contrarian|Authority|Curiosity/i)
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('displays gate badges for each spoke', async () => {
      const user = userEvent.setup();
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(
        () => {
          const gateBadges = screen.getAllByText(/G[245]/);
          expect(gateBadges.length).toBeGreaterThan(3); // Multiple spokes with gates
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Completion Actions', () => {
    it('shows Review Spokes button when generation completes', async () => {
      const user = userEvent.setup();
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /Review Spokes/i })).toBeInTheDocument();
        },
        { timeout: 7000 }
      );
    }, 10000);

    it('calls onGenerationComplete callback with generated spokes', async () => {
      const user = userEvent.setup();
      const handleComplete = vi.fn();
      render(
        <SpokeGenerator
          hubId={mockHubId}
          platforms={mockPlatforms}
          onGenerationComplete={handleComplete}
        />
      );

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(
        async () => {
          const reviewButton = screen.getByRole('button', { name: /Review Spokes/i });
          await user.click(reviewButton);
          expect(handleComplete).toHaveBeenCalledWith(
            expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                platform: expect.any(String),
                content: expect.any(String),
              }),
            ])
          );
        },
        { timeout: 7000 }
      );
    }, 10000);

    it('shows Cancel button when onCancel is provided', async () => {
      const user = userEvent.setup();
      const handleCancel = vi.fn();
      render(
        <SpokeGenerator
          hubId={mockHubId}
          platforms={mockPlatforms}
          onCancel={handleCancel}
        />
      );

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
        },
        { timeout: 7000 }
      );
    }, 10000);

    it('calls onCancel callback when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const handleCancel = vi.fn();
      render(
        <SpokeGenerator
          hubId={mockHubId}
          platforms={mockPlatforms}
          onCancel={handleCancel}
        />
      );

      await user.click(screen.getByRole('button', { name: /Start Generation/i }));

      await waitFor(
        async () => {
          const cancelButton = screen.getByRole('button', { name: /Cancel/i });
          await user.click(cancelButton);
          expect(handleCancel).toHaveBeenCalled();
        },
        { timeout: 7000 }
      );
    }, 10000);
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Spoke Generation');
    });

    it('buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<SpokeGenerator hubId={mockHubId} platforms={mockPlatforms} />);

      const startButton = screen.getByRole('button', { name: /Start Generation/i });
      startButton.focus();
      expect(startButton).toHaveFocus();
    });
  });
});
